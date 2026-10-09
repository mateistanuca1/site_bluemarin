"""Crearea membrului in Virtuagym.

Pasul asta il facea scriptul Google Apps Script. L-am mutat aici ca site-ul sa
nu mai depinda de Google: dupa o inscriere reusita, cursantul ajunge automat si
in softul de gestiune al clubului.

Nu e obligatoriu. Fara cheile VIRTUAGYM_*, pasul e sarit pur si simplu, iar
inscrierea merge mai departe. Daca Virtuagym raspunde cu eroare, o notam in log
si tot continuam — o inscriere salvata, cu PDF trimis, e mai importanta decat
sincronizarea imediata.
"""

from __future__ import annotations

import logging

import requests

from .config import settings

log = logging.getLogger(__name__)

API_URL = "https://api.virtuagym.com/api/v1/club/{club_id}/member/"


def enabled() -> bool:
    return bool(
        settings.virtuagym_api_key
        and settings.virtuagym_club_secret
        and settings.virtuagym_club_id
    )


def split_name(full_name: str) -> tuple[str, str]:
    """"Maria Elena Popescu" -> ("Maria Elena", "Popescu").

    Scriptul vechi trimitea data nasterii drept nume de familie; aici despartim
    numele cum trebuie, iar daca e un singur cuvant il lasam ca prenume.
    """
    parts = full_name.strip().split()
    if len(parts) < 2:
        return (full_name.strip(), "")
    return (" ".join(parts[:-1]), parts[-1])


def create_member(
    *,
    full_name: str,
    email: str,
    phone: str,
    external_id: str = "",
) -> int | None:
    """Creeaza sau actualizeaza membrul. Intoarce id-ul lui, sau None.

    Nu arunca niciodata: orice problema e doar scrisa in log.
    """
    if not enabled():
        return None

    first_name, last_name = split_name(full_name)
    url = API_URL.format(club_id=settings.virtuagym_club_id)

    try:
        response = requests.put(
            url,
            params={
                "club_secret": settings.virtuagym_club_secret,
                "api_key": settings.virtuagym_api_key,
            },
            json={
                "firstname": first_name,
                "lastname": last_name,
                "email": email,
                "phone": phone,
                "external_id": external_id,
                "active": True,
            },
            timeout=settings.virtuagym_timeout,
        )
    except requests.RequestException:
        log.exception("Virtuagym inaccesibil pentru %s", email)
        return None

    if response.status_code >= 400:
        log.error(
            "Virtuagym a raspuns cu %s pentru %s: %s",
            response.status_code,
            email,
            response.text[:300],
        )
        return None

    try:
        member_id = response.json()["result"]["member_id"]
    except (ValueError, KeyError, TypeError):
        log.error("Raspuns Virtuagym neasteptat pentru %s: %s", email, response.text[:300])
        return None

    log.info("Membru Virtuagym creat: %s (%s)", member_id, email)
    return int(member_id)
