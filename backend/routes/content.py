"""API-ul de continut citit de Next.js la build si la revalidare."""

from __future__ import annotations

import json

from flask import Blueprint, jsonify
from sqlalchemy import select

from ..db import session_scope
from ..models import ContentBlock
from ..seed import KEYS, read_file

bp = Blueprint("content", __name__)


@bp.get("/content/<key>")
def get_content(key: str):
    """Continutul unei colectii.

    Intai din baza de date (ce a editat adminul), apoi din fisierul local.
    Daca nu exista nici una, intoarce {} si frontend-ul isi foloseste propria copie.
    """
    if key not in KEYS:
        return jsonify({"error": "Colecție necunoscută."}), 404

    try:
        with session_scope() as db:
            block = db.scalar(select(ContentBlock).where(ContentBlock.key == key))
            if block:
                return jsonify(json.loads(block.value))
    except Exception:
        # Baza de date indisponibila nu trebuie sa doboare site-ul.
        pass

    return jsonify(read_file(key) or {})


@bp.get("/content")
def list_content():
    """Lista colectiilor si cand au fost actualizate ultima data."""
    rows: dict[str, str | None] = {k: None for k in KEYS}
    try:
        with session_scope() as db:
            for block in db.scalars(select(ContentBlock)):
                if block.key in rows:
                    rows[block.key] = block.updated_at.isoformat()
    except Exception:
        pass

    return jsonify({"keys": rows})
