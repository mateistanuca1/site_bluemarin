"""Autentificare admin, limitare de trafic si validari de intrare."""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Any, Callable

from flask import g, jsonify, redirect, request, session, url_for
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from .config import settings
from .db import session_scope
from .models import AdminUser, RateHit

SESSION_KEY = "admin_email"

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$")


# --------------------------------------------------------------------------- #
# Parole si conturi
# --------------------------------------------------------------------------- #

def hash_password(raw: str) -> str:
    return generate_password_hash(raw, method="pbkdf2:sha256:600000")


def verify_login(email: str, password: str) -> bool:
    """Verifica datele de acces.

    Accepta fie un cont din baza de date, fie ADMIN_EMAIL/ADMIN_PASSWORD din
    variabilele de mediu — util ca sa poti intra prima data, inainte sa existe
    vreun cont salvat.
    """
    email = (email or "").strip().lower()
    if not email or not password:
        return False

    with session_scope() as db:
        user = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if user and check_password_hash(user.password_hash, password):
            user.last_login_at = datetime.now(timezone.utc)
            return True

    if settings.admin_email and settings.admin_password:
        # compare_digest pe ambele, ca sa nu scurgem informatie prin durata.
        from hmac import compare_digest

        ok_email = compare_digest(email, settings.admin_email)
        ok_pass = compare_digest(password, settings.admin_password)
        return ok_email and ok_pass

    return False


def login_session(email: str) -> None:
    session.clear()
    session[SESSION_KEY] = email.strip().lower()
    session.permanent = True


def logout_session() -> None:
    session.clear()


def current_admin() -> str | None:
    return session.get(SESSION_KEY)


def login_required(view: Callable[..., Any]) -> Callable[..., Any]:
    """Protejeaza paginile de admin."""

    @wraps(view)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        admin = current_admin()
        if not admin:
            return redirect(url_for("admin.login", next=request.path))
        g.admin = admin
        return view(*args, **kwargs)

    return wrapper


# --------------------------------------------------------------------------- #
# Limitare de trafic
# --------------------------------------------------------------------------- #

def client_ip() -> str:
    """IP-ul real al clientului, din spatele proxy-ului Vercel."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    return (request.remote_addr or "necunoscut")[:64]


def _hour_window() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(minute=0, second=0, microsecond=0)


def check_rate_limit() -> bool:
    """Incrementeaza contorul si spune daca mai are voie sa trimita.

    Returneaza True daca cererea e permisa.
    """
    limit = settings.rate_limit_per_hour
    if limit <= 0:
        return True

    ip = client_ip()
    window = _hour_window()

    try:
        with session_scope() as db:
            hit = db.scalar(
                select(RateHit).where(RateHit.ip == ip, RateHit.window_start == window)
            )
            if hit is None:
                db.add(RateHit(ip=ip, window_start=window, count=1))
                # Curata ferestrele vechi ca tabelul sa nu creasca la infinit.
                cutoff = window - timedelta(days=2)
                for old in db.scalars(select(RateHit).where(RateHit.window_start < cutoff)):
                    db.delete(old)
                return True

            if hit.count >= limit:
                return False

            hit.count += 1
            return True
    except IntegrityError:
        # Doua cereri simultane au creat acelasi rand — nu e un motiv sa blocam.
        return True
    except Exception:
        # Daca limitarea nu functioneaza, mai bine lasam formularul sa treaca
        # decat sa pierdem o cerere reala.
        return True


# --------------------------------------------------------------------------- #
# Validari de intrare
# --------------------------------------------------------------------------- #

class ValidationError(Exception):
    """Date de formular invalide — se intoarce 400 cu mesaj in romana."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def text(value: Any, *, field: str, required: bool = False, max_length: int = 255) -> str:
    raw = "" if value is None else str(value).strip()
    if required and not raw:
        raise ValidationError(f"Campul „{field}” este obligatoriu.")
    if len(raw) > max_length:
        raise ValidationError(f"Campul „{field}” este prea lung (maxim {max_length} caractere).")
    # Elimina caracterele de control, inclusiv injectiile de header prin \r\n.
    return "".join(ch for ch in raw if ch == "\n" or ch == "\t" or ord(ch) >= 32)


def email(value: Any, *, field: str = "E-mail", required: bool = True) -> str:
    raw = text(value, field=field, required=required, max_length=190).lower()
    if not raw:
        return ""
    if not EMAIL_RE.match(raw):
        raise ValidationError("Adresa de email nu pare valida.")
    return raw


def phone(value: Any, *, field: str = "Telefon", required: bool = True) -> str:
    raw = text(value, field=field, required=required, max_length=64)
    if not raw:
        return ""
    digits = re.sub(r"\D", "", raw)
    if len(digits) < 10:
        raise ValidationError("Introduceti un numar de telefon valid (minim 10 cifre).")
    return raw


def consent(value: Any) -> bool:
    """Acordul GDPR — obligatoriu pe toate formularele."""
    truthy = {"1", "true", "on", "yes", "da"}
    ok = value is True or (isinstance(value, str) and value.strip().lower() in truthy)
    if not ok:
        raise ValidationError("Trebuie sa accepti politica de confidentialitate.")
    return True


def birth_date(value: Any) -> str:
    """Valideaza "ZZ/LL/AAAA" si respinge datele inexistente."""
    raw = text(value, field="Data nasterii", required=True, max_length=16)
    try:
        day, month, year = (int(p) for p in raw.split("/"))
        parsed = datetime(year, month, day)
    except (ValueError, TypeError):
        raise ValidationError("Data nasterii nu este valida.") from None

    today = datetime.now()
    if parsed > today:
        raise ValidationError("Data nasterii nu poate fi in viitor.")
    if parsed.year < today.year - 100:
        raise ValidationError("Data nasterii nu este valida.")
    return f"{day:02d}/{month:02d}/{year}"


def json_error(message: str, status: int = 400):
    return jsonify({"error": message}), status
