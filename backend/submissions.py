"""Unde ajung datele trimise din formulare.

Doua destinatii, alese automat dupa ce e configurat:

**Google Sheets + Drive** — cand exista cheile Google. Randurile merg in aceleasi
file si cu aceleasi coloane ca la scriptul Apps Script, iar fisierele in acelasi
folder de Drive. Asa, cine deschidea foaia inainte o deschide la fel si acum.

**Baza de date** — altfel. E varianta cu panou de admin, filtre si export CSV.

Nimic nu se pierde in tacere: daca salvarea esueaza, `record` ridica exceptia,
iar ruta decide ce face mai departe — de obicei trimite oricum emailul, ca sa
ajunga datele la club chiar daca arhiva a cazut.
"""

from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, timezone

from . import google_api
from .config import settings

log = logging.getLogger(__name__)

# Filele din foaia de calcul, cu titlurile lor — identice cu cele vechi.
TABS: dict[str, tuple[str, list[str]]] = {
    "inscriere": (
        "Inscrieri",
        ["Data", "Cursant", "Data nașterii", "Părinte / reprezentant", "Telefon",
         "E-mail", "Locație", "Tip", "IP consimțământ", "Fișă PDF"],
    ),
    "contact": (
        "Contact",
        ["Data", "Nume", "E-mail", "Telefon", "Pachet", "Locație", "Vârstă",
         "Subiect", "Mesaj"],
    ),
    "pachet": (
        "Cereri abonament",
        ["Data", "Nume", "E-mail", "Telefon", "Pachet", "Locație", "Vârstă",
         "Subiect", "Mesaj"],
    ),
    "cariere": (
        "Cariere",
        ["Data", "Nume", "E-mail", "Telefon", "Mesaj", "CV"],
    ),
}


@dataclass
class Attachment:
    role: str
    filename: str
    content: bytes
    content_type: str


@dataclass
class Stored:
    """Unde a ajuns trimiterea si ce adrese au primit fisierele."""

    backend: str
    reference: str = ""
    links: dict[str, str] = field(default_factory=dict)


def active_backend() -> str:
    return "google" if google_api.enabled() else "sql"


def sanitize(value: str) -> str:
    """"Ștefan Țăranu" -> "Stefan_Taranu", pentru nume de fisiere."""
    value = unicodedata.normalize("NFKD", value or "")
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^A-Za-z0-9]+", "_", value).strip("_")
    return value[:60] or "fara_nume"


def is_adult(birth_date: str) -> bool:
    """Scriptul vechi avea un camp separat adult/minor; aici il deducem din varsta."""
    try:
        day, month, year = (int(p) for p in birth_date.split("/"))
    except (ValueError, AttributeError):
        return False
    today = datetime.now()
    years = today.year - year - ((today.month, today.day) < (month, day))
    return years >= 18


def _now_ro() -> str:
    return datetime.now(timezone.utc).astimezone().strftime("%d.%m.%Y %H:%M")


def _google_row(kind: str, f: dict, links: dict[str, str]) -> list[str]:
    """Randul scris in foaie, in ordinea coloanelor de mai sus."""
    if kind == "inscriere":
        return [
            _now_ro(), f.get("name", ""), f.get("birth_date", ""), f.get("legal_parent", ""),
            f.get("phone", ""), f.get("email", ""), f.get("location", ""),
            "adult" if is_adult(f.get("birth_date", "")) else "minor",
            f.get("consent_ip", ""), links.get("fisa-pdf", ""),
        ]
    if kind == "cariere":
        return [
            _now_ro(), f.get("name", ""), f.get("email", ""), f.get("phone", ""),
            f.get("message", ""), links.get("cv", ""),
        ]
    # contact si pachet au aceleasi coloane
    return [
        _now_ro(), f.get("name", ""), f.get("email", ""), f.get("phone", ""),
        f.get("package", ""), f.get("location", ""), f.get("age", ""),
        f.get("subject", ""), f.get("message", ""),
    ]


def _record_google(kind: str, fields: dict, attachments: list[Attachment]) -> Stored:
    tab, headers = TABS[kind]
    links: dict[str, str] = {}

    # Fisierele intai: adresele lor intra in rand.
    if settings.google_drive_folder_id:
        base = sanitize(fields.get("name", ""))
        for a in attachments:
            # Semnatura e deja in PDF; n-are rost ca fisier separat in folder.
            if a.role == "semnatura":
                continue
            suffix = a.filename.rsplit(".", 1)[-1] if "." in a.filename else "bin"
            name = f"{base}_{a.role}.{suffix}"
            try:
                links[a.role] = google_api.upload_file(name, a.content, a.content_type)
            except google_api.GoogleError as exc:
                # Un fisier pierdut nu trebuie sa piarda si randul din foaie.
                log.error("Incarcarea „%s” in Drive a esuat: %s", name, exc)

    google_api.ensure_tab(tab, headers)
    google_api.append_row(tab, _google_row(kind, fields, links))

    return Stored(backend="google", reference=tab, links=links)


def _record_sql(kind: str, fields: dict, attachments: list[Attachment]) -> Stored:
    from sqlalchemy import select  # noqa: F401  — tinut local, calea SQL e optionala

    from .db import session_scope
    from .models import StoredFile, Submission
    from .storage import save as save_file

    with session_scope() as db:
        submission = Submission(
            kind=kind,
            name=fields.get("name", ""),
            email=fields.get("email", ""),
            phone=fields.get("phone", ""),
            subject=fields.get("subject", ""),
            message=fields.get("message", ""),
            package=fields.get("package", ""),
            location=fields.get("location", ""),
            age=fields.get("age", ""),
            birth_date=fields.get("birth_date", ""),
            legal_parent=fields.get("legal_parent", ""),
            consent=True,
            consent_ip=fields.get("consent_ip", ""),
            user_agent=fields.get("user_agent", ""),
        )
        db.add(submission)
        db.flush()

        for a in attachments:
            stored = save_file(submission.id, a.role, a.filename, a.content, a.content_type)
            db.add(
                StoredFile(
                    submission_id=submission.id,
                    role=a.role,
                    filename=a.filename,
                    content_type=a.content_type,
                    size=len(a.content),
                    data=stored.data,
                    storage_key=stored.storage_key,
                )
            )

        return Stored(backend="sql", reference=str(submission.id))


def record(kind: str, fields: dict, attachments: list[Attachment] | None = None) -> Stored:
    """Salveaza o trimitere acolo unde e configurat. Ridica exceptie daca esueaza."""
    if kind not in TABS:
        raise ValueError(f"Tip de formular necunoscut: {kind}")

    attachments = attachments or []
    if google_api.enabled():
        return _record_google(kind, fields, attachments)
    return _record_sql(kind, fields, attachments)
