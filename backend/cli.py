"""Comenzi de administrare rulate din terminal.

    python -m backend.cli run                 — porneste serverul local
    python -m backend.cli seed [--overwrite]  — incarca content/*.json in baza de date
    python -m backend.cli create-admin        — creeaza un cont de admin
    python -m backend.cli check               — verifica ce e configurat si ce lipseste
"""

from __future__ import annotations

import argparse
import getpass
import sys

from sqlalchemy import select

from .config import settings
from .db import init_db, session_scope
from .models import AdminUser
from .security import hash_password


def cmd_run(args: argparse.Namespace) -> int:
    from .app import app

    init_db()
    print(f"Backend pornit pe http://{args.host}:{args.port}")
    print(f"  API:   http://{args.host}:{args.port}/api/health")
    print(f"  Admin: http://{args.host}:{args.port}/api/admin/")
    app.run(host=args.host, port=args.port, debug=settings.debug or args.debug)
    return 0


def cmd_seed(args: argparse.Namespace) -> int:
    from .seed import seed

    init_db()
    report = seed(overwrite=args.overwrite)
    width = max(len(k) for k in report)
    for key, status in report.items():
        print(f"  {key.ljust(width)}  {status}")
    return 0


def cmd_create_admin(args: argparse.Namespace) -> int:
    init_db()

    email = (args.email or input("Email: ")).strip().lower()
    if not email or "@" not in email:
        print("Email invalid.", file=sys.stderr)
        return 1

    password = args.password or getpass.getpass("Parola: ")
    if len(password) < 10:
        print("Parola trebuie sa aiba cel putin 10 caractere.", file=sys.stderr)
        return 1
    if not args.password:
        if password != getpass.getpass("Repeta parola: "):
            print("Parolele nu se potrivesc.", file=sys.stderr)
            return 1

    with session_scope() as db:
        existing = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if existing:
            existing.password_hash = hash_password(password)
            print(f"Parola pentru {email} a fost schimbata.")
        else:
            db.add(AdminUser(email=email, password_hash=hash_password(password)))
            print(f"Cont creat: {email}")

    return 0


def cmd_check(_args: argparse.Namespace) -> int:
    from sqlalchemy import text as sql_text

    from .db import engine

    def mark(ok: bool) -> str:
        return "OK  " if ok else "LIPSA"

    print("Configurare backend\n")

    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(sql_text("SELECT 1"))
    except Exception as exc:
        db_ok = False
        db_error = str(exc)[:120]

    kind = "SQLite (local)" if settings.uses_sqlite else "Postgres"
    print(f"  {mark(db_ok)}  Baza de date — {kind}")
    if not db_ok:
        print(f"         {db_error}")
    elif settings.uses_sqlite and settings.is_vercel:
        print("         ATENTIE: pe Vercel SQLite se pierde intre cereri. Seteaza DATABASE_URL.")

    has_mail = bool(settings.resend_api_key or settings.smtp_host)
    provider = "Resend" if settings.resend_api_key else "SMTP" if settings.smtp_host else "—"
    print(f"  {mark(has_mail)}  Email — {provider}")
    if not has_mail:
        print("         Fara RESEND_API_KEY sau SMTP_HOST, mesajele sunt doar scrise in log.")

    has_secret = bool(settings.secret_key)
    print(f"  {mark(has_secret)}  SECRET_KEY")
    if not has_secret:
        print("         Obligatoriu in productie, altfel sesiunile de admin nu rezista.")

    has_admin = bool(settings.admin_email and settings.admin_password)
    with_db_admin = False
    if db_ok:
        try:
            with session_scope() as db:
                with_db_admin = db.scalar(select(AdminUser).limit(1)) is not None
        except Exception:
            pass
    print(f"  {mark(has_admin or with_db_admin)}  Cont de admin")
    if not (has_admin or with_db_admin):
        print("         Ruleaza: python -m backend.cli create-admin")

    has_reval = bool(settings.site_url and settings.revalidate_secret)
    print(f"  {mark(has_reval)}  Revalidare Next.js")
    if not has_reval:
        print("         Fara SITE_URL + REVALIDATE_SECRET, modificarile apar dupa ~5 minute.")

    print(f"\n  Stocare fisiere: {settings.storage_backend}")
    print(f"  Limita upload:   {settings.max_upload_mb} MB")
    print(f"  Notificari la:   {', '.join(settings.mail_to)}")

    return 0 if db_ok else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="backend.cli", description="Administrare backend Bluemarin")
    sub = parser.add_subparsers(dest="command", required=True)

    p_run = sub.add_parser("run", help="porneste serverul local")
    p_run.add_argument("--host", default="127.0.0.1")
    p_run.add_argument("--port", type=int, default=5000)
    p_run.add_argument("--debug", action="store_true")
    p_run.set_defaults(func=cmd_run)

    p_seed = sub.add_parser("seed", help="incarca content/*.json in baza de date")
    p_seed.add_argument(
        "--overwrite", action="store_true", help="suprascrie si ce a fost editat din admin"
    )
    p_seed.set_defaults(func=cmd_seed)

    p_admin = sub.add_parser("create-admin", help="creeaza sau reseteaza un cont de admin")
    p_admin.add_argument("--email")
    p_admin.add_argument("--password", help="daca lipseste, se cere interactiv")
    p_admin.set_defaults(func=cmd_create_admin)

    p_check = sub.add_parser("check", help="verifica configurarea")
    p_check.set_defaults(func=cmd_check)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
