"""Anunta Next.js ca s-a schimbat continutul, ca sa reconstruiasca paginile.

Fara asta, o modificare din admin ar aparea pe site abia dupa expirarea
cache-ului (CONTENT_REVALIDATE, implicit 5 minute).
"""

from __future__ import annotations

import logging

import requests

from .config import settings

log = logging.getLogger(__name__)


def ping(key: str | None = None) -> bool:
    """Cere frontend-ului sa reincarce o colectie (sau tot continutul).

    Ruta nu sta sub /api pentru ca acolo raspunde chiar backend-ul asta.
    """
    if not settings.site_url or not settings.revalidate_secret:
        log.debug("Revalidare sarita: SITE_URL sau REVALIDATE_SECRET lipsesc.")
        return False

    try:
        res = requests.post(
            f"{settings.site_url}/revalidate",
            json={"key": key},
            headers={"X-Revalidate-Secret": settings.revalidate_secret},
            timeout=10,
        )
        if res.status_code >= 300:
            log.warning("Revalidarea a raspuns %s: %s", res.status_code, res.text[:200])
            return False
        return True
    except requests.RequestException as exc:
        log.warning("Revalidarea a eșuat: %s", exc)
        return False
