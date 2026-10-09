"""Formularele publice: contact, cerere de abonament, cariere si inscriere."""

from __future__ import annotations

import base64
import binascii
import logging
from datetime import datetime, timezone
from html import escape

from flask import Blueprint, jsonify, request
from werkzeug.datastructures import FileStorage

from .. import security as sec
from ..config import settings
from ..db import session_scope
from ..mail import Attachment, send
from ..models import StoredFile, Submission
from ..pdf import EnrollmentData, build_enrollment_pdf
from ..storage import save as store_file

log = logging.getLogger(__name__)

bp = Blueprint("forms", __name__)

CLUB = "Bluemarin Sport Club"

ALLOWED_UPLOAD_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
}

CV_EXTRA_TYPES = {
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


# --------------------------------------------------------------------------- #
# Ajutoare
# --------------------------------------------------------------------------- #

def _payload() -> dict:
    """Datele formularului, fie ca vin ca JSON, fie ca multipart."""
    if request.is_json:
        return request.get_json(silent=True) or {}
    return request.form.to_dict()


def _check_file(
    f: FileStorage | None, *, label: str, allowed: set[str], required: bool = True
) -> tuple[bytes, str, str] | None:
    """Citeste si valideaza un fisier incarcat. Intoarce (continut, nume, tip)."""
    if f is None or not f.filename:
        if required:
            raise sec.ValidationError(f"Atașează {label}.")
        return None

    content = f.read()
    if not content:
        raise sec.ValidationError(f"Fișierul pentru {label} este gol.")
    if len(content) > settings.max_upload_bytes:
        raise sec.ValidationError(
            f"Fișierul pentru {label} este prea mare (maxim {settings.max_upload_mb} MB)."
        )

    content_type = (f.mimetype or "").lower()
    if content_type not in allowed:
        raise sec.ValidationError(
            f"Formatul fișierului pentru {label} nu este acceptat. "
            "Folosește o imagine (JPG, PNG) sau un PDF."
        )

    from werkzeug.utils import secure_filename

    name = secure_filename(f.filename) or "fisier"
    return content, name[:255], content_type


def _persist(db, submission: Submission, files: list[tuple[str, bytes, str, str]]) -> None:
    """Salveaza fisierele atasate unei trimiteri deja inserate (cu id)."""
    for role, content, filename, content_type in files:
        stored = store_file(submission.id, role, filename, content, content_type)
        db.add(
            StoredFile(
                submission_id=submission.id,
                role=role,
                filename=filename,
                content_type=content_type,
                size=len(content),
                data=stored.data,
                storage_key=stored.storage_key,
            )
        )


def _rows_html(rows: list[tuple[str, str]]) -> str:
    cells = "".join(
        f'<tr><td style="padding:6px 14px 6px 0;color:#7a7a7a;white-space:nowrap">{escape(k)}</td>'
        f'<td style="padding:6px 0;color:#151515"><strong>{escape(v or "—")}</strong></td></tr>'
        for k, v in rows
    )
    return (
        '<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'
        f'<table style="border-collapse:collapse">{cells}</table></div>'
    )


def _rows_text(rows: list[tuple[str, str]]) -> str:
    return "\n".join(f"{k}: {v or '—'}" for k, v in rows)


def _guard():
    """Verificari comune: limita de trafic si capcana pentru roboti."""
    if (_payload().get("website") or "").strip():
        # Camp ascuns completat doar de boti — raspundem ca si cum ar fi mers.
        return jsonify({"message": "Mesajul a fost trimis."})
    if not sec.check_rate_limit():
        return sec.json_error(
            "Ai trimis prea multe cereri in ultima ora. Te rugam sa ne suni la 0744 258 258.",
            429,
        )
    return None


# --------------------------------------------------------------------------- #
# Contact
# --------------------------------------------------------------------------- #

@bp.post("/contact")
def contact():
    blocked = _guard()
    if blocked:
        return blocked

    data = _payload()
    try:
        name = sec.text(data.get("name"), field="Nume", required=True, max_length=190)
        email_addr = sec.email(data.get("email"))
        subject = sec.text(data.get("subject"), field="Subiect", max_length=255)
        message = sec.text(data.get("message"), field="Mesaj", required=True, max_length=5000)
        sec.consent(data.get("gdpr", True))
    except sec.ValidationError as exc:
        return sec.json_error(exc.message)

    with session_scope() as db:
        db.add(
            Submission(
                kind="contact",
                name=name,
                email=email_addr,
                subject=subject,
                message=message,
                consent=True,
                consent_ip=sec.client_ip(),
                user_agent=request.headers.get("User-Agent", "")[:255],
            )
        )

    rows = [("Nume", name), ("Email", email_addr), ("Subiect", subject), ("Mesaj", message)]
    send(
        to=settings.mail_to,
        subject=f"[Site] Mesaj nou de la {name}",
        text_body=_rows_text(rows),
        html_body=_rows_html(rows),
        reply_to=email_addr,
    )

    return jsonify({"message": "Mesajul a fost trimis. Te contactam in cel mai scurt timp!"})


# --------------------------------------------------------------------------- #
# Cerere de abonament (popup-ul de pe cardul de tarif)
# --------------------------------------------------------------------------- #

@bp.post("/cerere-pachet")
def package_request():
    blocked = _guard()
    if blocked:
        return blocked

    data = _payload()
    try:
        name = sec.text(data.get("name"), field="Nume", required=True, max_length=190)
        email_addr = sec.email(data.get("email"))
        phone = sec.phone(data.get("phone"))
        age = sec.text(data.get("age"), field="Vârstă", max_length=16)
        message = sec.text(data.get("message"), field="Preferințe", max_length=2000)
        package = sec.text(data.get("package"), field="Pachet", max_length=190)
        location = sec.text(data.get("location"), field="Locație", max_length=190)
        sec.consent(data.get("gdpr", True))
    except sec.ValidationError as exc:
        return sec.json_error(exc.message)

    with session_scope() as db:
        db.add(
            Submission(
                kind="pachet",
                name=name,
                email=email_addr,
                phone=phone,
                age=age,
                message=message,
                package=package,
                location=location,
                subject=f"Cerere abonament — {package}",
                consent=True,
                consent_ip=sec.client_ip(),
                user_agent=request.headers.get("User-Agent", "")[:255],
            )
        )

    rows = [
        ("Pachet", package),
        ("Locație", location),
        ("Nume", name),
        ("Email", email_addr),
        ("Telefon", phone),
        ("Vârstă", age),
        ("Preferințe oră/zi", message),
    ]
    send(
        to=settings.mail_to,
        subject=f"[Site] Cerere abonament — {name} ({package})",
        text_body=_rows_text(rows),
        html_body=_rows_html(rows),
        reply_to=email_addr,
    )

    return jsonify(
        {"message": "Cererea a fost trimisa! Te contactam pentru a stabili programul."}
    )


# --------------------------------------------------------------------------- #
# Cariere
# --------------------------------------------------------------------------- #

@bp.post("/cariere")
def careers():
    blocked = _guard()
    if blocked:
        return blocked

    data = _payload()
    try:
        name = sec.text(data.get("name"), field="Nume", required=True, max_length=190)
        email_addr = sec.email(data.get("email"))
        phone = sec.phone(data.get("phone"))
        message = sec.text(data.get("message"), field="Mesaj", max_length=3000)
        sec.consent(data.get("gdpr", True))
        cv = _check_file(
            request.files.get("cv"),
            label="CV-ul",
            allowed=ALLOWED_UPLOAD_TYPES | CV_EXTRA_TYPES,
        )
    except sec.ValidationError as exc:
        return sec.json_error(exc.message)

    assert cv is not None
    cv_content, cv_name, cv_type = cv

    with session_scope() as db:
        submission = Submission(
            kind="cariere",
            name=name,
            email=email_addr,
            phone=phone,
            message=message,
            subject="Aplicare cariere",
            consent=True,
            consent_ip=sec.client_ip(),
            user_agent=request.headers.get("User-Agent", "")[:255],
        )
        db.add(submission)
        db.flush()  # ca sa avem id-ul pentru fisiere
        _persist(db, submission, [("cv", cv_content, cv_name, cv_type)])

    rows = [("Nume", name), ("Email", email_addr), ("Telefon", phone), ("Mesaj", message)]
    send(
        to=settings.mail_to,
        subject=f"[Site] CV nou — {name}",
        text_body=_rows_text(rows),
        html_body=_rows_html(rows),
        reply_to=email_addr,
        attachments=[Attachment(cv_name, cv_content, cv_type)],
    )

    return jsonify({"message": "Am primit CV-ul tau. Te contactam in cel mai scurt timp!"})


# --------------------------------------------------------------------------- #
# Inscriere completa (cu PDF si semnatura)
# --------------------------------------------------------------------------- #

@bp.post("/inscriere")
def enrollment():
    blocked = _guard()
    if blocked:
        return blocked

    data = _payload()
    try:
        student = sec.text(
            data.get("firstName"), field="Nume cursant", required=True, max_length=190
        )
        birth = sec.birth_date(data.get("birthDate"))
        parent = sec.text(
            data.get("nameLegalParent"), field="Nume părinte", required=True, max_length=190
        )
        phone = sec.phone(data.get("phone"))
        email_addr = sec.email(data.get("email"))
        location = sec.text(data.get("locationName"), field="Locație", max_length=190)
        sec.consent(data.get("terms"))

        photo = _check_file(
            request.files.get("photo"),
            label="certificatul de naștere / cartea de identitate",
            allowed=ALLOWED_UPLOAD_TYPES,
        )
        medical = _check_file(
            request.files.get("medical"), label="avizul medical", allowed=ALLOWED_UPLOAD_TYPES
        )

        raw_signature = (data.get("signature") or "").strip()
        if not raw_signature:
            raise sec.ValidationError("Te rugam sa semnezi inainte de a trimite formularul.")
        try:
            # Acceptam si forma completa "data:image/png;base64,…".
            if "," in raw_signature and raw_signature.startswith("data:"):
                raw_signature = raw_signature.split(",", 1)[1]
            signature = base64.b64decode(raw_signature, validate=True)
        except (binascii.Error, ValueError):
            raise sec.ValidationError("Semnatura nu a putut fi citita.") from None
        if len(signature) > settings.max_upload_bytes:
            raise sec.ValidationError("Semnatura este prea mare.")

    except sec.ValidationError as exc:
        return sec.json_error(exc.message)

    assert photo is not None and medical is not None
    photo_content, photo_name, photo_type = photo
    medical_content, medical_name, medical_type = medical

    submitted_at = datetime.now(timezone.utc)
    ip = sec.client_ip()

    with session_scope() as db:
        submission = Submission(
            kind="inscriere",
            name=student,
            email=email_addr,
            phone=phone,
            birth_date=birth,
            legal_parent=parent,
            location=location,
            subject=f"Înscriere — {student}",
            consent=True,
            consent_ip=ip,
            user_agent=request.headers.get("User-Agent", "")[:255],
            created_at=submitted_at,
        )
        db.add(submission)
        db.flush()
        submission_id = submission.id

        # Fisa PDF — acelasi rol pe care il avea Google Apps Script-ul vechi.
        try:
            pdf_bytes = build_enrollment_pdf(
                EnrollmentData(
                    student_name=student,
                    birth_date=birth,
                    legal_parent=parent,
                    phone=phone,
                    email=email_addr,
                    location_name=location,
                    consent_ip=ip,
                    submitted_at=submitted_at,
                    submission_id=submission_id,
                    signature_png=signature,
                    documents=[
                        ("Certificat de naștere / carte de identitate", photo_content),
                        ("Aviz medical", medical_content),
                    ],
                ),
                club_name=CLUB,
            )
        except Exception:
            # Inscrierea nu se pierde chiar daca PDF-ul nu se genereaza.
            log.exception("Generarea PDF a eșuat pentru inscrierea %s", submission_id)
            pdf_bytes = None

        files: list[tuple[str, bytes, str, str]] = [
            ("document", photo_content, photo_name, photo_type),
            ("aviz-medical", medical_content, medical_name, medical_type),
            ("semnatura", signature, "semnatura.png", "image/png"),
        ]
        pdf_name = f"fisa-inscriere-{submission_id}.pdf"
        if pdf_bytes:
            files.append(("fisa-pdf", pdf_bytes, pdf_name, "application/pdf"))

        _persist(db, submission, files)

    rows = [
        ("Cursant", student),
        ("Data nașterii", birth),
        ("Părinte / reprezentant", parent),
        ("Telefon", phone),
        ("Email", email_addr),
        ("Locație", location),
    ]
    attachments = [Attachment(pdf_name, pdf_bytes, "application/pdf")] if pdf_bytes else []

    # 1. Notificare catre club
    send(
        to=settings.mail_to,
        subject=f"[Site] Înscriere noua — {student} ({location})",
        text_body=_rows_text(rows),
        html_body=_rows_html(rows),
        reply_to=email_addr,
        attachments=attachments,
    )

    # 2. Confirmare catre parinte, cu fisa atasata
    send(
        to=[email_addr],
        subject=f"Fișa ta de înscriere — {CLUB}",
        text_body=(
            f"Bună, {parent}!\n\n"
            f"Îți mulțumim pentru înscrierea lui {student} la cursurile de înot "
            f"{CLUB}, locația {location}.\n\n"
            "Atașat găsești fișa de înscriere completată, în format PDF. "
            "Te contactăm în cel mai scurt timp ca să stabilim programul.\n\n"
            "Pentru orice întrebare, ne găsești la 0744 258 258 sau contact@bluemarin.ro.\n\n"
            f"Cu drag,\nEchipa {CLUB}"
        ),
        attachments=attachments,
    )

    return jsonify(
        {
            "message": (
                "Felicitari! Inscrierea a fost trimisa. Verifica emailul — "
                "ai primit o copie a fisei in format PDF."
            )
        }
    )
