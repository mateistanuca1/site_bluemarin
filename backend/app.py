"""Aplicatia Flask.

Ruleaza la fel local (`npm run api`), pe Vercel (prin api/index.py) sau pe un
VPS cu gunicorn — nu exista cod specific unei platforme in afara de pool-ul de
conexiuni din db.py.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException, RequestEntityTooLarge

from .config import settings
from .db import init_db

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

log = logging.getLogger(__name__)

# API-ul si panoul de admin stau sub /api ca sa poata fi servite de pe acelasi
# domeniu cu site-ul, prin rescrierea din vercel.json.
API_PREFIX = "/api"


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder=None)

    app.config.update(
        SECRET_KEY=settings.resolved_secret_key(),
        MAX_CONTENT_LENGTH=settings.max_upload_bytes * 4,  # mai multe fisiere intr-o cerere
        JSON_SORT_KEYS=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=not settings.debug,
        PERMANENT_SESSION_LIFETIME=timedelta(hours=12),
        TRAP_HTTP_EXCEPTIONS=False,
    )

    from .routes.admin import bp as admin_bp
    from .routes.content import bp as content_bp
    from .routes.forms import bp as forms_bp

    app.register_blueprint(content_bp, url_prefix=API_PREFIX)
    app.register_blueprint(forms_bp, url_prefix=API_PREFIX)
    app.register_blueprint(admin_bp, url_prefix=f"{API_PREFIX}/admin")

    _register_health(app)
    _register_errors(app)
    _register_cors(app)

    # Creeaza tabelele daca lipsesc. Pe SQLite local e instant; pe Postgres
    # ruleaza o singura data, apoi e un no-op ieftin.
    try:
        init_db()
    except Exception:
        log.exception("Nu am putut initializa baza de date — API-ul porneste oricum.")

    return app


def _register_health(app: Flask) -> None:
    @app.get(f"{API_PREFIX}/health")
    def health():
        """Verificare rapida: merge aplicatia si vede baza de date?"""
        from sqlalchemy import text as sql_text

        from .db import engine

        db_ok = True
        try:
            with engine.connect() as conn:
                conn.execute(sql_text("SELECT 1"))
        except Exception:
            db_ok = False

        return jsonify(
            {
                "status": "ok" if db_ok else "degradat",
                "database": "conectat" if db_ok else "indisponibil",
                "storage": settings.storage_backend,
                "email": (
                    "resend"
                    if settings.resend_api_key
                    else "smtp"
                    if settings.smtp_host
                    else "neconfigurat"
                ),
            }
        ), (200 if db_ok else 503)


def _register_errors(app: Flask) -> None:
    @app.errorhandler(RequestEntityTooLarge)
    def too_large(_exc):
        return (
            jsonify(
                {
                    "error": (
                        f"Fisierele trimise sunt prea mari "
                        f"(maxim {settings.max_upload_mb} MB per fisier)."
                    )
                }
            ),
            413,
        )

    @app.errorhandler(HTTPException)
    def http_error(exc: HTTPException):
        # Paginile de admin primesc HTML, API-ul primeste JSON.
        if request.path.startswith(f"{API_PREFIX}/admin"):
            return exc
        return jsonify({"error": exc.description}), exc.code or 500

    @app.errorhandler(Exception)
    def unexpected(exc: Exception):
        log.exception("Eroare netratata la %s %s", request.method, request.path)
        if settings.debug:
            raise exc
        return (
            jsonify(
                {
                    "error": (
                        "A aparut o eroare pe server. Te rugam sa incerci din nou "
                        "sau sa ne suni la 0744 258 258."
                    )
                }
            ),
            500,
        )


def _register_cors(app: Flask) -> None:
    """CORS, necesar doar daca backend-ul sta pe alt domeniu decat site-ul.

    Pe Vercel, cu rewrite-ul din vercel.json, frontend-ul si API-ul sunt pe
    acelasi domeniu si nu e nevoie de nimic aici — lasa ALLOWED_ORIGINS gol.
    """
    if not settings.allowed_origins:
        return

    allow_headers = "Content-Type, Accept, X-Requested-With"
    allow_methods = "GET, POST, OPTIONS"

    @app.after_request
    def add_cors(response):
        origin = request.headers.get("Origin", "")
        if origin in settings.allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            # Trebuie trimise si la preflight-ul generat automat de Flask,
            # altfel browserul refuza cererea inainte sa o faca.
            response.headers["Access-Control-Allow-Headers"] = allow_headers
            response.headers["Access-Control-Allow-Methods"] = allow_methods
            response.headers["Access-Control-Max-Age"] = "3600"
            response.headers["Vary"] = "Origin"
        return response


app = create_app()
