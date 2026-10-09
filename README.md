# Bluemarin Sport Club — site + backend

Reconstruirea lui [bluemarin.ro](https://www.bluemarin.ro) (WordPress + tema Brooklyn)
ca **Next.js + Flask**, cu aceleasi pagini, aceeasi tema vizuala si aceleasi
functionalitati — dar cu continutul editabil dintr-un panou de admin.

```
Frontend   Next.js 15 (App Router, TypeScript, Tailwind)  -> Vercel, gratis
Backend    Flask + SQLAlchemy                             -> Vercel, aceeasi aplicatie
Date       Postgres (Neon / Supabase)                     -> tier gratuit
Email      Resend                                         -> 3.000/luna gratis
```

---

## Cuprins

- [Pornire rapida](#pornire-rapida)
- [Structura proiectului](#structura-proiectului)
- [Cum editezi continutul](#cum-editezi-continutul)
- [Deploy pe Vercel](#deploy-pe-vercel)
- [Cat costa](#cat-costa)
- [Variabile de mediu](#variabile-de-mediu)
- [Comenzi utile](#comenzi-utile)
- [Alternative pentru backend](#alternative-pentru-backend)
- [Ce s-a schimbat fata de site-ul vechi](#ce-sa-schimbat-fata-de-site-ul-vechi)

---

## Pornire rapida

Ai nevoie de **Node 20+** si **Python 3.11+**.

```bash
# 1. Frontend
npm install
npm run dev                  # http://localhost:3000
```

Atat. Site-ul merge imediat, citind textele din `content/*.json`.

Pentru backend (formulare + panou de admin):

```bash
# 2. Backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

cp .env.example .env.local   # completeaza SECRET_KEY si ADMIN_*
.venv/bin/python -m backend.cli seed          # incarca textele in baza de date
.venv/bin/python -m backend.cli create-admin  # creeaza contul tau
.venv/bin/python -m backend.cli run           # http://localhost:5000
```

Panoul de admin: <http://localhost:5000/api/admin/>

Ca frontend-ul sa foloseasca backend-ul local, adauga in `.env.local`:

```bash
CONTENT_API_URL=http://127.0.0.1:5000/api
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
ALLOWED_ORIGINS=http://localhost:3000
```

Verifica oricand ce e configurat si ce lipseste:

```bash
.venv/bin/python -m backend.cli check
```

---

## Structura proiectului

```
content/              TEXTELE SITE-ULUI — aici editezi tot (vezi mai jos)
  site.json             meniu, contact, social media, date firma
  home.json             prima pagina, sectiune cu sectiune
  pricing.json          tarifele (sursa de adevar pentru toate paginile)
  team.json             cei 8 antrenori
  locations.json        Bazin CS Rapid + Militari Wellness
  courses.json          pagina "Cursuri de inot"
  kids.json             pagina "Cursuri inot copii"
  rules.json            regulamentul
  legal.json            termeni, confidentialitate, cookies
  careers.json, contact.json, gallery.json

src/
  app/                paginile (fiecare folder = o adresa pe site)
  components/         bucatile refolosite (header, formulare, carduri)
  lib/                tipurile si incarcarea continutului

backend/
  app.py              aplicatia Flask
  models.py           tabelele bazei de date
  routes/
    content.py          API-ul de continut citit de Next.js
    forms.py            cele 4 formulare publice
    admin.py            panoul de admin
  pdf.py              fisa de inscriere in PDF
  mail.py              trimiterea emailurilor
  jsonform.py         genereaza formularul de admin din JSON
  templates/admin/    paginile panoului de admin

api/index.py          punctul de intrare pentru Vercel
scripts/
  fetch-images.mjs    descarca pozele de pe site-ul vechi
  images.manifest.json  lista pozelor descarcate
docs/
  inventar-site-vechi.md   ce era pe site-ul vechi, extras cu REST API
```

---

## Cum editezi continutul

### Varianta 1 — panoul de admin (recomandat)

<https://domeniul-tau.ro/api/admin/>

- **Continut** → alegi sectiunea → editezi textele → **Salveaza**.
  Modificarea apare pe site in cateva secunde.
- Pentru a **adauga sau sterge** elemente (un antrenor nou, un pachet de tarife,
  o poza in galerie), foloseste butonul **JSON** din dreptul sectiunii.
- **Reseteaza la textele initiale** readuce sectiunea la cum era la lansare.

### Varianta 2 — fisierele din `content/`

Editezi fisierul, dai `git push`, Vercel face deploy automat.
Util pentru modificari mari sau cand vrei istoric in Git.

> Fisierele din `content/` raman mereu plasa de siguranta: daca baza de date
> e indisponibila, site-ul le foloseste pe ele si nu cade.

### Poze

Pozele sunt in `public/images/`. Ca sa adaugi altele de pe site-ul vechi,
pune-le in `scripts/images.manifest.json` si ruleaza:

```bash
npm run images
```

Scriptul le descarca, le converteste in WebP si rescrie `content/gallery.json`.

---

## Deploy pe Vercel

### 1. Baza de date (2 minute, gratis)

Fara ea, backend-ul foloseste SQLite — care pe Vercel **se pierde dupa fiecare
cerere**. E obligatorie in productie.

1. Cont pe [neon.tech](https://neon.tech) (tier gratuit: 0,5 GB)
2. Creeaza un proiect, copiaza **connection string**-ul
3. Foloseste varianta **pooled** (contine `-pooler` in adresa) — e cea potrivita
   pentru functii serverless

### 2. Email (2 minute, gratis)

1. Cont pe [resend.com](https://resend.com) — 3.000 emailuri/luna
2. Adauga domeniul `bluemarin.ro` si pune inregistrarile DNS cerute
3. Copiaza **API key**-ul

### 3. Deploy

```bash
npm i -g vercel
vercel          # prima data: leaga proiectul
vercel --prod
```

Sau conecteaza repo-ul GitHub din panoul Vercel — face deploy la fiecare push.

### 4. Variabile de mediu

In Vercel → **Settings** → **Environment Variables**, adauga cel putin:

| Variabila | Valoare |
|---|---|
| `SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `REVALIDATE_SECRET` | la fel, alta valoare |
| `DATABASE_URL` | connection string-ul de la Neon |
| `RESEND_API_KEY` | cheia de la Resend |
| `MAIL_FROM` | `Bluemarin Sport Club <noreply@bluemarin.ro>` |
| `MAIL_TO` | `contact@bluemarin.ro` |
| `ADMIN_EMAIL` | adresa ta |
| `ADMIN_PASSWORD` | o parola lunga (o schimbi dupa prima intrare) |
| `SITE_URL` | `https://www.bluemarin.ro` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.bluemarin.ro` |
| `CONTENT_API_URL` | `https://www.bluemarin.ro/api` |

> `ALLOWED_ORIGINS` se lasa **gol**: pe Vercel site-ul si API-ul sunt pe acelasi
> domeniu, deci nu e nevoie de CORS.

### 5. Dupa primul deploy

```bash
# incarca textele in baza de date
curl -X POST https://www.bluemarin.ro/api/admin/continut/reincarca
```

sau, mai simplu, intra in `/api/admin/continut` si apasa
**„Incarca sectiunile care lipsesc"**.

Verifica apoi: <https://www.bluemarin.ro/api/health>

### Cum functioneaza rutarea

`vercel.json` trimite tot ce incepe cu `/api/` catre functia Python
(`api/index.py`). Restul e servit de Next.js. Ruta de revalidare a
frontend-ului sta la `/revalidate`, **in afara** prefixului `/api`, tocmai ca
sa nu se incurce cu backend-ul.

---

## Cat costa

| Serviciu | Plan | Cost |
|---|---|---|
| Vercel (frontend + backend) | Hobby | **0 €** |
| Neon (Postgres) | Free, 0,5 GB | **0 €** |
| Resend (email) | Free, 3.000/luna | **0 €** |
| Domeniu `.ro` | — | ~**20 €/an** |

**Total: ~20 €/an**, adica doar domeniul.

### Trei lucruri de stiut

1. **Planul Hobby al Vercel e „non-commercial use only".** Un club care vinde
   abonamente e activitate comerciala — strict dupa termeni ai nevoie de
   **Pro, 20 $/luna**. In practica site-uri ca acesta stau pe Hobby fara
   probleme, dar decizia e a ta.

2. **Functiile serverless n-au disc persistent.** De aceea documentele incarcate
   ajung, implicit, in baza de date (`STORAGE_BACKEND=db`). Pentru volum mare,
   treci pe Cloudflare R2 (`STORAGE_BACKEND=s3`) — 10 GB gratis.

3. **Limite Hobby:** 100 GB trafic/luna, 60 s per functie, 1 cron/zi. Pentru un
   site de club nu te apropii de ele.

---

## Variabile de mediu

Lista completa cu explicatii: [`.env.example`](.env.example).

Cele care conteaza cel mai des:

| Variabila | Implicit | Ce face |
|---|---|---|
| `DATABASE_URL` | SQLite local | Baza de date. Obligatorie pe Vercel. |
| `SECRET_KEY` | generat in dev | Semneaza sesiunile de admin. Obligatorie in productie. |
| `RESEND_API_KEY` | — | Fara ea, emailurile sunt doar scrise in log. |
| `MAIL_TO` | `contact@bluemarin.ro` | Unde ajung notificarile de formular. |
| `CONTENT_API_URL` | — | Daca lipseste, site-ul foloseste `content/*.json`. |
| `CONTENT_REVALIDATE` | `300` | Cat tine cache-ul continutului, in secunde. |
| `REVALIDATE_SECRET` | — | Fara ea, modificarile apar dupa ~5 minute in loc de imediat. |
| `STORAGE_BACKEND` | `db` | `db`, `s3` sau `local`. |
| `MAX_UPLOAD_MB` | `8` | Limita per fisier incarcat. |
| `RATE_LIMIT_PER_HOUR` | `12` | Cate formulare accepta de la acelasi IP intr-o ora. |

---

## Comenzi utile

```bash
npm run dev          # frontend, cu reincarcare automata
npm run build        # build de productie (verifica si tipurile)
npm run typecheck    # doar verificarea de tipuri
npm run images       # descarca pozele din manifest
npm run images -- --force   # le redescarca pe toate

.venv/bin/python -m backend.cli run           # backend local
.venv/bin/python -m backend.cli check         # ce e configurat, ce lipseste
.venv/bin/python -m backend.cli seed          # incarca content/*.json in DB
.venv/bin/python -m backend.cli seed --overwrite   # suprascrie si ce ai editat
.venv/bin/python -m backend.cli create-admin  # cont nou / parola noua
```

---

## Alternative pentru backend

Backend-ul e scris portabil — acelasi cod ruleaza oriunde. Daca vrei sa-l muti
de pe Vercel:

| Unde | Cost | Note |
|---|---|---|
| **VPS Hetzner** (CX22) | ~4 €/luna | Control total, disc persistent, cron. Il administrezi tu. |
| **Fly.io** | ~2 €/luna | Scale-to-zero. |
| **Railway** | ~5 $/luna | Simplu, cu Postgres inclus. |
| **Render** | 0 € / 7 $/luna | Tierul gratuit adoarme dupa 15 min si porneste in ~50 s — nepotrivit pentru formulare. |

Pe un VPS:

```bash
gunicorn api.index:app --bind 0.0.0.0:8000 --workers 2
```

Apoi pui `NEXT_PUBLIC_API_URL` si `CONTENT_API_URL` pe noua adresa si adaugi
domeniul site-ului in `ALLOWED_ORIGINS`.

---

## Ce s-a schimbat fata de site-ul vechi

**Pastrat identic:** paleta (`#6b98ed`, `#4048c9`, `#f25ca2`), fontul Raleway,
structura celor 9 sectiuni de pe prima pagina, toate cele 11 intrari de meniu,
textele, cei 8 antrenori, cele 15 pachete de tarife, butonul fix de telefon pe
mobil, counterele animate, galeria cu lightbox.

**Inlocuit:**

| Inainte | Acum |
|---|---|
| Contact Form 7 + Popup Maker | Formulare proprii, cu validare in romana |
| Google Apps Script (fisa de inscriere) | `backend/pdf.py` — PDF generat de noi, trimis pe email si arhivat |
| `signature_pad` de pe CDN | Canvas propriu, fara dependinte externe |
| WPBakery + 10 plugin-uri | Componente React |
| Panou WordPress | `/api/admin` |

**Adaugat:**

- Redirectari de la toate adresele vechi (`/cursuri-de-inot-2/`,
  `/contact-us/` etc.) ca sa nu pierzi pozitiile din Google — vezi
  `next.config.mjs`
- `sitemap.xml` si `robots.txt` generate automat
- Date structurate `SportsActivityLocation` pentru rezultatele locale Google
- Limitare de trafic pe formulare + capcana pentru roboti
- Export CSV al tuturor cererilor primite

**Ce n-a fost preluat:** blogul (avea 2 articole din 2018, nu era in meniu) si
~45 de pagini vechi marcate `test`/`bug`/`COVID-19`. Sunt inventariate in
`docs/inventar-site-vechi.md` daca vrei vreuna inapoi.

---

## De verificat inainte de lansare

- [ ] Pozele antrenorilor — le-am luat pe cele de 280×280 de pe site; daca ai
      originalele, inlocuieste-le in `public/images/echipa/`
- [ ] **Mini-grup 1:2** la Militari Wellness apare pe site-ul vechi de doua ori
      cu „4 sedinte — 520 lei", iar varianta de 8 sedinte lipseste.
      Am pastrat-o o singura data — confirma preturile in `content/pricing.json`
- [ ] Harta pentru Militari Wellness e generata din adresa; daca vrei
      coordonate exacte, inlocuieste `mapEmbed` in `content/locations.json`
- [ ] Verifica domeniul in Resend inainte de lansare, altfel emailurile ajung in spam
