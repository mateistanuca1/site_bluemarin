"""Punctul de intrare pentru Vercel.

Runtime-ul Python de pe Vercel detecteaza automat o variabila WSGI numita `app`
si ii trimite cererile. Acelasi obiect e folosit si de gunicorn pe un VPS:

    gunicorn api.index:app
"""

import sys
from pathlib import Path

# Pe Vercel radacina proiectului nu e automat in sys.path.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app import app  # noqa: E402

__all__ = ["app"]
