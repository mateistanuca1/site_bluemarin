"""Conexiunea la baza de date.

Pe Vercel fiecare request ruleaza intr-o functie separata, deci nu are rost sa
tinem un pool de conexiuni deschis — folosim NullPool si inchidem la final.
"""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from .config import settings

_connect_args: dict[str, object] = {}
if settings.uses_sqlite:
    _connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database_url,
    # In serverless, conexiunile persistente sunt un handicap, nu un avantaj.
    poolclass=NullPool if settings.is_vercel else None,
    pool_pre_ping=not settings.is_vercel,
    connect_args=_connect_args,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, future=True)


@contextmanager
def session_scope() -> Iterator[Session]:
    """Sesiune cu commit automat la ieșire si rollback la eroare."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db() -> None:
    """Creeaza tabelele care lipsesc. Sigur de apelat de mai multe ori."""
    from . import models  # noqa: F401  — inregistreaza modelele in metadata

    models.Base.metadata.create_all(engine)
