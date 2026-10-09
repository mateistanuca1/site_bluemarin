"""Conexiunea la baza de date.

Pe Vercel fiecare request ruleaza intr-o functie separata, deci nu are rost sa
tinem un pool de conexiuni deschis — folosim NullPool si inchidem la final.
"""

from __future__ import annotations

import logging
from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from .config import settings

log = logging.getLogger(__name__)

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
    _add_missing_columns(models.Base)


def _add_missing_columns(base) -> None:
    """Adauga coloanele aparute dupa ce tabelul a fost deja creat.

    `create_all` creeaza doar tabele lipsa, nu si coloane noi, iar proiectul nu
    foloseste un sistem de migrari. Adaugam doar coloane optionale (NULL permis),
    care nu cer nicio valoare pentru randurile existente.
    """
    inspector = inspect(engine)

    for table in base.metadata.sorted_tables:
        if not inspector.has_table(table.name):
            continue

        existing = {c["name"] for c in inspector.get_columns(table.name)}
        for column in table.columns:
            if column.name in existing or not column.nullable:
                continue

            kind = column.type.compile(dialect=engine.dialect)
            statement = f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {kind}'
            try:
                with engine.begin() as conn:
                    conn.execute(text(statement))
                log.info("Coloana adaugata: %s.%s", table.name, column.name)
            except Exception:
                log.exception("Nu am putut adauga coloana %s.%s", table.name, column.name)
