"""Tabelele bazei de date."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class ContentBlock(Base):
    """O colectie de continut editabila din admin, ex. "home" sau "pricing".

    Valoarea e JSON-ul complet al colectiei, in aceeasi forma ca fisierele din
    content/. Daca un rand lipseste, frontend-ul foloseste fisierul local.
    """

    __tablename__ = "content_blocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )
    updated_by: Mapped[str | None] = mapped_column(String(190))


class AdminUser(Base):
    """Cont de acces la panoul de admin."""

    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(190), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Submission(Base):
    """Orice trimitere de formular: contact, cerere de pachet, CV sau inscriere.

    Le tinem in acelasi tabel ca sa existe un singur loc de unde se vad toate
    cererile, cu un `kind` care spune de unde a venit.
    """

    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # "contact" | "pachet" | "inscriere" | "cariere"
    kind: Mapped[str] = mapped_column(String(24), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(190), nullable=False, default="")
    email: Mapped[str] = mapped_column(String(190), nullable=False, default="")
    phone: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    subject: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")

    # Specifice cererii de pachet / inscrierii
    package: Mapped[str] = mapped_column(String(190), nullable=False, default="")
    location: Mapped[str] = mapped_column(String(190), nullable=False, default="")
    age: Mapped[str] = mapped_column(String(16), nullable=False, default="")

    # Specifice inscrierii complete
    birth_date: Mapped[str] = mapped_column(String(16), nullable=False, default="")
    legal_parent: Mapped[str] = mapped_column(String(190), nullable=False, default="")

    # Dovada consimtamantului
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    consent_ip: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    user_agent: Mapped[str] = mapped_column(String(255), nullable=False, default="")

    # Id-ul membrului creat in Virtuagym, daca sincronizarea a reusit.
    virtuagym_member_id: Mapped[int | None] = mapped_column(Integer)

    handled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False, index=True
    )


class StoredFile(Base):
    """Un fisier atasat unei trimiteri: document, aviz medical, semnatura sau PDF.

    Daca STORAGE_BACKEND e "db", continutul sta in coloana `data`. Altfel sta in
    S3/R2 sau pe disc, iar aici pastram doar cheia.
    """

    __tablename__ = "stored_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    submission_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    # "document" | "aviz-medical" | "semnatura" | "fisa-pdf" | "cv"
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Una din cele doua e completata, in functie de backend-ul de stocare.
    data: Mapped[bytes | None] = mapped_column(LargeBinary)
    storage_key: Mapped[str | None] = mapped_column(String(512))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )


class RateHit(Base):
    """Numarul de trimiteri pe IP si pe ora, pentru limitare.

    Tinut in baza de date pentru ca pe serverless nu exista memorie comuna
    intre invocari.
    """

    __tablename__ = "rate_hits"
    __table_args__ = (
        UniqueConstraint("ip", "window_start", name="uq_rate_ip_window"),
        Index("ix_rate_window", "window_start"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ip: Mapped[str] = mapped_column(String(64), nullable=False)
    # Inceputul orei curente, trunchiat.
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
