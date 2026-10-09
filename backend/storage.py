"""Stocarea fisierelor incarcate.

Trei variante, alese prin STORAGE_BACKEND:

  "db"    — continutul sta in baza de date (implicit; merge fara configurare,
            potrivit pentru volumul unui club, dar atentie la limita de spatiu)
  "s3"    — Cloudflare R2 sau orice serviciu compatibil S3 (recomandat cand
            creste volumul; necesita boto3 si variabilele S3_*)
  "local" — pe disc, doar pentru dezvoltare (pe Vercel discul nu persista)
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from .config import settings


@dataclass
class Stored:
    """Rezultatul salvarii: ori bytes pentru DB, ori o cheie externa."""

    data: bytes | None
    storage_key: str | None


def _key_for(submission_id: int, role: str, filename: str) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y/%m")
    suffix = Path(filename).suffix.lower()[:10]
    return f"{stamp}/{submission_id}-{role}-{uuid.uuid4().hex[:10]}{suffix}"


def _s3_client():
    import boto3  # importat la cerere: nu e nevoie de el pe varianta implicita

    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint or None,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region,
    )


def save(submission_id: int, role: str, filename: str, content: bytes, content_type: str) -> Stored:
    """Pune fisierul la pastrare si intoarce ce trebuie scris in `stored_files`."""
    backend = settings.storage_backend

    if backend == "s3":
        key = _key_for(submission_id, role, filename)
        _s3_client().put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=content,
            ContentType=content_type or "application/octet-stream",
        )
        return Stored(data=None, storage_key=key)

    if backend == "local":
        key = _key_for(submission_id, role, filename)
        path = settings.local_storage_dir / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return Stored(data=None, storage_key=key)

    return Stored(data=content, storage_key=None)


def load(storage_key: str | None, data: bytes | None) -> bytes | None:
    """Citeste inapoi un fisier salvat, pentru descarcare din admin."""
    if data is not None:
        return data
    if not storage_key:
        return None

    if settings.storage_backend == "s3":
        obj = _s3_client().get_object(Bucket=settings.s3_bucket, Key=storage_key)
        return obj["Body"].read()

    if settings.storage_backend == "local":
        path = settings.local_storage_dir / storage_key
        return path.read_bytes() if path.exists() else None

    return None
