#!/usr/bin/env python3
"""Regenereaza fonturile subsetate folosite la generarea PDF-urilor.

Rulare:  .venv/bin/python scripts/subset-fonts.py
"""

from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "backend" / "assets" / "fonts"

# Caile obisnuite pentru DejaVu pe Linux si macOS.
CANDIDATES = [
    Path("/usr/share/fonts/truetype/dejavu"),
    Path("/usr/share/fonts/dejavu"),
    Path("/opt/homebrew/share/fonts"),
]

UNICODES = (
    "U+0020-007E,"   # ASCII
    "U+00A0-00FF,"   # Latin-1
    "U+0100-017F,"   # Latin Extended-A — ă Ă ş ţ
    "U+0218-021B,"   # Ș ș Ț ț — forma corecta cu virgula dedesubt
    "U+2010-201F,"   # liniute, ghilimele tipografice
    "U+2020-2022,U+2026,U+2030,"
    "U+20AC,U+2122,U+00B0"
)

PAIRS = [("DejaVuSans.ttf", "BluemarinSans.ttf"), ("DejaVuSans-Bold.ttf", "BluemarinSans-Bold.ttf")]


def find_source() -> Path:
    for folder in CANDIDATES:
        if (folder / "DejaVuSans.ttf").exists():
            return folder
    raise SystemExit(
        "Nu am gasit DejaVuSans.ttf. Instaleaza fonturile DejaVu "
        "(Debian/Ubuntu: apt install fonts-dejavu) si incearca din nou."
    )


def main() -> None:
    src = find_source()
    OUT.mkdir(parents=True, exist_ok=True)

    for src_name, out_name in PAIRS:
        out = OUT / out_name
        subset.main([
            str(src / src_name),
            f"--unicodes={UNICODES}",
            "--layout-features=*",
            "--no-hinting",
            f"--output-file={out}",
        ])
        print(f"{out_name}: {out.stat().st_size / 1024:.0f} kB")


if __name__ == "__main__":
    main()
