"""Configurarea backend-ului, citita din variabile de mediu.

Nimic nu e obligatoriu ca sa porneasca aplicatia local: fara DATABASE_URL se
foloseste un SQLite in folderul proiectului, iar fara cheie de email mesajele
sunt doar scrise in log. Asa poti testa totul inainte sa configurezi servicii.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent

load_dotenv(ROOT / ".env.local")
load_dotenv(ROOT / ".env")


def _bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, "").strip() or default)
    except ValueError:
        return default


def _list(name: str) -> list[str]:
    return [p.strip() for p in (os.getenv(name) or "").split(",") if p.strip()]


def _database_url() -> str:
    """Normalizeaza URL-ul bazei de date.

    Vercel/Heroku dau uneori "postgres://", iar SQLAlchemy vrea "postgresql://".
    """
    url = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("POSTGRES_PRISMA_URL")
        or ""
    ).strip()

    if not url:
        # Pe Vercel doar /tmp e scriptibil, si se pierde intre invocari —
        # e bun pentru o proba rapida, nu pentru productie.
        base = Path("/tmp") if os.getenv("VERCEL") else ROOT
        return f"sqlite:///{base / 'bluemarin.db'}"

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # psycopg2 nu accepta parametrii specifici Prisma.
    if "?" in url and "pgbouncer" in url:
        url = url.split("?", 1)[0]

    return url


@dataclass(frozen=True)
class Settings:
    # --- General ---
    secret_key: str = field(
        default_factory=lambda: os.getenv("SECRET_KEY") or os.getenv("FLASK_SECRET_KEY") or ""
    )
    debug: bool = field(default_factory=lambda: _bool("FLASK_DEBUG"))
    is_vercel: bool = field(default_factory=lambda: bool(os.getenv("VERCEL")))

    # --- Baza de date ---
    database_url: str = field(default_factory=_database_url)

    # --- Admin ---
    admin_email: str = field(default_factory=lambda: os.getenv("ADMIN_EMAIL", "").strip().lower())
    admin_password: str = field(default_factory=lambda: os.getenv("ADMIN_PASSWORD", ""))

    # --- Email ---
    resend_api_key: str = field(default_factory=lambda: os.getenv("RESEND_API_KEY", "").strip())
    mail_from: str = field(
        default_factory=lambda: os.getenv("MAIL_FROM", "Bluemarin Sport Club <noreply@bluemarin.ro>")
    )
    # Unde ajung notificarile de formular (implicit adresa clubului).
    mail_to: list[str] = field(
        default_factory=lambda: _list("MAIL_TO") or ["contact@bluemarin.ro"]
    )
    smtp_host: str = field(default_factory=lambda: os.getenv("SMTP_HOST", "").strip())
    smtp_port: int = field(default_factory=lambda: _int("SMTP_PORT", 587))
    smtp_user: str = field(default_factory=lambda: os.getenv("SMTP_USER", ""))
    smtp_password: str = field(default_factory=lambda: os.getenv("SMTP_PASSWORD", ""))

    # --- Stocare fisiere ---
    # "db" (implicit), "s3" (Cloudflare R2 / orice S3) sau "local" (doar dev).
    storage_backend: str = field(
        default_factory=lambda: os.getenv("STORAGE_BACKEND", "db").strip().lower()
    )
    s3_endpoint: str = field(default_factory=lambda: os.getenv("S3_ENDPOINT", "").strip())
    s3_bucket: str = field(default_factory=lambda: os.getenv("S3_BUCKET", "").strip())
    s3_access_key: str = field(default_factory=lambda: os.getenv("S3_ACCESS_KEY_ID", ""))
    s3_secret_key: str = field(default_factory=lambda: os.getenv("S3_SECRET_ACCESS_KEY", ""))
    s3_region: str = field(default_factory=lambda: os.getenv("S3_REGION", "auto"))
    local_storage_dir: Path = field(
        default_factory=lambda: Path(os.getenv("LOCAL_STORAGE_DIR", str(ROOT / "uploads")))
    )

    # --- Revalidare Next.js ---
    site_url: str = field(
        default_factory=lambda: (
            os.getenv("SITE_URL") or os.getenv("NEXT_PUBLIC_SITE_URL") or ""
        ).rstrip("/")
    )
    revalidate_secret: str = field(
        default_factory=lambda: os.getenv("REVALIDATE_SECRET", "").strip()
    )

    # --- Limite ---
    max_upload_mb: int = field(default_factory=lambda: _int("MAX_UPLOAD_MB", 8))
    # Cate trimiteri acceptam de la acelasi IP intr-o ora.
    rate_limit_per_hour: int = field(default_factory=lambda: _int("RATE_LIMIT_PER_HOUR", 12))

    # --- CORS ---
    # Necesar doar daca backend-ul sta pe alt domeniu decat frontend-ul.
    allowed_origins: list[str] = field(default_factory=lambda: _list("ALLOWED_ORIGINS"))

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @property
    def uses_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    def resolved_secret_key(self) -> str:
        """Cheia de sesiune. Daca lipseste, generam una temporara in dev."""
        if self.secret_key:
            return self.secret_key
        if self.debug or not self.is_vercel:
            # Doar pentru dezvoltare — sesiunile se invalideaza la restart.
            return "dev-insecure-" + os.urandom(16).hex()
        raise RuntimeError(
            "SECRET_KEY lipseste. Seteaza-l in variabilele de mediu inainte de deploy."
        )


settings = Settings()
