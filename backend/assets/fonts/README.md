# Fonturi pentru PDF

`BluemarinSans.ttf` si `BluemarinSans-Bold.ttf` sunt subseturi ale fontului
**DejaVu Sans**, reduse la Latin de baza + Latin Extended-A/B (ca sa acopere
diacriticele romanesti: ă â î ș ț Ș Ț) si la punctuatia tipografica.

Sunt incluse in repo pentru ca runtime-ul Python de pe Vercel nu are fonturi
de sistem — fara ele, PDF-ul de inscriere ar ieși fara diacritice.

## Licenta

DejaVu Fonts — licenta libera, derivata din Bitstream Vera Fonts.
Permite folosirea, modificarea si redistribuirea, inclusiv comercial.

Sursa: https://dejavu-fonts.github.io/
Textul licentei: https://dejavu-fonts.github.io/License.html

## Cum se regenereaza

```bash
.venv/bin/pip install fonttools
.venv/bin/python scripts/subset-fonts.py
```
