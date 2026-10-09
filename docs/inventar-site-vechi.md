# Inventar site vechi — bluemarin.ro

Extras prin WP REST API + HTML randat, 2026-10-08.

## Stack vechi
- WordPress + tema **Brooklyn** (United Themes) + **WPBakery** (js_composer)
- Plugins relevante: Contact Form 7, Popup Maker, Revolution Slider, ut-shortcodes,
  massive-elements / mega-addons, call-now-button, html5-audio-player, auto-terms-of-service
- 62 pagini (multe vechi/test/bug), 2 articole blog (2018), **471 fișiere media**
- Front page: `/` → pagina ID 7459 `bluemarin-sport-club`

## Identitate vizuală
| Rol | Valoare |
|---|---|
| Albastru primar | `#6b98ed` |
| Albastru închis / overlay | `#4048c9`, `#4951de`, `#142b8c`, `#061982` |
| Accent roz (cifre counter) | `#f25ca2` |
| Text închis | `#151515` |
| Font principal | Raleway (extralight / regular / semibold / bold) |
| Font citate | Crimson Pro, 400 italic |
| Logo | `/wp-content/uploads/2013/10/logo-B.png` |

Pattern recurent: secțiuni full-width cu imagine de fundal + overlay colorat
semi-transparent + titlu majuscule + text centrat. Counters animate. Parallax quotes.

## Meniu (navigația reală, 11 intrări)
| Label | Țintă veche |
|---|---|
| ACASA | `#top` |
| CURSURI DE INOT | `/cursuri-de-inot-2/` |
| CURSURI INOT COPII | `/cursuri-de-inot/cursuri-inot-copii/` |
| ECHIPA | `/echipa-de-antrenori/` |
| LOCATII (dropdown) | `#` |
| → BAZIN CS RAPID | `/cursuri-inot-bazin-rapid/` |
| → MILITARI WELLNESS | `/cursuri-inot-militari-wellness/` |
| GALERIE | `/galerie/` |
| CARIERE | `/cariere/` |
| REGULAMENT | `/regulament/` |
| CONTACT | `/contact-us/` |

Footer: Regulament intern · Politica de cookies · Politica de confidentialitate · Termeni si conditii

## Date de contact
- Telefon: **0744 258 258** (buton "Call Now" fix pe mobil)
- Email: **contact@bluemarin.ro**
- Adresă: Calea Giulesti 18, sector 6, Bucuresti
- Entitate: Asociația Clubul Sportiv Bluemarin
- Facebook: `/BluemarinSportClub/` · Instagram: `@bluemarin_sport_club`
  · YouTube: `UCqYCSN4e_aLP-Hbz-Zju35A`

## Secțiunile homepage (în ordine)
1. **Intro** — "LOCUL IN CARE FIECARE VAL POARTA O POVESTE!" + paragraf fondare 2017
2. **VALORI** — 4 carduri: Pasiune, Profesionalism, Perseverenta, Succes (overlay `#4048c9`)
3. **FILOZOFIA NOASTRA** — bg `cover-site-2.jpg` + parallax quote
   "Cu fiecare lungime de bazin devenim tot mai puternici!"
4. **ACADEMIA DE INOT BLUEMARIN** — bg `097A6049.jpg`, overlay `rgba(16,12,109,.84)`
   + 2 carduri: Cursuri inot copii / Cursuri inot adulti
5. **ECHIPA** — 3 antrenori evidențiați + buton "ECHIPA COMPLETA"
6. **EXPERIENTA** — 4 countere: 9 ani, 7.000 cursanti, 300 medalii, 12 cupe
7. **TESTIMONIALE** — 11 testimoniale cu nume
8. **SOCIAL MEDIA** — 3 carduri: Instagram / Facebook / YouTube
9. **CONTACT** — telefon/adresă/email + Google Map + formular

## Echipă (8 antrenori, fiecare are pagină proprie)
| Nume | Rol | Slug vechi |
|---|---|---|
| Bogdan Marin | Fondator, Antrenor–Instructor înot | `bogdan-marin-instructor-inot` |
| Adriana Pache | Antrenor–Instructor înot (coord. iniţiere) | `adriana-pache-instructor-inot` |
| Andreea Bălan | Antrenor Triatlon–Instructor înot (coord. performanță) | `andreea-balan-instructor-inot` |
| Tudor Dumitru | Instructor înot | `tudor-dumitru` |
| Razvan Petrescu | Instructor înot | `razvan-petrescu` |
| Codrin Ene | Antrenor–Instructor înot | `codrin-ene` |
| Alexandra Zamfir | Instructor înot | `alexandra-zamfir` |
| Rebeca Daroiu | Instructor înot | `rebeca-daroiu` |

Fiecare are un citat personal (vezi `docs/content-dump/`).

## Locații

### Bazin CS Rapid — Calea Giulesti 18, sector 6
- Lungime 30 m · lățime 18 m · adâncime 2,2 m · temp. apă 27–28 °C
- Bazin hibrid acoperit și încălzit (înot + polo)
- Zonă de așteptare interioară cu perete de sticlă, parcare în incintă
- Program: Luni–Vineri 12:00–19:00 · Sâmbătă 12:00–14:00
- Parteneriat cu CS Rapid, secția de iniţiere

### Militari Wellness — Str. Rezervelor 72, Militari Residence – Roșu
- Grupe, mini-grupe și ședințe individuale

## Tarife (sursa de adevăr pentru pagina de prețuri)

### Bazin CS Rapid
| Tip | Ședințe | Preț |
|---|---|---|
| Grup | 1 | 80 lei |
| Grup | 4 | 280 lei |
| Grup | 8 | 480 lei |
| Grup | 12 | 600 lei |
| Antrenor personal 1:1 | 1 | 190 lei |
| Antrenor personal 1:1 | 4 | 680 lei |
| Antrenor personal 1:1 | 8 | 1.200 lei |

### Militari Wellness
| Tip | Ședințe | Preț |
|---|---|---|
| Grup 1:6 | 1 | 90 lei |
| Grup 1:6 | 4 | 320 lei |
| Grup 1:6 | 8 | 560 lei |
| Mini-grup 1:2 | 1 | 140 lei |
| Mini-grup 1:2 | 4 | 520 lei |
| Antrenor personal 1:1 | 1 | 190 lei |
| Antrenor personal 1:1 | 4 | 680 lei |
| Antrenor personal 1:1 | 8 | 1.200 lei |

Condiții comune: valabilitate 30 zile · durată 50 min · vârstă minimă 4 ani.

> Notă: pe site-ul vechi apare un duplicat "Mini-grup 1:2 — 4 ședințe (520 lei)"
> (două carduri identice). Lipsește varianta de 8 ședințe mini-grup — de confirmat.

## Funcționalități de replicat

### 1. Formular rapid pe card de tarif (Contact Form 7 + Popup Maker)
Fiecare card de abonament deschide un popup cu formular:
`your-name`, `your-email`, `your-phone`, `varsta`, `message` (preferințe oră/zi),
`package` (hidden, pre-completat), `location` (hidden), `gdpr` (checkbox obligatoriu).
Buton: "Trimite cererea".

### 2. Formular complet de înscriere (custom HTML + JS)
Pagini: `/formular-inscriere-rapid/`, `/formular-inscriere-militari-wellness/`
Câmpuri: `firstName`, `birthDate` (3 select-uri zi/lună/an), `nameLegalParent`,
`phone` (min. 10 cifre), `email`, `file` (imagine, obligatoriu),
`medicalCertificate` (imagine, obligatoriu), **semnătură digitală** (signature_pad 4.0.0
pe canvas), `termsCheckbox` (obligatoriu).

Trimite POST `application/x-www-form-urlencoded` cu fișierele în base64 către un
**Google Apps Script**:
`https://script.google.com/macros/s/AKfycbz5nXJCfhWfjDZ4Zcy8eyBkX47e1kHjgiwl2xdDIjUwTit-stp5Hl8GC4EncTF7JG2Hhw/exec`

Apps Script-ul generează un PDF, îl trimite pe email cursantului și salvează o copie
"in sistemul nostru intern". Captează și IP-ul clientului (via api.ipify.org) pentru
dovada consimțământului.
**Acesta este candidatul principal pentru backend-ul Flask.**

### 3. Formular de contact
Nume, email, subiect, mesaj, acord GDPR.

### 4. Cariere — "Trimite CV-ul tau!"
Criterii: atestat în ramura nataţiei, pasionat de mediul acvatic, fost/actual înotător,
iubeşte copiii, tânăr ambiţios, zâmbitor şi cu spirit de echipă.

### 5. Galerie — 218 imagini, lightbox
### 6. Buton "Call Now" fix pe mobil
### 7. Countere animate la scroll
### 8. Pagini legale (generate de plugin)
`/wpautoterms/termeni-si-conditii/`, `/wpautoterms/politica-de-confidentialitate/`,
`/wpautoterms/politica-de-cookie/`, plus `/regulament/`

## Pagini secundare existente (nu în meniu)
`povestea-bluemarin`, `ghid-aplicatie`, `tarife`, `locatii`, `triatlon`,
`despre-inot`, `beneficii-inot`, `procedee-inot` (+ craul/spate/bras/fluture),
`blog`, `premier-palace-5`, `inscriere`, `covid-19`, `termeni-si-conditii-gdpr`
