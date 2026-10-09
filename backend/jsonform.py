"""Transforma JSON-ul de continut intr-un formular si inapoi.

Panoul de admin nu stie nimic despre structura fiecarei colectii: parcurge
JSON-ul si genereaza campuri pentru fiecare valoare simpla. Asa, daca adaugi
maine o cheie noua in content/home.json, apare automat si in admin.

Caile sunt de forma  "intro.paragraphs.0"  si se regasesc in atributul name
al fiecarui input.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

# Chei pe care nu le aratam in editor (comentarii interne).
HIDDEN_KEYS = {"_comment"}

# Peste atatea caractere, folosim textarea in loc de input.
LONG_TEXT = 90


@dataclass
class Field:
    path: str
    label: str
    value: Any
    kind: str  # "text" | "textarea" | "number" | "bool" | "html"


@dataclass
class Group:
    """Un obiect sau un element de listă, cu campurile si subgrupurile lui."""

    path: str
    label: str
    fields: list[Field] = field(default_factory=list)
    groups: list["Group"] = field(default_factory=list)
    # Elementele unei liste se afiseaza numerotate.
    is_list_item: bool = False


def _label(key: str) -> str:
    """"primaryCta" -> "Primary cta"; "0" -> "1"."""
    if key.isdigit():
        return f"#{int(key) + 1}"
    spaced = "".join(f" {c.lower()}" if c.isupper() else c for c in key)
    return spaced.replace("_", " ").replace("-", " ").strip().capitalize()


def _kind_for(key: str, value: str) -> str:
    if key == "html" or value.lstrip().startswith("<"):
        return "html"
    if "\n" in value or len(value) > LONG_TEXT:
        return "textarea"
    return "text"


def build(data: Any, path: str = "", label: str = "") -> Group:
    """Construieste arborele de campuri pornind de la JSON."""
    group = Group(path=path, label=label, is_list_item=path.rsplit(".", 1)[-1].isdigit())

    items: list[tuple[str, Any]]
    if isinstance(data, dict):
        items = [(k, v) for k, v in data.items() if k not in HIDDEN_KEYS]
    elif isinstance(data, list):
        items = [(str(i), v) for i, v in enumerate(data)]
    else:
        return group

    for key, value in items:
        child_path = f"{path}.{key}" if path else key

        if isinstance(value, (dict, list)):
            if isinstance(value, list) and value and not isinstance(value[0], (dict, list)):
                # Lista de valori simple ("plute", "baghete") — un camp per element.
                sub = Group(path=child_path, label=_label(key))
                for i, item in enumerate(value):
                    sub.fields.append(
                        Field(
                            path=f"{child_path}.{i}",
                            label=f"#{i + 1}",
                            value=item,
                            kind=_kind_for(key, str(item)),
                        )
                    )
                group.groups.append(sub)
            else:
                group.groups.append(build(value, child_path, _label(key)))
        elif isinstance(value, bool):
            group.fields.append(Field(child_path, _label(key), value, "bool"))
        elif isinstance(value, (int, float)):
            group.fields.append(Field(child_path, _label(key), value, "number"))
        else:
            text = "" if value is None else str(value)
            group.fields.append(Field(child_path, _label(key), text, _kind_for(key, text)))

    return group


def apply_form(original: Any, form: dict[str, str]) -> Any:
    """Scrie valorile din formular peste JSON-ul original.

    Lucram pe o copie a originalului, ca sa pastram tipurile si cheile ascunse
    pe care editorul nu le-a afisat.
    """
    import copy

    result = copy.deepcopy(original)

    for path, raw in form.items():
        if not path or path.startswith("_"):
            continue
        _set_path(result, path.split("."), raw)

    return result


def _set_path(node: Any, parts: list[str], raw: str) -> None:
    key = parts[0]

    if len(parts) > 1:
        if isinstance(node, list):
            if not key.isdigit() or int(key) >= len(node):
                return
            _set_path(node[int(key)], parts[1:], raw)
        elif isinstance(node, dict):
            if key not in node:
                return
            _set_path(node[key], parts[1:], raw)
        return

    # Ultimul segment — aici scriem, pastrand tipul valorii existente.
    if isinstance(node, list):
        if not key.isdigit() or int(key) >= len(node):
            return
        node[int(key)] = _coerce(node[int(key)], raw)
    elif isinstance(node, dict):
        if key not in node:
            return
        node[key] = _coerce(node[key], raw)


def _coerce(previous: Any, raw: str) -> Any:
    """Pastreaza tipul valorii vechi: numarul ramane numar, nu devine text."""
    if isinstance(previous, bool):
        return raw.strip().lower() in {"1", "true", "on", "da"}
    if isinstance(previous, int) and not isinstance(previous, bool):
        try:
            return int(raw.strip())
        except (ValueError, AttributeError):
            return previous
    if isinstance(previous, float):
        try:
            return float(raw.strip())
        except (ValueError, AttributeError):
            return previous
    return raw.replace("\r\n", "\n")


def checkbox_paths(group: Group) -> list[str]:
    """Caile campurilor bifabile — trebuie tratate separat la POST."""
    out = [f.path for f in group.fields if f.kind == "bool"]
    for sub in group.groups:
        out.extend(checkbox_paths(sub))
    return out
