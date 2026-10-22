"""Panoul de administrare: editare continut si vizualizare cereri."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from flask import (
    Blueprint,
    Response,
    abort,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)
from sqlalchemy import func, select

from .. import jsonform, media as media_lib, security as sec
from ..db import session_scope
from ..models import ContentBlock, MediaAsset, StoredFile, Submission
from ..revalidate import ping
from ..seed import KEYS, read_file, seed
from ..storage import load as load_file, save as save_file

bp = Blueprint("admin", __name__)

# Denumiri prietenoase pentru colectiile de continut.
LABELS = {
    "site": "Setari generale (meniu, contact, social)",
    "home": "Prima pagina",
    "courses": "Cursuri de inot",
    "kids": "Cursuri inot copii",
    "team": "Echipa",
    "locations": "Locatii",
    "pricing": "Tarife",
    "gallery": "Galerie",
    "careers": "Cariere",
    "contact": "Pagina de contact",
    "rules": "Regulament",
    "legal": "Pagini legale",
}

KIND_LABELS = {
    "contact": "Mesaj de contact",
    "pachet": "Cerere abonament",
    "inscriere": "Inscriere",
    "cariere": "CV / cariere",
}

ROLE_LABELS = {
    "document": "Document identitate",
    "aviz-medical": "Aviz medical",
    "semnatura": "Semnatura",
    "fisa-pdf": "Fisa PDF",
    "cv": "CV",
}


@bp.app_template_filter("datetime_ro")
def datetime_ro(value: datetime | None) -> str:
    if not value:
        return "—"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.strftime("%d.%m.%Y %H:%M")


# --------------------------------------------------------------------------- #
# Autentificare
# --------------------------------------------------------------------------- #

@bp.route("/login", methods=["GET", "POST"])
def login():
    if sec.current_admin():
        return redirect(url_for("admin.dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "")
        password = request.form.get("password", "")

        if sec.verify_login(email, password):
            sec.login_session(email)
            nxt = request.args.get("next", "")
            # Acceptam doar redirectari interne.
            if nxt.startswith("/api/admin"):
                return redirect(nxt)
            return redirect(url_for("admin.dashboard"))

        flash("Email sau parola gresita.", "error")

    return render_template("admin/login.html")


@bp.post("/logout")
@sec.login_required
def logout():
    sec.logout_session()
    return redirect(url_for("admin.login"))


# --------------------------------------------------------------------------- #
# Panou principal
# --------------------------------------------------------------------------- #

@bp.get("/")
@sec.login_required
def dashboard():
    with session_scope() as db:
        counts = dict(
            db.execute(
                select(Submission.kind, func.count(Submission.id)).group_by(Submission.kind)
            ).all()
        )
        pending = db.scalar(
            select(func.count(Submission.id)).where(Submission.handled.is_(False))
        )
        recent = list(
            db.scalars(select(Submission).order_by(Submission.created_at.desc()).limit(8))
        )
        updated = {
            b.key: b.updated_at for b in db.scalars(select(ContentBlock))
        }

    return render_template(
        "admin/dashboard.html",
        counts=counts,
        pending=pending or 0,
        recent=recent,
        kind_labels=KIND_LABELS,
        labels=LABELS,
        keys=KEYS,
        updated=updated,
    )


# --------------------------------------------------------------------------- #
# Continut
# --------------------------------------------------------------------------- #

def _current_value(key: str) -> dict:
    """Valoarea editabila: din baza de date daca exista, altfel din fisier."""
    with session_scope() as db:
        block = db.scalar(select(ContentBlock).where(ContentBlock.key == key))
        if block:
            return json.loads(block.value)
    return read_file(key) or {}


def _save_value(key: str, value: dict, author: str) -> None:
    payload = json.dumps(value, ensure_ascii=False, indent=2)
    with session_scope() as db:
        block = db.scalar(select(ContentBlock).where(ContentBlock.key == key))
        if block:
            block.value = payload
            block.updated_by = author
        else:
            db.add(ContentBlock(key=key, value=payload, updated_by=author))


@bp.get("/continut")
@sec.login_required
def content_index():
    with session_scope() as db:
        updated = {b.key: b.updated_at for b in db.scalars(select(ContentBlock))}
    return render_template(
        "admin/content_index.html", keys=KEYS, labels=LABELS, updated=updated
    )


@bp.route("/continut/<key>", methods=["GET", "POST"])
@sec.login_required
def content_edit(key: str):
    if key not in KEYS:
        abort(404)

    current = _current_value(key)

    if request.method == "POST":
        form = request.form.to_dict()
        # Checkbox-urile nebifate nu apar in POST — le completam cu "".
        tree = jsonform.build(current, label=LABELS.get(key, key))
        for path in jsonform.checkbox_paths(tree):
            form.setdefault(path, "")

        updated = jsonform.apply_form(current, form)
        _save_value(key, updated, sec.current_admin() or "admin")

        refreshed = ping(key)
        flash(
            "Modificarile au fost salvate."
            + (" Site-ul a fost actualizat." if refreshed else " Apar pe site in cateva minute."),
            "success",
        )
        return redirect(url_for("admin.content_edit", key=key))

    tree = jsonform.build(current, label=LABELS.get(key, key))
    return render_template(
        "admin/content_edit.html",
        key=key,
        title=LABELS.get(key, key),
        tree=tree,
    )


@bp.route("/continut/<key>/json", methods=["GET", "POST"])
@sec.login_required
def content_json(key: str):
    """Editorul brut, pentru cand vrei sa adaugi sau sa stergi elemente intregi."""
    if key not in KEYS:
        abort(404)

    current = _current_value(key)
    raw = json.dumps(current, ensure_ascii=False, indent=2)

    if request.method == "POST":
        submitted = request.form.get("json", "")
        try:
            parsed = json.loads(submitted)
        except json.JSONDecodeError as exc:
            flash(f"JSON invalid: {exc.msg} (linia {exc.lineno}).", "error")
            return render_template(
                "admin/content_json.html",
                key=key,
                title=LABELS.get(key, key),
                raw=submitted,
            )

        _save_value(key, parsed, sec.current_admin() or "admin")
        ping(key)
        flash("Modificarile au fost salvate.", "success")
        return redirect(url_for("admin.content_json", key=key))

    return render_template(
        "admin/content_json.html", key=key, title=LABELS.get(key, key), raw=raw
    )


@bp.post("/continut/<key>/reseteaza")
@sec.login_required
def content_reset(key: str):
    """Revine la textul initial din content/<key>.json."""
    if key not in KEYS:
        abort(404)

    original = read_file(key)
    if original is None:
        flash("Nu exista un fisier initial pentru aceasta sectiune.", "error")
        return redirect(url_for("admin.content_edit", key=key))

    _save_value(key, original, sec.current_admin() or "admin")
    ping(key)
    flash("Sectiunea a fost readusa la textele initiale.", "success")
    return redirect(url_for("admin.content_edit", key=key))


@bp.post("/continut/reincarca")
@sec.login_required
def content_seed():
    report = seed(overwrite=False)
    added = [k for k, v in report.items() if v == "adăugat"]
    ping(None)
    flash(
        f"Sectiuni adaugate: {', '.join(added)}." if added else "Totul era deja in baza de date.",
        "success",
    )
    return redirect(url_for("admin.content_index"))


@bp.post("/revalideaza")
@sec.login_required
def revalidate_now():
    ok = ping(None)
    flash(
        "Site-ul a fost actualizat." if ok else
        "Nu am putut contacta site-ul. Verifica SITE_URL si REVALIDATE_SECRET.",
        "success" if ok else "error",
    )
    return redirect(request.referrer or url_for("admin.dashboard"))


# --------------------------------------------------------------------------- #
# Poze
# --------------------------------------------------------------------------- #

@bp.get("/poze")
@sec.login_required
def media_index():
    with session_scope() as db:
        assets = list(db.scalars(select(MediaAsset).order_by(MediaAsset.created_at.desc())))
        total = sum(a.size for a in assets)
    return render_template("admin/media.html", assets=assets, total_bytes=total)


@bp.post("/poze")
@sec.login_required
def media_upload():
    """Primeste una sau mai multe poze.

    Raspunde cu JSON cand e chemata din editorul de continut (unde completam
    campul fara sa parasim pagina) si cu redirect cand vine din biblioteca.
    """
    wants_json = request.headers.get("Accept", "").startswith("application/json")
    files = [f for f in request.files.getlist("file") if f and f.filename]

    if not files:
        if wants_json:
            return jsonify({"error": "Nu ai ales nicio poză."}), 400
        flash("Nu ai ales nicio poză.", "error")
        return redirect(url_for("admin.media_index"))

    saved: list[dict[str, object]] = []
    errors: list[str] = []

    for f in files:
        content = f.read()
        if (f.mimetype or "").lower() not in media_lib.ACCEPTED:
            errors.append(f"{f.filename}: formatul nu este acceptat.")
            continue
        try:
            prepared = media_lib.prepare(content, f.filename)
        except media_lib.MediaError as exc:
            errors.append(f"{f.filename}: {exc}")
            continue

        with session_scope() as db:
            asset = MediaAsset(
                slug=prepared.slug,
                filename=f.filename[:255],
                content_type=prepared.content_type,
                width=prepared.width,
                height=prepared.height,
                size=len(prepared.content),
                alt=request.form.get("alt", "")[:255],
                uploaded_by=sec.current_admin() or "admin",
            )
            db.add(asset)
            db.flush()
            stored = save_file(asset.id, "media", prepared.slug, prepared.content,
                               prepared.content_type)
            asset.data = stored.data
            asset.storage_key = stored.storage_key
            saved.append({
                "url": f"/api/media/{prepared.slug}",
                "slug": prepared.slug,
                "width": prepared.width,
                "height": prepared.height,
            })

    if wants_json:
        if not saved:
            return jsonify({"error": " ".join(errors) or "Încărcarea a eșuat."}), 400
        return jsonify({"uploaded": saved, "errors": errors})

    for e in errors:
        flash(e, "error")
    if saved:
        flash(
            f"{len(saved)} {'poză încărcată' if len(saved) == 1 else 'poze încărcate'}.",
            "success",
        )
    return redirect(url_for("admin.media_index"))


@bp.post("/poze/<int:asset_id>/sterge")
@sec.login_required
def media_delete(asset_id: int):
    with session_scope() as db:
        asset = db.get(MediaAsset, asset_id)
        if asset is None:
            abort(404)
        slug = asset.slug
        db.delete(asset)

    # Nu stergem si din S3/disc: daca o pagina mai trimite la poza, mai bine o
    # gaseste decat sa ramana cu un patrat gol. Fisierele orfane se curata rar,
    # manual, cand chiar deranjeaza.
    flash(
        f"Poza a fost ștearsă. Dacă mai e folosită undeva, înlocuiește „/api/media/{slug}”.",
        "success",
    )
    return redirect(url_for("admin.media_index"))


# --------------------------------------------------------------------------- #
# Cereri primite
# --------------------------------------------------------------------------- #

@bp.get("/cereri")
@sec.login_required
def submissions():
    kind = request.args.get("tip", "")
    only_pending = request.args.get("nerezolvate") == "1"
    page = max(int(request.args.get("pagina", 1) or 1), 1)
    per_page = 25

    query = select(Submission).order_by(Submission.created_at.desc())
    count_query = select(func.count(Submission.id))

    if kind in KIND_LABELS:
        query = query.where(Submission.kind == kind)
        count_query = count_query.where(Submission.kind == kind)
    if only_pending:
        query = query.where(Submission.handled.is_(False))
        count_query = count_query.where(Submission.handled.is_(False))

    with session_scope() as db:
        total = db.scalar(count_query) or 0
        rows = list(db.scalars(query.limit(per_page).offset((page - 1) * per_page)))

    return render_template(
        "admin/submissions.html",
        rows=rows,
        kind=kind,
        only_pending=only_pending,
        kind_labels=KIND_LABELS,
        page=page,
        pages=max((total + per_page - 1) // per_page, 1),
        total=total,
    )


@bp.route("/cereri/<int:submission_id>", methods=["GET", "POST"])
@sec.login_required
def submission_detail(submission_id: int):
    with session_scope() as db:
        row = db.get(Submission, submission_id)
        if row is None:
            abort(404)

        if request.method == "POST":
            row.handled = request.form.get("handled") == "1"
            row.notes = (request.form.get("notes") or "")[:5000]
            flash("Cererea a fost actualizata.", "success")
            return redirect(url_for("admin.submission_detail", submission_id=submission_id))

        files = list(
            db.scalars(select(StoredFile).where(StoredFile.submission_id == submission_id))
        )

    return render_template(
        "admin/submission_detail.html",
        row=row,
        files=files,
        kind_labels=KIND_LABELS,
        role_labels=ROLE_LABELS,
    )


@bp.get("/fisier/<int:file_id>")
@sec.login_required
def download(file_id: int):
    with session_scope() as db:
        stored = db.get(StoredFile, file_id)
        if stored is None:
            abort(404)
        content = load_file(stored.storage_key, stored.data)
        filename = stored.filename
        content_type = stored.content_type or "application/octet-stream"

    if content is None:
        abort(404)

    return Response(
        content,
        mimetype=content_type,
        headers={
            # inline pentru PDF/imagini ca sa se vada in browser, attachment pentru restul
            "Content-Disposition": (
                f'inline; filename="{filename}"'
                if content_type.startswith(("image/", "application/pdf"))
                else f'attachment; filename="{filename}"'
            ),
            "X-Content-Type-Options": "nosniff",
        },
    )


@bp.get("/export.csv")
@sec.login_required
def export_csv():
    """Toate cererile, pentru Excel."""
    import csv
    import io

    kind = request.args.get("tip", "")
    query = select(Submission).order_by(Submission.created_at.desc())
    if kind in KIND_LABELS:
        query = query.where(Submission.kind == kind)

    with session_scope() as db:
        rows = list(db.scalars(query))

    buf = io.StringIO()
    writer = csv.writer(buf, delimiter=";")
    writer.writerow(
        ["Data", "Tip", "Nume", "Email", "Telefon", "Pachet", "Locatie",
         "Varsta", "Data nasterii", "Parinte", "Mesaj", "Rezolvat", "Note"]
    )
    for r in rows:
        writer.writerow([
            datetime_ro(r.created_at), KIND_LABELS.get(r.kind, r.kind), r.name, r.email,
            r.phone, r.package, r.location, r.age, r.birth_date, r.legal_parent,
            r.message.replace("\n", " "), "da" if r.handled else "nu",
            r.notes.replace("\n", " "),
        ])

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return Response(
        # BOM ca Excel sa recunoasca diacriticele
        "﻿" + buf.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="cereri-bluemarin-{stamp}.csv"'},
    )
