"""Generarea fisei de inscriere in format PDF.

Inlocuieste scriptul Google Apps Script de pe site-ul vechi: primeste datele
formularului, documentele incarcate si semnatura, si produce un PDF care se
trimite pe email cursantului si se arhiveaza in sistem.
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos
from PIL import Image, ImageOps

log = logging.getLogger(__name__)

FONT_DIR = Path(__file__).resolve().parent / "assets" / "fonts"
FONT = "Bluemarin"

# Paleta site-ului
BRAND = (107, 152, 237)
DEEP = (64, 72, 201)
INK = (21, 21, 21)
GREY = (122, 122, 122)

PAGE_W = 210.0
MARGIN = 18.0
BODY_W = PAGE_W - 2 * MARGIN


@dataclass
class EnrollmentData:
    """Tot ce intra pe fisa de inscriere."""

    student_name: str
    birth_date: str
    legal_parent: str
    phone: str
    email: str
    location_name: str
    consent_ip: str = ""
    submitted_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    submission_id: int | None = None
    # Imaginile, ca bytes: semnatura, documentul de identitate, avizul medical
    signature_png: bytes | None = None
    documents: list[tuple[str, bytes]] = field(default_factory=list)


class EnrollmentPDF(FPDF):
    """Document A4 cu antet si subsol pe fiecare pagina."""

    def __init__(self, club_name: str = "Bluemarin Sport Club") -> None:
        super().__init__(orientation="P", unit="mm", format="A4")
        self.club_name = club_name
        self.set_margins(MARGIN, 24, MARGIN)
        self.set_auto_page_break(auto=True, margin=22)
        self._load_fonts()

    def _load_fonts(self) -> None:
        regular = FONT_DIR / "BluemarinSans.ttf"
        bold = FONT_DIR / "BluemarinSans-Bold.ttf"

        if regular.exists():
            self.add_font(FONT, "", str(regular))
            self.add_font(FONT, "B", str(bold) if bold.exists() else str(regular))
            self.base_font = FONT
        else:
            # Plasa de siguranta: Helvetica nu are diacritice, dar documentul
            # se genereaza oricum in loc sa cada tot formularul.
            log.warning("Fonturile din %s lipsesc — PDF-ul va fi fara diacritice.", FONT_DIR)
            self.base_font = "Helvetica"

    def header(self) -> None:
        self.set_font(self.base_font, "B", 13)
        self.set_text_color(*DEEP)
        self.set_xy(MARGIN, 11)
        self.cell(0, 6, self.club_name, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        self.set_font(self.base_font, "", 8)
        self.set_text_color(*GREY)
        self.set_xy(MARGIN, 17)
        self.cell(0, 4, "Fișă de înscriere — cursuri de înot", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        self.set_draw_color(*BRAND)
        self.set_line_width(0.5)
        self.line(MARGIN, 22, PAGE_W - MARGIN, 22)
        self.set_y(30)

    def footer(self) -> None:
        self.set_y(-16)
        self.set_draw_color(225, 228, 235)
        self.set_line_width(0.2)
        self.line(MARGIN, self.get_y(), PAGE_W - MARGIN, self.get_y())

        self.set_font(self.base_font, "", 7.5)
        self.set_text_color(*GREY)
        self.set_y(-12)
        self.cell(
            BODY_W / 2,
            4,
            "Asociația Clubul Sportiv Bluemarin · C.I.F. 37787434",
            align="L",
        )
        self.cell(BODY_W / 2, 4, f"Pagina {self.page_no()}", align="R")

    # ---- componente de conținut ---- #

    def section(self, title: str) -> None:
        if self.get_y() > 240:
            self.add_page()
        self.ln(4)
        self.set_font(self.base_font, "B", 9)
        self.set_text_color(*BRAND)
        self.cell(0, 6, title.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*BRAND)
        self.set_line_width(0.3)
        self.line(MARGIN, self.get_y(), MARGIN + 22, self.get_y())
        self.ln(3)

    def row(self, label: str, value: str) -> None:
        """O linie etichetă / valoare, cu valoarea pe mai multe rânduri la nevoie."""
        label_w = 52.0
        self.set_font(self.base_font, "", 9)
        self.set_text_color(*GREY)

        y0 = self.get_y()
        self.set_x(MARGIN)
        self.multi_cell(label_w, 6, label, align="L", new_x=XPos.RIGHT, new_y=YPos.TOP)

        self.set_font(self.base_font, "B", 9.5)
        self.set_text_color(*INK)
        self.set_xy(MARGIN + label_w, y0)
        self.multi_cell(BODY_W - label_w, 6, value or "—", align="L")

        self.set_y(max(self.get_y(), y0 + 6))
        self.set_draw_color(235, 238, 243)
        self.set_line_width(0.15)
        self.line(MARGIN, self.get_y() + 0.5, PAGE_W - MARGIN, self.get_y() + 0.5)
        self.ln(2)

    def paragraph(self, text: str, size: float = 8.5) -> None:
        self.set_font(self.base_font, "", size)
        self.set_text_color(*INK)
        self.set_x(MARGIN)
        self.multi_cell(BODY_W, 4.6, text, align="L")
        self.ln(1)


def _prepare_image(raw: bytes, max_px: int = 1400) -> bytes | None:
    """Normalizeaza o imagine pentru PDF: RGB, rotita corect, micsorata.

    Intoarce None daca fisierul nu e o imagine (ex. un PDF incarcat de client).
    """
    try:
        with Image.open(io.BytesIO(raw)) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "L"):
                # Pune transparenta pe alb, altfel iese fundal negru.
                if img.mode in ("RGBA", "LA", "P"):
                    img = img.convert("RGBA")
                    flat = Image.new("RGB", img.size, (255, 255, 255))
                    flat.paste(img, mask=img.split()[-1])
                    img = flat
                else:
                    img = img.convert("RGB")

            img.thumbnail((max_px, max_px), Image.LANCZOS)

            out = io.BytesIO()
            img.save(out, format="JPEG", quality=82, optimize=True)
            return out.getvalue()
    except Exception as exc:  # imagine coruptă sau alt format
        log.info("Nu am putut pregati imaginea pentru PDF: %s", exc)
        return None


def build_enrollment_pdf(data: EnrollmentData, club_name: str = "Bluemarin Sport Club") -> bytes:
    """Construieste PDF-ul si il intoarce ca bytes."""
    pdf = EnrollmentPDF(club_name)
    pdf.add_page()

    # --- Titlu ---
    pdf.set_font(pdf.base_font, "B", 16)
    pdf.set_text_color(*INK)
    pdf.cell(0, 9, "Fișă de înscriere", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font(pdf.base_font, "", 9)
    pdf.set_text_color(*GREY)
    stamp = data.submitted_at.strftime("%d.%m.%Y, ora %H:%M UTC")
    ref = f"Nr. {data.submission_id}" if data.submission_id else "Nr. —"
    pdf.cell(0, 5, f"{ref} · completată la {stamp}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    # --- Date cursant ---
    pdf.section("Date cursant")
    pdf.row("Nume și prenume", data.student_name)
    pdf.row("Data nașterii", data.birth_date)
    pdf.row("Locație", data.location_name)

    # --- Reprezentant legal ---
    pdf.section("Părinte / reprezentant legal")
    pdf.row("Nume și prenume", data.legal_parent)
    pdf.row("Telefon", data.phone)
    pdf.row("E-mail", data.email)

    # --- Acord ---
    pdf.section("Acord și consimțământ")
    pdf.paragraph(
        "Prin semnarea prezentei fișe, cursantul sau reprezentantul său legal declară că a citit, "
        "a înțeles și acceptă Regulamentul Intern, Termenii și Condițiile, Politica de "
        "Confidențialitate și Politica de Cookies ale Asociației Clubul Sportiv Bluemarin."
    )
    pdf.paragraph(
        "De asemenea, își exprimă acordul pentru prelucrarea datelor personale în scopul "
        "gestionării activității sportive și pentru utilizarea materialelor foto-video realizate "
        "în timpul activităților, în scop de promovare."
    )
    if data.consent_ip:
        pdf.set_font(pdf.base_font, "", 7.5)
        pdf.set_text_color(*GREY)
        pdf.cell(
            0,
            4,
            f"Acord transmis de la adresa IP {data.consent_ip} la {stamp}.",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
    pdf.ln(2)

    # --- Semnătura ---
    pdf.section("Semnătura")
    sig = _prepare_image(data.signature_png, max_px=900) if data.signature_png else None
    if sig:
        y = pdf.get_y()
        pdf.set_draw_color(225, 228, 235)
        pdf.set_line_width(0.2)
        pdf.rect(MARGIN, y, 85, 32)
        try:
            pdf.image(io.BytesIO(sig), x=MARGIN + 2, y=y + 2, h=28)
        except Exception as exc:
            log.warning("Semnatura nu a putut fi inserata: %s", exc)
        pdf.set_y(y + 34)
    else:
        pdf.paragraph("(semnătura nu a putut fi redată)")

    pdf.set_font(pdf.base_font, "", 8)
    pdf.set_text_color(*GREY)
    pdf.cell(0, 4, data.legal_parent, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # --- Documente atașate, fiecare pe pagina proprie ---
    for title, raw in data.documents:
        prepared = _prepare_image(raw)
        pdf.add_page()
        pdf.section(title)

        if prepared is None:
            pdf.paragraph(
                "Documentul a fost încărcat în alt format decât imagine (de exemplu PDF) "
                "și este păstrat separat în arhiva clubului."
            )
            continue

        try:
            with Image.open(io.BytesIO(prepared)) as img:
                iw, ih = img.size
            avail_h = 297 - pdf.get_y() - 26
            scale = min(BODY_W / iw, avail_h / ih)
            pdf.image(io.BytesIO(prepared), x=MARGIN, y=pdf.get_y(), w=iw * scale, h=ih * scale)
        except Exception as exc:
            log.warning("Documentul „%s” nu a putut fi inserat: %s", title, exc)
            pdf.paragraph("(documentul nu a putut fi redat)")

    return bytes(pdf.output())
