#!/usr/bin/env python3
"""Obtine GOOGLE_REFRESH_TOKEN pentru contul clubului.

De ce e nevoie: serverul trebuie sa scrie in Google Sheets si sa incarce in
Drive in numele contului clubului. Un service account n-are spatiu propriu de
stocare, asa ca pe un cont Gmail obisnuit Drive refuza incarcarile. Tokenul de
reimprospatare rezolva asta — fisierele apartin contului si consuma din cele
15 GB ale lui.

Se ruleaza o singura data, pe calculatorul tau:

    python3 scripts/google-auth.py

Inainte, in Google Cloud Console (console.cloud.google.com):
  1. Creeaza un proiect
  2. APIs & Services -> Library -> activeaza "Google Sheets API" si "Google Drive API"
  3. APIs & Services -> OAuth consent screen -> External -> adauga contul
     clubului la "Test users"
  4. Credentials -> Create credentials -> OAuth client ID -> Desktop app
  5. Copiaza Client ID si Client secret
"""

from __future__ import annotations

import http.server
import json
import secrets
import socket
import sys
import threading
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

OUT = Path(__file__).resolve().parent.parent / "vercel-env.txt"

_received: dict[str, str] = {}


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        _received.update({k: v[0] for k, v in params.items()})

        body = (
            "<h2>Gata.</h2><p>Poți închide fila și să te întorci în terminal.</p>"
            if "code" in params
            else f"<h2>Autorizarea a eșuat.</h2><p>{params.get('error', ['?'])[0]}</p>"
        )
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(f"<meta charset='utf-8'>{body}".encode())

    def log_message(self, *args):  # tacem, altfel umple terminalul
        pass


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def post(url: str, data: dict) -> dict:
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body)
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read())


def main() -> int:
    print(__doc__.split("Inainte,")[0].strip())
    print()

    client_id = input("Client ID: ").strip()
    client_secret = input("Client secret: ").strip()
    if not client_id or not client_secret:
        print("Ambele sunt obligatorii.", file=sys.stderr)
        return 1

    port = free_port()
    redirect_uri = f"http://127.0.0.1:{port}"
    state = secrets.token_urlsafe(16)

    url = f"{AUTH_URL}?" + urllib.parse.urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        # „offline" + „consent" ne asigura ca primim refresh_token, nu doar access_token.
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    })

    server = http.server.HTTPServer(("127.0.0.1", port), Handler)
    threading.Thread(target=server.handle_request, daemon=True).start()

    print()
    print("Se deschide browserul. Autentifica-te cu contul clubului si accepta.")
    print("Daca nu se deschide, copiaza adresa de mai jos:\n")
    print(url, "\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass

    print("Astept raspunsul...")
    for _ in range(600):  # ~5 minute
        if _received:
            break
        threading.Event().wait(0.5)

    if "code" not in _received:
        print(f"Nu am primit codul. {_received.get('error', 'Ai inchis fila?')}", file=sys.stderr)
        return 1
    if _received.get("state") != state:
        print("State invalid — opresc, din precautie.", file=sys.stderr)
        return 1

    tokens = post(TOKEN_URL, {
        "code": _received["code"],
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    })

    refresh = tokens.get("refresh_token")
    if not refresh:
        print("Google n-a trimis refresh_token. Sterge accesul aplicatiei din",
              "https://myaccount.google.com/permissions si incearca din nou.", file=sys.stderr)
        return 1

    block = (
        "\n# --- Google Sheets + Drive (generat de scripts/google-auth.py) ---\n"
        f"GOOGLE_CLIENT_ID={client_id}\n"
        f"GOOGLE_CLIENT_SECRET={client_secret}\n"
        f"GOOGLE_REFRESH_TOKEN={refresh}\n"
        "# Din adresa foii:    docs.google.com/spreadsheets/d/<ASTA>/edit\n"
        "GOOGLE_SHEET_ID=\n"
        "# Din adresa folderului: drive.google.com/drive/folders/<ASTA>\n"
        "GOOGLE_DRIVE_FOLDER_ID=\n"
    )

    with OUT.open("a", encoding="utf-8") as f:
        f.write(block)

    print()
    print(f"Gata. Am scris datele in {OUT.name} (fisierul nu ajunge pe GitHub).")
    print("Mai completezi acolo GOOGLE_SHEET_ID si GOOGLE_DRIVE_FOLDER_ID,")
    print("apoi copiezi tot blocul in Vercel -> Settings -> Environment Variables.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
