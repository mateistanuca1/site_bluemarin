"""Servirea pozelor incarcate din panoul de admin.

Adresa /api/media/<slug> e publica si e cea pe care o pun componentele React
in `src`. Pe Vercel ajunge aici prin rescrierea din vercel.json; local, prin
rescrierea din next.config.mjs.
"""

from __future__ import annotations

from flask import Blueprint, Response, abort
from sqlalchemy import select

from ..db import session_scope
from ..models import MediaAsset
from ..storage import load as load_file

bp = Blueprint("media", __name__)

# Slug-ul contine un sufix aleator si nu se schimba niciodata dupa incarcare,
# deci continutul poate fi tinut in cache cat de mult.
CACHE = "public, max-age=31536000, immutable"


@bp.get("/media/<slug>")
def serve(slug: str):
    with session_scope() as db:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.slug == slug))
        if asset is None:
            abort(404)
        content = load_file(asset.storage_key, asset.data)
        content_type = asset.content_type or "image/webp"

    if content is None:
        abort(404)

    return Response(
        content,
        mimetype=content_type,
        headers={
            "Cache-Control": CACHE,
            "Content-Length": str(len(content)),
            "X-Content-Type-Options": "nosniff",
        },
    )
