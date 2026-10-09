"""Trimiterea formularelor catre un Google Apps Script.

De ce exista asta
-----------------
Clubul are deja un Apps Script care primeste inscrierile, le scrie intr-un
Google Sheet, genereaza fisa PDF in Google Drive, trimite emailul de confirmare
si creeaza membrul in Virtuagym. Functioneaza, nu costa nimic si nu are nevoie
de baza de date — exact ce trebuie pe planul gratuit Vercel.

Modul `FORMS_BACKEND=apps-script` trimite formularele acolo in loc sa le scrie
in Postgres. Site-ul pastreaza validarile, limitarea de trafic si mesajele in
romana; Google face restul.

Cheia si URL-ul raman pe server — nu ajung niciodata in browser.
"""

from __future__ import annotations

import base64
import json
import logging

import requests

from .config import settings

log = logging.getLogger(__name__)


class AppsScriptError(RuntimeError):
    """Apps Script-ul nu a raspuns sau a raspuns cu eroare."""


def enabled() -> bool:
    return bool(settings.apps_script_url)


def _b64(content: bytes) -> str:
    return base64.b64encode(content).decode("ascii")


def send(form_type: str, fields: dict[str, str], files: dict[str, tuple[str, bytes, str]] | None = None) -> dict:
    """Trimite un formular catre Apps Script.

    `fields` sunt valori text simple. `files` e {nume_camp: (nume_fisier,
    continut, tip_mime)} — fisierele pleaca codificate base64, fiindca Apps
    Script citeste cel mai bine `application/x-www-form-urlencoded`.

    Intoarce JSON-ul raspunsului. Arunca `AppsScriptError` daca ceva nu merge.
    """
    if not settings.apps_script_url:
        raise AppsScriptError("APPS_SCRIPT_URL nu este configurat.")

    payload: dict[str, str] = {"formType": form_type, **{k: v for k, v in fields.items() if v}}

    if settings.apps_script_token:
        payload["token"] = settings.apps_script_token

    for field, (filename, content, content_type) in (files or {}).items():
        payload[field] = _b64(content)
        payload[f"{field}_name"] = filename
        payload[f"{field}_type"] = content_type

    try:
        # Apps Script raspunde cu 302 catre googleusercontent.com — requests
        # urmeaza redirectul automat.
        response = requests.post(
            settings.apps_script_url,
            data=payload,
            timeout=settings.apps_script_timeout,
        )
    except requests.RequestException as exc:
        raise AppsScriptError(f"Apps Script inaccesibil: {exc}") from exc

    if response.status_code >= 400:
        raise AppsScriptError(
            f"Apps Script a raspuns cu {response.status_code}: {response.text[:300]}"
        )

    text = response.text.strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Scriptul vechi raspundea cu text simplu la eroare ("Error: ...").
        raise AppsScriptError(f"Raspuns neasteptat de la Apps Script: {text[:300]}") from None

    if isinstance(data, dict) and data.get("status") not in (None, "succes", "success", "ok"):
        raise AppsScriptError(str(data.get("error") or data.get("message") or data))

    return data if isinstance(data, dict) else {"result": data}
