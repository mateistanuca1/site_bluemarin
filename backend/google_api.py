"""Acces la Google Sheets si Google Drive.

Scriptul Apps Script avea acces la Drive si Sheets implicit, pentru ca rula in
contul clubului. De pe un server trebuie sa ne autentificam explicit, si exista
doua feluri:

**Token OAuth de utilizator** (recomandat pentru conturi Gmail obisnuite)
    Autorizezi o singura data contul clubului si pastrezi `refresh_token`-ul.
    Fisierele incarcate apartin contului si consuma din cele 15 GB ale lui.

**Service account** (merge doar cu Google Workspace si Shared Drive)
    Mai simplu de configurat, dar atentie: un service account nu are spatiu
    propriu de stocare. Daca incarci intr-un folder obisnuit din My Drive,
    Google raspunde „storageQuotaExceeded". Pentru Sheets e in regula, pentru
    Drive are nevoie de un Shared Drive.

Folosim apelurile REST direct, cu `google-auth` doar pentru semnarea tokenului,
ca sa nu caram toata biblioteca `google-api-python-client` pe Vercel.
"""

from __future__ import annotations

import json
import logging
import threading
import time
from typing import Any

import requests

from .config import settings

log = logging.getLogger(__name__)

SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets"
DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files"
DRIVE_API = "https://www.googleapis.com/drive/v3/files"
TOKEN_URL = "https://oauth2.googleapis.com/token"

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

TIMEOUT = 30

# Tokenul e valabil ~1 ora. Il tinem in memorie cat traieste procesul; pe
# serverless asta inseamna de obicei o invocare, ceea ce e in regula.
_token_lock = threading.Lock()
_token_cache: dict[str, Any] = {"value": None, "expires": 0.0}


class GoogleError(Exception):
    """Apel esuat catre Google. Mesajul e deja pregatit pentru log."""


def enabled() -> bool:
    """Avem destula configurare cat sa scriem in Google?"""
    return bool(_auth_mode() and (settings.google_sheet_id or settings.google_drive_folder_id))


def _auth_mode() -> str | None:
    if settings.google_refresh_token and settings.google_client_id:
        return "oauth"
    if settings.google_service_account_json:
        return "service_account"
    return None


def _fetch_token() -> tuple[str, float]:
    mode = _auth_mode()

    if mode == "oauth":
        res = requests.post(
            TOKEN_URL,
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": settings.google_refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=TIMEOUT,
        )
        if res.status_code >= 300:
            raise GoogleError(f"Reinnoirea tokenului a esuat ({res.status_code}): {res.text[:300]}")
        payload = res.json()
        return payload["access_token"], time.time() + payload.get("expires_in", 3600) - 60

    if mode == "service_account":
        from google.auth.transport.requests import Request
        from google.oauth2 import service_account

        try:
            info = json.loads(settings.google_service_account_json)
        except json.JSONDecodeError as exc:
            raise GoogleError("GOOGLE_SERVICE_ACCOUNT_JSON nu e JSON valid.") from exc

        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
        creds.refresh(Request())
        expiry = creds.expiry.timestamp() - 60 if creds.expiry else time.time() + 3000
        return creds.token, expiry

    raise GoogleError("Google nu e configurat.")


def _token() -> str:
    with _token_lock:
        if _token_cache["value"] and time.time() < _token_cache["expires"]:
            return _token_cache["value"]
        value, expires = _fetch_token()
        _token_cache.update(value=value, expires=expires)
        return value


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {_token()}"}


# --------------------------------------------------------------------------- #
# Sheets
# --------------------------------------------------------------------------- #

def append_row(tab: str, values: list[Any]) -> None:
    """Adauga un rand la finalul unei file din foaia de calcul."""
    sheet_id = settings.google_sheet_id
    if not sheet_id:
        raise GoogleError("GOOGLE_SHEET_ID lipseste.")

    # Ghilimelele permit nume de fila cu spatii sau diacritice.
    rng = f"'{tab}'!A1"
    res = requests.post(
        f"{SHEETS_API}/{sheet_id}/values/{requests.utils.quote(rng, safe='')}:append",
        params={"valueInputOption": "USER_ENTERED", "insertDataOption": "INSERT_ROWS"},
        headers=_headers(),
        json={"values": [["" if v is None else str(v) for v in values]]},
        timeout=TIMEOUT,
    )
    if res.status_code >= 300:
        raise GoogleError(f"Scrierea in Sheets a esuat ({res.status_code}): {res.text[:300]}")


def ensure_tab(tab: str, headers: list[str]) -> None:
    """Creeaza fila si randul de titluri, daca nu exista deja.

    Apelata o data la fiecare trimitere; daca fila exista, Google raspunde cu o
    eroare pe care o ignoram, ca sa nu mai facem un apel de verificare separat.
    """
    sheet_id = settings.google_sheet_id
    if not sheet_id:
        return

    res = requests.post(
        f"{SHEETS_API}/{sheet_id}:batchUpdate",
        headers=_headers(),
        json={"requests": [{"addSheet": {"properties": {"title": tab}}}]},
        timeout=TIMEOUT,
    )
    if res.status_code < 300:
        # Fila tocmai a fost creata — punem titlurile.
        append_row(tab, headers)
    elif "already exists" not in res.text:
        log.warning("Nu am putut pregati fila „%s”: %s", tab, res.text[:200])


# --------------------------------------------------------------------------- #
# Drive
# --------------------------------------------------------------------------- #

def upload_file(name: str, content: bytes, content_type: str, folder_id: str | None = None) -> str:
    """Incarca un fisier in Drive si intoarce adresa lui de vizualizare."""
    folder = folder_id or settings.google_drive_folder_id
    if not folder:
        raise GoogleError("GOOGLE_DRIVE_FOLDER_ID lipseste.")

    metadata = {"name": name, "parents": [folder]}
    files = {
        "metadata": ("metadata", json.dumps(metadata), "application/json; charset=UTF-8"),
        "file": (name, content, content_type),
    }

    res = requests.post(
        DRIVE_UPLOAD,
        params={"uploadType": "multipart", "supportsAllDrives": "true", "fields": "id,webViewLink"},
        headers=_headers(),
        files=files,
        timeout=TIMEOUT,
    )
    if res.status_code >= 300:
        detail = res.text[:300]
        if "storageQuotaExceeded" in detail:
            raise GoogleError(
                "Drive a refuzat incarcarea: service account-ul nu are spatiu propriu. "
                "Foloseste un token OAuth al contului clubului (GOOGLE_REFRESH_TOKEN) "
                "sau muta folderul intr-un Shared Drive."
            )
        raise GoogleError(f"Incarcarea in Drive a esuat ({res.status_code}): {detail}")

    payload = res.json()
    return payload.get("webViewLink") or f"https://drive.google.com/file/d/{payload['id']}/view"


def check() -> dict[str, str]:
    """Verificare rapida, folosita de `backend.cli check`."""
    out: dict[str, str] = {"mod": _auth_mode() or "neconfigurat"}

    if not _auth_mode():
        return out

    try:
        _token()
        out["token"] = "ok"
    except Exception as exc:
        out["token"] = f"esuat — {exc}"
        return out

    if settings.google_sheet_id:
        res = requests.get(
            f"{SHEETS_API}/{settings.google_sheet_id}",
            params={"fields": "properties.title,sheets.properties.title"},
            headers=_headers(),
            timeout=TIMEOUT,
        )
        out["sheet"] = (
            res.json()["properties"]["title"] if res.status_code < 300
            else f"inaccesibil ({res.status_code})"
        )

    if settings.google_drive_folder_id:
        res = requests.get(
            f"{DRIVE_API}/{settings.google_drive_folder_id}",
            params={"fields": "name", "supportsAllDrives": "true"},
            headers=_headers(),
            timeout=TIMEOUT,
        )
        out["folder"] = (
            res.json().get("name", "?") if res.status_code < 300
            else f"inaccesibil ({res.status_code})"
        )

    return out
