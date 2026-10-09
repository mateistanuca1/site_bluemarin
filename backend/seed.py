"""Incarca fisierele din content/*.json in baza de date.

Rulat o singura data la instalare. Dupa asta, continutul se editeaza din admin.
"""

from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import select

from .config import ROOT
from .db import session_scope
from .models import ContentBlock

CONTENT_DIR = ROOT / "content"

# Cheile pe care le serveste API-ul si le poate edita adminul.
KEYS = [
    "site",
    "home",
    "courses",
    "kids",
    "team",
    "locations",
    "pricing",
    "gallery",
    "careers",
    "contact",
    "rules",
    "legal",
]


def read_file(key: str) -> dict | None:
    path = CONTENT_DIR / f"{key}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def seed(overwrite: bool = False) -> dict[str, str]:
    """Scrie continutul in baza de date.

    overwrite=False pastreaza ce ai editat deja din admin si adauga doar ce lipseste.
    """
    report: dict[str, str] = {}

    with session_scope() as db:
        for key in KEYS:
            data = read_file(key)
            if data is None:
                report[key] = "lipsește fișierul"
                continue

            existing = db.scalar(select(ContentBlock).where(ContentBlock.key == key))
            payload = json.dumps(data, ensure_ascii=False)

            if existing is None:
                db.add(ContentBlock(key=key, value=payload, updated_by="seed"))
                report[key] = "adăugat"
            elif overwrite:
                existing.value = payload
                existing.updated_by = "seed"
                report[key] = "suprascris"
            else:
                report[key] = "păstrat"

    return report
