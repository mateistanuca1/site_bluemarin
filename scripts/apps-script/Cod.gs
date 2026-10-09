/**
 * BLUEMARIN SPORT CLUB — backend pe Google Apps Script
 * ====================================================
 *
 * Un singur Web App primeste toate formularele site-ului si le duce in
 * Google Sheets / Drive / Gmail. Nu e nevoie de baza de date, deci site-ul
 * sta gratuit pe Vercel.
 *
 * Tipurile de formular (campul `formType`):
 *   inscriere  — fisa completa, cu documente si semnatura -> PDF + email + Virtuagym
 *   contact    — mesaj din pagina de contact
 *   pachet     — cerere de abonament de pe cardul de tarif
 *   cariere    — CV trimis din pagina Cariere
 *
 * INSTALARE
 * ---------
 *  1. script.google.com -> proiect nou -> lipeste acest fisier.
 *  2. Extensii -> "Proprietati script" (Project Settings -> Script Properties)
 *     si adauga cheile din CONFIG de mai jos. NU pune secrete in cod.
 *  3. Deploy -> New deployment -> Web app
 *       Execute as:  Me
 *       Access:      Anyone
 *  4. Copiaza URL-ul /exec si pune-l in Vercel ca APPS_SCRIPT_URL,
 *     impreuna cu FORMS_BACKEND=apps-script si APPS_SCRIPT_TOKEN.
 *
 * DE CE E DIFERIT DE SCRIPTUL VECHI
 * ---------------------------------
 *  - PDF-ul se genereaza corect. Varianta veche returna documentul Google in
 *    loc de PDF, apoi il stergea inainte sa-l ataseze — asa ca atasamentul nu
 *    ajungea niciodata la parinte.
 *  - Documentul temporar se sterge DUPA ce PDF-ul a fost salvat.
 *  - Cheile nu mai sunt in cod, ci in Script Properties.
 *  - Endpoint-ul cere un token, altfel oricine putea posta pe /exec.
 *  - Un esec la Virtuagym nu mai pierde inscrierea.
 *  - Acelasi script acopera toate cele patru formulare.
 */

// --------------------------------------------------------------------------
// Configurare — valorile vin din Script Properties
// --------------------------------------------------------------------------

function CONFIG() {
  var p = PropertiesService.getScriptProperties();
  return {
    token:            p.getProperty('SHARED_TOKEN') || '',
    sheetId:          p.getProperty('SHEET_ID') || '',
    folderId:         p.getProperty('DRIVE_FOLDER_ID') || '',
    templateMinor:    p.getProperty('TEMPLATE_DOC_MINOR') || '',
    templateAdult:    p.getProperty('TEMPLATE_DOC_ADULT') || '',
    notifyEmail:      p.getProperty('NOTIFY_EMAIL') || '',
    virtuagymKey:     p.getProperty('VIRTUAGYM_API_KEY') || '',
    virtuagymSecret:  p.getProperty('VIRTUAGYM_CLUB_SECRET') || '',
    virtuagymClubId:  p.getProperty('VIRTUAGYM_CLUB_ID') || '',
    clubPhone:        p.getProperty('CLUB_PHONE') || '+40 (744) 258 258',
    clubAddress:      p.getProperty('CLUB_ADDRESS') || 'Calea Giulești 18, sector 6, București',
  };
}

var LUNI = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN',
            'IUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// --------------------------------------------------------------------------
// Punctul de intrare
// --------------------------------------------------------------------------

function doPost(e) {
  var cfg = CONFIG();
  var data = (e && e.parameter) || {};

  try {
    if (cfg.token && data.token !== cfg.token) {
      return json({ status: 'error', error: 'Token invalid.' }, 403);
    }

    switch (data.formType) {
      case 'inscriere': return handleEnrollment(data, cfg);
      case 'contact':   return handleSimple(data, cfg, 'Contact');
      case 'pachet':    return handleSimple(data, cfg, 'Cerere abonament');
      case 'cariere':   return handleCareer(data, cfg);
      default:
        // Fara formType: pastram comportamentul vechi (doar inscrieri).
        return handleEnrollment(data, cfg);
    }
  } catch (err) {
    Logger.log('Eroare: ' + err.message + '\n' + err.stack);
    return json({ status: 'error', error: String(err.message || err) }, 500);
  }
}

function doGet() {
  return json({ status: 'ok', service: 'Bluemarin forms' });
}

// --------------------------------------------------------------------------
// Inscriere completa
// --------------------------------------------------------------------------

function handleEnrollment(data, cfg) {
  var birthDate = formatBirthdate(data.birthDate);
  var isAdult = String(data.enrolleeType || '').toLowerCase() === 'adult';
  var parent = isAdult ? (data.firstName || '') : (data.nameLegalParent || '-');

  appendRow(cfg.sheetId, 'Inscrieri', [
    new Date(), data.firstName || '', birthDate, parent,
    data.phone || '', data.email || '', data.locationName || '',
    isAdult ? 'adult' : 'minor', data.consentIp || '',
  ]);

  var avizBlob      = blobFrom(data, 'file', 'aviz-epidemiologic');
  var medicalBlob   = blobFrom(data, 'medicalCertificate', 'adeverinta-efort-fizic');
  var signatureBlob = blobFrom(data, 'signature', 'semnatura');

  var baseName = sanitize(data.firstName) + '_' + birthDate.replace(/\s+/g, '-');
  var template = isAdult ? (cfg.templateAdult || cfg.templateMinor)
                         : (cfg.templateMinor || cfg.templateAdult);

  var pdfBlob = buildEnrollmentPdf({
    templateId: template,
    name: baseName,
    fields: {
      '{NAME}':   data.firstName || '',
      '{DATE}':   birthDate,
      '{PARENT}': parent,
      '{PHONE}':  data.phone || '',
      '{EMAIL}':  data.email || '',
    },
    aviz: avizBlob,
    medical: medicalBlob,
    signature: signatureBlob,
  });

  var pdfUrl = '';
  if (pdfBlob && cfg.folderId) {
    var saved = DriveApp.getFolderById(cfg.folderId).createFile(pdfBlob);
    pdfUrl = saved.getUrl();
  }

  // Virtuagym e optional: daca pica, inscrierea ramane salvata.
  var memberId = null;
  try {
    memberId = createVirtuagymMember(cfg, data, pdfUrl);
  } catch (err) {
    Logger.log('Virtuagym a esuat: ' + err.message);
  }

  if (data.email) {
    GmailApp.sendEmail(data.email, 'Confirmare înscriere — Bluemarin Sport Club',
      'Salutare ' + parent + ',\n\nBine ai venit în Povestea Bluemarin!',
      {
        name: 'Bluemarin Sport Club',
        htmlBody: enrollmentEmailHtml(parent, cfg),
        attachments: pdfBlob ? [pdfBlob] : [],
      });
  }

  if (cfg.notifyEmail) {
    GmailApp.sendEmail(cfg.notifyEmail,
      'Înscriere nouă — ' + (data.firstName || '') + ' (' + (data.locationName || '') + ')',
      rowsText([
        ['Cursant', data.firstName], ['Data nașterii', birthDate],
        ['Părinte / reprezentant', parent], ['Telefon', data.phone],
        ['E-mail', data.email], ['Locație', data.locationName],
        ['Fișa PDF', pdfUrl],
      ]),
      { attachments: pdfBlob ? [pdfBlob] : [], replyTo: data.email || undefined });
  }

  return json({ status: 'succes', file: baseName + '.pdf', url: pdfUrl, member: memberId });
}

/**
 * Umple sablonul Google Docs si intoarce PDF-ul.
 *
 * Aici era bug-ul principal al scriptului vechi: returna documentul in loc de
 * PDF si il muta la gunoi inainte sa-l exporte, asa ca atasamentul lipsea.
 */
function buildEnrollmentPdf(opts) {
  if (!opts.templateId) {
    Logger.log('Nu e configurat niciun sablon — sar peste PDF.');
    return null;
  }

  var copy = DriveApp.getFileById(opts.templateId).makeCopy('TMP_' + opts.name);
  var doc = DocumentApp.openById(copy.getId());

  try {
    var body = doc.getBody();
    body.setMarginLeft(50).setMarginRight(50);

    Object.keys(opts.fields).forEach(function (key) {
      body.replaceText(escapeForReplace(key), opts.fields[key]);
    });

    var anchor = body.findText('\\{AVIZ\\}');
    var index = anchor
      ? body.getChildIndex(anchor.getElement().getParent()) + 1
      : body.getNumChildren();
    body.replaceText('\\{AVIZ\\}', '');

    index = insertDocument(body, index, 'Aviz epidemiologic', opts.aviz);
    index = insertDocument(body, index, 'Adeverință „apt efort fizic”', opts.medical);

    body.insertParagraph(index++, 'Semnătura')
        .setHeading(DocumentApp.ParagraphHeading.HEADING3);
    if (opts.signature) {
      resizeImage(body.insertImage(index++, opts.signature), 200);
    }
    body.insertParagraph(index++, 'Semnat la: ' + formatDateTime(new Date()));

    doc.saveAndClose();

    // Exportul trebuie facut CAT TIMP fisierul inca exista.
    var pdf = DriveApp.getFileById(copy.getId())
      .getAs('application/pdf')
      .setName(opts.name + '.pdf');

    copy.setTrashed(true);
    return pdf;
  } catch (err) {
    try { copy.setTrashed(true); } catch (ignored) {}
    Logger.log('Generarea PDF a esuat: ' + err.message);
    return null;
  }
}

function insertDocument(body, index, title, blob) {
  body.insertParagraph(index++, title).setHeading(DocumentApp.ParagraphHeading.HEADING3);
  if (!blob) return index;
  try {
    resizeImage(body.insertImage(index++, blob), 320);
  } catch (err) {
    // PDF-urile nu pot fi inserate ca imagine — notam doar ca exista.
    body.insertParagraph(index++, '(document atașat separat: ' + blob.getName() + ')');
  }
  return index;
}

// --------------------------------------------------------------------------
// Contact / cerere abonament
// --------------------------------------------------------------------------

function handleSimple(data, cfg, label) {
  appendRow(cfg.sheetId, label === 'Contact' ? 'Contact' : 'Cereri abonament', [
    new Date(), data.name || '', data.email || '', data.phone || '',
    data.package || '', data.location || '', data.age || '',
    data.subject || '', data.message || '',
  ]);

  if (cfg.notifyEmail) {
    GmailApp.sendEmail(cfg.notifyEmail, '[Site] ' + label + ' — ' + (data.name || ''),
      rowsText([
        ['Nume', data.name], ['E-mail', data.email], ['Telefon', data.phone],
        ['Pachet', data.package], ['Locație', data.location], ['Vârstă', data.age],
        ['Subiect', data.subject], ['Mesaj', data.message],
      ]),
      { replyTo: data.email || undefined });
  }

  return json({ status: 'succes' });
}

// --------------------------------------------------------------------------
// Cariere
// --------------------------------------------------------------------------

function handleCareer(data, cfg) {
  appendRow(cfg.sheetId, 'Cariere', [
    new Date(), data.name || '', data.email || '', data.phone || '', data.message || '',
  ]);

  var cv = blobFrom(data, 'cv', 'cv-' + sanitize(data.name));
  if (cv && cfg.folderId) DriveApp.getFolderById(cfg.folderId).createFile(cv);

  if (cfg.notifyEmail) {
    GmailApp.sendEmail(cfg.notifyEmail, '[Site] CV nou — ' + (data.name || ''),
      rowsText([
        ['Nume', data.name], ['E-mail', data.email],
        ['Telefon', data.phone], ['Mesaj', data.message],
      ]),
      { attachments: cv ? [cv] : [], replyTo: data.email || undefined });
  }

  return json({ status: 'succes' });
}

// --------------------------------------------------------------------------
// Virtuagym
// --------------------------------------------------------------------------

function createVirtuagymMember(cfg, data, pdfUrl) {
  if (!cfg.virtuagymKey || !cfg.virtuagymSecret || !cfg.virtuagymClubId) return null;

  var parts = String(data.firstName || '').trim().split(/\s+/);
  var lastName = parts.length > 1 ? parts.pop() : '';
  var firstName = parts.join(' ');

  var url = 'https://api.virtuagym.com/api/v1/club/' + cfg.virtuagymClubId + '/member/' +
            '?club_secret=' + encodeURIComponent(cfg.virtuagymSecret) +
            '&api_key=' + encodeURIComponent(cfg.virtuagymKey);

  var response = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      firstname: firstName || data.firstName || '',
      lastname: lastName,
      email: data.email || '',
      phone: data.phone || '',
      external_id: pdfUrl || '',
      active: true,
    }),
  });

  if (response.getResponseCode() >= 400) {
    throw new Error('Virtuagym ' + response.getResponseCode() + ': ' + response.getContentText());
  }

  var body = JSON.parse(response.getContentText());
  return (body && body.result && body.result.member_id) || null;
}

// --------------------------------------------------------------------------
// Ajutoare
// --------------------------------------------------------------------------

/** Decodeaza un camp base64 trimis de site intr-un blob Drive. */
function blobFrom(data, field, fallbackName) {
  var raw = data[field];
  if (!raw) return null;

  // Acceptam si forma completa "data:image/png;base64,…".
  if (raw.indexOf(',') > -1 && raw.indexOf('data:') === 0) raw = raw.split(',')[1];

  var type = data[field + '_type'] || 'image/png';
  var name = data[field + '_name'] || (fallbackName + extensionFor(type));

  try {
    return Utilities.newBlob(Utilities.base64Decode(raw), type, name);
  } catch (err) {
    Logger.log('Nu am putut decoda ' + field + ': ' + err.message);
    return null;
  }
}

function extensionFor(type) {
  if (type === 'application/pdf') return '.pdf';
  if (type === 'image/jpeg') return '.jpg';
  if (type === 'image/webp') return '.webp';
  return '.png';
}

function appendRow(sheetId, tabName, values) {
  if (!sheetId) return;
  var book = SpreadsheetApp.openById(sheetId);
  var sheet = book.getSheetByName(tabName) || book.insertSheet(tabName);
  sheet.appendRow(values);
}

function formatBirthdate(value) {
  var parts = String(value || '').split('/').map(Number);
  var zi = parts[0], luna = parts[1], an = parts[2];
  if (!zi || !luna || !an || luna < 1 || luna > 12) return 'Dată invalidă';
  return ('0' + zi).slice(-2) + ' ' + LUNI[luna - 1] + ' ' + an;
}

function formatDateTime(date) {
  return Utilities.formatDate(date, 'Europe/Bucharest', 'dd.MM.yyyy, HH:mm');
}

function sanitize(value) {
  return String(value || 'fara-nume').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

/** `replaceText` primeste o expresie regulata — acoladele trebuie escapate. */
function escapeForReplace(token) {
  return token.replace(/[{}]/g, '\\$&');
}

function resizeImage(image, width) {
  var ratio = image.getHeight() / image.getWidth();
  image.setWidth(width).setHeight(Math.round(width * ratio));
}

function rowsText(rows) {
  return rows
    .filter(function (r) { return r[1]; })
    .map(function (r) { return r[0] + ': ' + r[1]; })
    .join('\n');
}

function enrollmentEmailHtml(parent, cfg) {
  return '' +
    '<p>&#x1F91D; Salutare <i>' + parent + '</i>,</p>' +
    '<p>Bun venit în <strong>Povestea BLUEMARIN</strong> — locul în care fiecare val poartă o poveste!</p>' +
    '<p>În atașament găsești formularul de înscriere completat, împreună cu regulamentul și ' +
    'politicile clubului. Te rugăm să păstrezi acest document — un exemplar a fost arhivat ' +
    'și în sistemul nostru intern.</p>' +
    '<p>Rămâi în contact cu echipa noastră de la recepție pentru următorii pași.</p>' +
    '<br>' +
    '<p>Cu prietenie,<br>Echipa Bluemarin Sport Club</p>' +
    '<hr>' +
    '<p>&#x1F4F1; Tel: ' + cfg.clubPhone + '<br>' +
    '&#x1F3E2; Recepție Bluemarin Sport Club<br>' +
    '&#x1F4CD; ' + cfg.clubAddress + '</p>';
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
