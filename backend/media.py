"""Pregatirea pozelor incarcate din panoul de admin.

Orice poza primita e normalizata inainte sa fie salvata: rotita dupa datele
EXIF, micsorata daca e uriasa si convertita in WebP. Asa site-ul ramane rapid
chiar daca cineva incarca direct o fotografie de 6 MB de pe telefon.
"""

from __future__ import annotations

import io
import re
import secrets
import unicodedata
from dataclasses import dataclass

from PIL import Image, ImageOps

from .config import settings

# Formatele pe care le acceptam la incarcare.
ACCEPTED = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/avif",
}

# Peste atat, poza se micsoreaza. 2000 px acopera si banner-ele full-width.
MAX_EDGE = 2000
WEBP_QUALITY = 82


class MediaError(Exception):
    """Poza nu poate fi folosita — mesajul e deja in romana, pentru panou."""


@dataclass
class Prepared:
    slug: str
    content: bytes
    content_type: str
    width: int
    height: int


def slugify(value: str) -> str:
    """"Bogdan Marin.JPG" -> "bogdan-marin"."""
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"\.[A-Za-z0-9]{2,5}$", "", value)  # scoate extensia
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value[:60] or "poza"


def prepare(content: bytes, filename: str) -> Prepared:
    """Valideaza si converteste poza. Arunca MediaError cu mesaj pentru panou."""
    if not content:
        raise MediaError("Fișierul este gol.")
    if len(content) > settings.max_upload_bytes:
        raise MediaError(
            f"Poza este prea mare (maxim {settings.max_upload_mb} MB). "
            "Micșoreaz-o și încearcă din nou."
        )

    try:
        with Image.open(io.BytesIO(content)) as img:
            img = ImageOps.exif_transpose(img)

            # Transparenta pe alb: altfel PNG-urile ies cu fundal negru.
            if img.mode in ("RGBA", "LA", "P"):
                img = img.convert("RGBA")
                flat = Image.new("RGB", img.size, (255, 255, 255))
                flat.paste(img, mask=img.split()[-1])
                img = flat
            elif img.mode != "RGB":
                img = img.convert("RGB")

            if max(img.size) > MAX_EDGE:
                img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)

            out = io.BytesIO()
            img.save(out, format="WEBP", quality=WEBP_QUALITY, method=5)
            data = out.getvalue()
            width, height = img.size
    except MediaError:
        raise
    except Exception as exc:  # fisier corupt sau format necunoscut
        raise MediaError(
            "Fișierul nu pare să fie o imagine validă (acceptăm JPG, PNG, WebP, HEIC)."
        ) from exc

    # Sufixul aleator face adresa stabila si unica: doua poze cu acelasi nume
    # nu se suprascriu, iar continutul salvat poate trimite linistit la ea.
    slug = f"{slugify(filename)}-{secrets.token_hex(3)}.webp"

    return Prepared(
        slug=slug,
        content=data,
        content_type="image/webp",
        width=width,
        height=height,
    )
