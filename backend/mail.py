"""Trimiterea emailurilor.

Trei variante, in ordinea in care sunt incercate:
  1. Resend (RESEND_API_KEY) — recomandat, 3.000 emailuri/luna gratis
  2. SMTP (SMTP_HOST etc.) — orice furnizor clasic
  3. Nimic configurat — mesajul e doar scris in log, ca sa poti testa local
"""

from __future__ import annotations

import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage

import requests

from .config import settings

log = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"


@dataclass
class Attachment:
    filename: str
    content: bytes
    content_type: str = "application/octet-stream"


def send(
    *,
    to: list[str],
    subject: str,
    text_body: str,
    html_body: str | None = None,
    reply_to: str | None = None,
    attachments: list[Attachment] | None = None,
) -> bool:
    """Trimite un email. Nu arunca excepții — doar raporteaza reusita."""
    recipients = [a for a in to if a]
    if not recipients:
        log.warning("Email fara destinatar: %s", subject)
        return False

    if settings.resend_api_key:
        return _send_resend(recipients, subject, text_body, html_body, reply_to, attachments)
    if settings.smtp_host:
        return _send_smtp(recipients, subject, text_body, html_body, reply_to, attachments)

    log.info(
        "EMAIL NETRIMIS (niciun furnizor configurat)\n  catre: %s\n  subiect: %s\n%s",
        ", ".join(recipients),
        subject,
        text_body,
    )
    return False


def _send_resend(
    to: list[str],
    subject: str,
    text_body: str,
    html_body: str | None,
    reply_to: str | None,
    attachments: list[Attachment] | None,
) -> bool:
    import base64

    payload: dict[str, object] = {
        "from": settings.mail_from,
        "to": to,
        "subject": subject,
        "text": text_body,
    }
    if html_body:
        payload["html"] = html_body
    if reply_to:
        payload["reply_to"] = reply_to
    if attachments:
        payload["attachments"] = [
            {
                "filename": a.filename,
                "content": base64.b64encode(a.content).decode("ascii"),
            }
            for a in attachments
        ]

    try:
        res = requests.post(
            RESEND_URL,
            json=payload,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            timeout=20,
        )
        if res.status_code >= 300:
            log.error("Resend a raspuns %s: %s", res.status_code, res.text[:500])
            return False
        return True
    except requests.RequestException as exc:
        log.error("Resend a eșuat: %s", exc)
        return False


def _send_smtp(
    to: list[str],
    subject: str,
    text_body: str,
    html_body: str | None,
    reply_to: str | None,
    attachments: list[Attachment] | None,
) -> bool:
    msg = EmailMessage()
    msg["From"] = settings.mail_from
    msg["To"] = ", ".join(to)
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to

    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    for a in attachments or []:
        main, _, sub = a.content_type.partition("/")
        msg.add_attachment(
            a.content,
            maintype=main or "application",
            subtype=sub or "octet-stream",
            filename=a.filename,
        )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
            smtp.starttls()
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
        return True
    except (smtplib.SMTPException, OSError) as exc:
        log.error("SMTP a eșuat: %s", exc)
        return False
