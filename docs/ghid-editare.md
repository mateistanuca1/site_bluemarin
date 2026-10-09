# Ghid de editare — pentru cine se ocupa de site

Nu ai nevoie de cunostinte tehnice. Tot ce schimbi aici apare pe site in
cateva secunde.

---

## Cum intri

1. Deschide **https://www.bluemarin.ro/api/admin/**
2. Email si parola (le primesti de la cine a facut site-ul)

Sus ai trei butoane: **Panou**, **Continut**, **Cereri**.

---

## Panou

Prima pagina iti arata:

- cate cereri ai primit, pe fiecare tip
- cate sunt **nerezolvate** (nu le-ai bifat inca)
- ultimele 8 cereri

---

## Cereri

Aici ajung toate formularele de pe site:

| Tip | De unde vine |
|---|---|
| **Mesaj de contact** | formularul de pe pagina Contact si de pe prima pagina |
| **Cerere abonament** | butonul „Alege" de pe cardurile de tarife |
| **Inscriere** | formularul complet, cu documente si semnatura |
| **CV / cariere** | pagina Cariere |

Apasa pe un nume ca sa vezi tot. La **Inscriere** gasesti si fisierele:
certificatul de nastere, avizul medical, semnatura si **fisa PDF** generata
automat (aceeasi care i-a fost trimisa pe email parintelui).

Dupa ce ai sunat omul, bifeaza **Cerere rezolvata** si scrie in **Note interne**
ce ati stabilit. Notele se vad doar aici, niciodata pe site.

**Export CSV** descarca tot intr-un fisier pe care il deschizi in Excel.

---

## Continut

Aici schimbi textele de pe site. Fiecare rand e o parte a site-ului:

| Sectiune | Ce contine |
|---|---|
| Setari generale | meniul, telefonul, adresa, link-urile de social media |
| Prima pagina | toate cele 9 sectiuni de pe homepage |
| Tarife | **preturile** — se folosesc peste tot automat |
| Echipa | cei 8 antrenori |
| Locatii | Bazin CS Rapid si Militari Wellness |
| Cursuri de inot / Cursuri inot copii | textele paginilor |
| Regulament | regulamentul intern |
| Pagini legale | termeni, confidentialitate, cookies |
| Galerie, Cariere, Pagina de contact | restul |

### Ca sa schimbi un text

1. Apasa **Editeaza**
2. Sectiunile sunt in casute pe care le deschizi cu click
3. Schimbi ce vrei
4. **Salveaza** (butonul ramane jos, pe ecran)

### Exemplu: schimbi un pret

**Continut** → **Tarife** → **Editeaza** → deschizi
`Locations` → `#1` (Bazin C.S. Rapid) → `Categories` → `#1` (Grup) →
`Packages` → `#3` (8 sedinte) → schimbi `Price` din `480` in `500` →
**Salveaza**.

Noul pret apare imediat pe pagina de tarife, pe pagina locatiei si in
formularul care se deschide cand cineva apasa „Alege".

### Exemplu: schimbi numarul de telefon

**Continut** → **Setari generale** → `Contact` → `Phone`.

Schimba si `Phone href` — acela e numarul pe care il formeaza telefonul cand
cineva apasa butonul. Se scrie fara spatii si cu prefix de tara: `+40744258258`.

---

## Ca sa adaugi sau sa stergi ceva

Editorul normal schimba textele existente. Ca sa **adaugi** un antrenor nou, un
pachet de tarife sau o poza, apasa butonul **JSON** din dreptul sectiunii.

Acolo vezi continutul in forma lui bruta. Regulile:

- fiecare element e intre `{` si `}`
- elementele sunt despartite prin virgula `,`
- **ultimul element dintr-o lista nu are virgula dupa el**
- textele sunt intre ghilimele `"`, numerele nu

Cel mai simplu: copiaza un element existent, lipeste-l dedesubt si schimba-i
valorile.

### Exemplu: adaugi un pachet de tarife

Gasesti lista de pachete:

```json
"packages": [
  { "sessions": 1, "label": "1 sedinta", "price": 80 },
  { "sessions": 4, "label": "4 sedinte", "price": 280 }
]
```

Adaugi o linie noua (atentie la virgula dupa randul de dinainte):

```json
"packages": [
  { "sessions": 1, "label": "1 sedinta", "price": 80 },
  { "sessions": 4, "label": "4 sedinte", "price": 280 },
  { "sessions": 8, "label": "8 sedinte", "price": 480 }
]
```

Daca gresesti ceva, la salvare primesti un mesaj care iti spune **pe ce linie**
e problema. Nu se strica nimic — pana nu salvezi cu succes, site-ul ramane cum era.

---

## Daca ai gresit

Fiecare sectiune are jos butonul rosu **Reseteaza la textele initiale**.
Readuce sectiunea exact la cum era la lansarea site-ului.

Atentie: pierzi **toate** modificarile facute la acea sectiune, nu doar ultima.

---

## Daca modificarea nu apare pe site

1. Da refresh cu **Ctrl+Shift+R** (sau Cmd+Shift+R pe Mac)
2. Daca tot nu apare: **Panou** → **Actualizeaza site-ul acum**
3. Daca nici asa, asteapta 5 minute — site-ul se reimprospateaza oricum singur

---

## Pozele

Pozele nu se schimba din panou. Pentru ele, scrie-i celui care se ocupa de
partea tehnica — e o operatie de cateva minute.

---

## Reguli de bun simt

- **Nu sterge ghilimelele, virgulele sau acoladele** din editorul JSON
- Preturile se scriu doar ca numar: `480`, nu `480 lei` si nu `"480"`
- Dupa o modificare importanta, deschide site-ul si verifica
- Datele cursantilor din **Cereri** sunt date personale: nu le trimite pe
  WhatsApp sau pe email catre persoane din afara clubului
