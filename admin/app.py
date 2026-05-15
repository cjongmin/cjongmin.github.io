"""
Profile Admin Panel — Gradio UI for editing your research profile.

Run:
    source .venv/bin/activate
    python app.py

Then open http://localhost:7860 in your browser.
"""

import json
import os
import re
import shutil
import subprocess
from pathlib import Path

import gradio as gr

ROOT = Path(__file__).parent.parent
DATA = ROOT / "src" / "data"
PUBLIC = ROOT / "public"
PUB_IMG = PUBLIC / "publications"
PUB_IMG.mkdir(parents=True, exist_ok=True)


# ── JSON helpers ───────────────────────────────────────────────────────────────

def rjson(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)

def wjson(name: str, data):
    with open(DATA / name, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return f"✅ Saved to {name}"

def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower().strip())[:40].strip("-")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 1 — PROFILE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def profile_load():
    p = rjson("profile.json")
    li = p.get("links", {})
    img = p.get("profileImage", "") or ""
    preview = str(PUBLIC / img.lstrip("/")) if img else None
    return (
        p.get("name", ""),
        p.get("title", ""),
        p.get("affiliation", ""),
        p.get("university", ""),
        p.get("email", ""),
        p.get("location", ""),
        li.get("github", ""),
        li.get("linkedin", ""),
        li.get("scholar", ""),
        p.get("bio", ""),
        ", ".join(p.get("interests", [])),
        ", ".join(p.get("keywords", [])),
        preview,
    )

def profile_save(name, title, affiliation, university, email, location,
                 github, linkedin, scholar, bio, interests_str, keywords_str, img_path):
    p = rjson("profile.json")
    p.update({
        "name": name.strip(),
        "title": title.strip(),
        "affiliation": affiliation.strip(),
        "university": university.strip(),
        "email": email.strip(),
        "location": location.strip(),
        "links": {
            "github": github.strip(),
            "linkedin": linkedin.strip(),
            "scholar": scholar.strip(),
        },
        "bio": bio.strip(),
        "interests": [x.strip() for x in interests_str.split(",") if x.strip()],
        "keywords": [x.strip() for x in keywords_str.split(",") if x.strip()],
    })
    if img_path:
        dest = PUBLIC / "profile.jpg"
        shutil.copy(img_path, dest)
        p["profileImage"] = "/profile.jpg"
    wjson("profile.json", p)
    return "✅ Profile saved!"


def cv_get_status():
    p = rjson("profile.json")
    cv = p.get("cvFile", "")
    if cv:
        fpath = PUBLIC / cv.lstrip("/")
        size = f" ({fpath.stat().st_size // 1024} KB)" if fpath.exists() else " (file missing)"
        return f"✅ CV uploaded: {cv}{size}"
    return "No CV uploaded"

def cv_upload(file_path):
    if not file_path:
        return "⚠️ No file selected."
    dest = PUBLIC / "cv.pdf"
    shutil.copy(file_path, dest)
    p = rjson("profile.json")
    p["cvFile"] = "/cv.pdf"
    wjson("profile.json", p)
    size = dest.stat().st_size // 1024
    return f"✅ CV uploaded: /cv.pdf ({size} KB)"

def cv_remove():
    cv_path = PUBLIC / "cv.pdf"
    if cv_path.exists():
        cv_path.unlink()
    p = rjson("profile.json")
    p["cvFile"] = ""
    wjson("profile.json", p)
    return "✅ CV removed. Button will be hidden on the site."


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 2 — PUBLICATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def pub_choices():
    pubs = rjson("publications.json")
    return [f"[{i}] {p['year']} | {p['venue']} | {p['title'][:55]}"
            for i, p in enumerate(pubs)]

def pub_load(choice):
    if not choice:
        # year and order must be numbers, not "" — gr.Number rejects strings
        return (-1, "", "", "", "", 2025, 1, "", "", "", "", "", "", "", "", None)
    pubs = rjson("publications.json")
    idx = int(choice.split("]")[0].lstrip("["))
    p = pubs[idx]
    li = p.get("links", {})
    img_str = p.get("image", "") or ""
    preview = str(PUBLIC / img_str.lstrip("/")) if img_str else None
    return (
        idx,
        p.get("id", ""),
        p.get("title", ""),
        ", ".join(p.get("authors", [])),
        p.get("venue", ""),
        p.get("year", 2025),
        p.get("order", 1),
        ", ".join(p.get("tags", [])),
        li.get("paper", ""),
        li.get("scholar", ""),
        li.get("code", ""),
        li.get("project", ""),
        p.get("bibtex", ""),
        p.get("presentationType", "None") or "None",
        img_str,
        preview,
    )

def pub_new():
    return (-1, "", "", "", "", 2025, 1, "", "", "", "", "", "", "None", "", None)

def pub_save(state_idx, pub_id, title, authors_str, venue, year, order,
             tags_str, paper, scholar, code, project, bibtex, present_type,
             current_img_str, new_img_path):
    pubs = rjson("publications.json")

    image_val = current_img_str or ""
    if new_img_path:
        ext = Path(new_img_path).suffix or ".jpg"
        fname = f"{(pub_id or slugify(title))}{ext}"
        shutil.copy(new_img_path, PUB_IMG / fname)
        image_val = f"/publications/{fname}"

    links = {k: v for k, v in {
        "paper": paper.strip(),
        "scholar": scholar.strip(),
        "code": code.strip(),
        "project": project.strip(),
    }.items() if v.strip()}

    entry = {
        "id": (pub_id or slugify(title)).strip(),
        "title": title.strip(),
        "authors": [a.strip() for a in authors_str.split(",") if a.strip()],
        "venue": venue.strip(),
        "year": int(year),
        "order": int(order),
        "tags": [t.strip() for t in tags_str.split(",") if t.strip()],
    }
    if links:
        entry["links"] = links
    if bibtex.strip():
        entry["bibtex"] = bibtex.strip()
    if image_val:
        entry["image"] = image_val
    if present_type and present_type != "None":
        entry["presentationType"] = present_type

    if 0 <= int(state_idx) < len(pubs):
        pubs[int(state_idx)] = entry
        msg = f"✅ Updated: {title[:50]}"
    else:
        pubs.append(entry)
        msg = f"✅ Added: {title[:50]}"

    wjson("publications.json", pubs)
    # Return 3 values: status, updated dropdown, reset state index
    return msg, gr.update(choices=pub_choices(), value=None), -1

def pub_delete(state_idx):
    if int(state_idx) < 0:
        return "⚠️ Nothing selected.", gr.update(), -1
    pubs = rjson("publications.json")
    idx = int(state_idx)
    if idx >= len(pubs):
        return "⚠️ Index out of range.", gr.update(), -1
    name = pubs[idx]["title"][:50]
    pubs.pop(idx)
    wjson("publications.json", pubs)
    return f"🗑️ Deleted: {name}", gr.update(choices=pub_choices(), value=None), -1


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 3 — EXPERIENCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def exp_choices():
    exps = rjson("experiences.json")
    return [f"[{i}] {e['startDate']} — {e['endDate']} | {e['title']}"
            for i, e in enumerate(exps)]

def exp_load(choice):
    if not choice:
        return (-1,) + ("",) * 9
    exps = rjson("experiences.json")
    idx = int(choice.split("]")[0].lstrip("["))
    e = exps[idx]
    return (
        idx,
        e.get("id", ""),
        e.get("title", ""),
        e.get("organization", ""),
        e.get("location", ""),
        e.get("startDate", ""),
        e.get("endDate", "Present"),
        e.get("description", ""),
        ", ".join(e.get("tags", [])),
        e.get("link", ""),
    )

def exp_new():
    return (-1, "", "", "", "", "", "Present", "", "", "")

def exp_save(state_idx, exp_id, title, organization, location,
             start_date, end_date, description, tags_str, link):
    exps = rjson("experiences.json")
    entry = {
        "id": (exp_id or slugify(title)).strip(),
        "title": title.strip(),
        "organization": organization.strip(),
        "location": location.strip(),
        "startDate": start_date.strip(),
        "endDate": end_date.strip(),
        "description": description.strip(),
        "tags": [t.strip() for t in tags_str.split(",") if t.strip()],
    }
    if link.strip():
        entry["link"] = link.strip()

    if 0 <= int(state_idx) < len(exps):
        exps[int(state_idx)] = entry
        msg = f"✅ Updated: {title}"
    else:
        exps.append(entry)
        msg = f"✅ Added: {title}"

    wjson("experiences.json", exps)
    return msg, gr.update(choices=exp_choices(), value=None), -1

def exp_delete(state_idx):
    if int(state_idx) < 0:
        return "⚠️ Nothing selected.", gr.update(), -1
    exps = rjson("experiences.json")
    idx = int(state_idx)
    if idx >= len(exps):
        return "⚠️ Index out of range.", gr.update(), -1
    name = exps[idx]["title"]
    exps.pop(idx)
    wjson("experiences.json", exps)
    return f"🗑️ Deleted: {name}", gr.update(choices=exp_choices(), value=None), -1


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 4 — GIT DEPLOY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _clean_env():
    """Return env without VSCode's GIT_ASKPASS, which breaks git push in subprocesses."""
    env = os.environ.copy()
    for key in ("GIT_ASKPASS", "SSH_ASKPASS", "VSCODE_GIT_ASKPASS_NODE",
                "VSCODE_GIT_ASKPASS_EXTRA_ARGS", "VSCODE_GIT_IPC_HANDLE"):
        env.pop(key, None)
    return env

def git_run(*args):
    r = subprocess.run(list(args), cwd=ROOT, capture_output=True, text=True, env=_clean_env())
    out = (r.stdout + r.stderr).strip()
    return f"$ {' '.join(args)}\n{out}"

def git_status_fn():
    return git_run("git", "status", "--short")

def git_commit_push(msg):
    if not msg.strip():
        return "⚠️ Commit message is empty."
    log = []
    log.append(git_run("git", "add", "."))
    log.append(git_run("git", "commit", "-m", msg.strip()))
    r = subprocess.run(["git", "push"], cwd=ROOT, capture_output=True, text=True, env=_clean_env())
    push_out = (r.stdout + r.stderr).strip()
    log.append(f"$ git push\n{push_out}")
    if r.returncode == 0:
        log.append("\n✅ Pushed! GitHub Actions will build & deploy in ~1–2 minutes.")
        log.append("   → https://cjongmin.github.io")
    else:
        log.append("\n⚠️  Push failed. Run  GIT_ASKPASS= git push  in the terminal once to save credentials.")
    return "\n\n".join(log)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GRADIO UI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

with gr.Blocks(title="Profile Admin") as demo:
    gr.Markdown("# 📝 Research Profile Admin Panel")
    gr.Markdown("Edit your profile, publications, and experience. Click **Commit & Push** when done to deploy.")

    with gr.Tabs():

        # ── Profile ────────────────────────────────────────────────────────────
        with gr.Tab("👤 Profile"):
            with gr.Row():
                with gr.Column():
                    p_name  = gr.Textbox(label="Full Name")
                    p_title = gr.Textbox(label="Position / Title")
                    p_aff   = gr.Textbox(label="Lab / Group")
                    p_uni   = gr.Textbox(label="University")
                    p_email = gr.Textbox(label="Email")
                    p_loc   = gr.Textbox(label="Location")
                with gr.Column():
                    p_gh  = gr.Textbox(label="GitHub URL")
                    p_li  = gr.Textbox(label="LinkedIn URL")
                    p_sc  = gr.Textbox(label="Google Scholar URL")
                    p_img = gr.Image(label="Profile Photo", type="filepath", height=200)
            p_bio = gr.Textbox(label="Bio (separate paragraphs with blank line)", lines=5)
            p_int = gr.Textbox(label="Research Interests (comma-separated)")
            p_kw  = gr.Textbox(label="Hero Keywords (comma-separated)")

            with gr.Row():
                p_load_btn = gr.Button("🔄 Load Current", variant="secondary")
                p_save_btn = gr.Button("💾 Save Profile", variant="primary")
            p_status = gr.Textbox(label="Status", interactive=False)

            gr.Markdown("---")
            gr.Markdown("### 📄 CV / Resume")
            p_cv_status  = gr.Textbox(label="Current CV", interactive=False)
            p_cv_file    = gr.File(label="Upload CV (PDF only)", file_types=[".pdf"], type="filepath")
            with gr.Row():
                p_cv_upload_btn = gr.Button("📤 Upload CV", variant="primary")
                p_cv_remove_btn = gr.Button("🗑️ Remove CV", variant="stop")

            p_load_btn.click(
                profile_load,
                outputs=[p_name, p_title, p_aff, p_uni, p_email, p_loc,
                         p_gh, p_li, p_sc, p_bio, p_int, p_kw, p_img],
            )
            p_save_btn.click(
                profile_save,
                inputs=[p_name, p_title, p_aff, p_uni, p_email, p_loc,
                        p_gh, p_li, p_sc, p_bio, p_int, p_kw, p_img],
                outputs=p_status,
            )
            p_cv_upload_btn.click(cv_upload, inputs=p_cv_file, outputs=p_cv_status)
            p_cv_remove_btn.click(cv_remove, outputs=p_cv_status)

            demo.load(profile_load,
                      outputs=[p_name, p_title, p_aff, p_uni, p_email, p_loc,
                                p_gh, p_li, p_sc, p_bio, p_int, p_kw, p_img])
            demo.load(cv_get_status, outputs=p_cv_status)

        # ── Publications ───────────────────────────────────────────────────────
        with gr.Tab("📄 Publications"):
            pub_state_idx = gr.State(-1)
            pub_cur_img   = gr.State("")

            with gr.Row():
                pub_dd  = gr.Dropdown(label="Select Publication", choices=pub_choices(), scale=4)
                pub_new_btn = gr.Button("➕ New", scale=1)

            gr.Markdown("---")
            with gr.Row():
                with gr.Column():
                    pub_id      = gr.Textbox(label="ID (auto-generated if blank)")
                    pub_title   = gr.Textbox(label="Title")
                    pub_authors = gr.Textbox(label="Authors (comma-separated)")
                    pub_venue   = gr.Textbox(label="Venue (e.g. NeurIPS, CVPR)")
                    with gr.Row():
                        pub_year  = gr.Number(label="Year", value=2025, precision=0)
                        pub_order = gr.Number(label="Order within year", value=1, precision=0)
                    pub_tags = gr.Textbox(label="Tags (comma-separated)")
                with gr.Column():
                    pub_paper        = gr.Textbox(label="Paper URL (arXiv etc.)")
                    pub_scholar      = gr.Textbox(label="Google Scholar URL")
                    pub_code         = gr.Textbox(label="Code URL")
                    pub_project      = gr.Textbox(label="Project Page URL")
                    pub_present_type = gr.Dropdown(
                        label="Presentation Type",
                        choices=["None", "Oral", "Poster", "Spotlight"],
                        value="None",
                    )
                    pub_bibtex  = gr.Textbox(label="BibTeX", lines=5)
                    pub_img     = gr.Image(label="Representative Image", type="filepath", height=160)

            with gr.Row():
                pub_save_btn   = gr.Button("💾 Save", variant="primary")
                pub_delete_btn = gr.Button("🗑️ Delete", variant="stop")
            pub_status = gr.Textbox(label="Status", interactive=False)

            def _pub_load(choice):
                vals = pub_load(choice)
                # vals: (idx, id, title, authors, venue, year, order, tags,
                #        paper, scholar, code, project, bibtex, present_type, img_str, img_preview)
                return (vals[0], vals[14],   # state_idx, cur_img_str
                        vals[1], vals[2], vals[3], vals[4],
                        vals[5], vals[6], vals[7], vals[8],
                        vals[9], vals[10], vals[11], vals[13], vals[12],
                        vals[15])

            pub_dd.change(
                _pub_load, inputs=pub_dd,
                outputs=[pub_state_idx, pub_cur_img,
                         pub_id, pub_title, pub_authors, pub_venue,
                         pub_year, pub_order, pub_tags, pub_paper,
                         pub_scholar, pub_code, pub_project, pub_present_type, pub_bibtex, pub_img],
            )
            pub_new_btn.click(
                pub_new,
                outputs=[pub_state_idx, pub_id, pub_title, pub_authors,
                         pub_venue, pub_year, pub_order, pub_tags,
                         pub_paper, pub_scholar, pub_code, pub_project,
                         pub_bibtex, pub_present_type, pub_cur_img, pub_img],
            )
            pub_save_btn.click(
                pub_save,
                inputs=[pub_state_idx, pub_id, pub_title, pub_authors,
                        pub_venue, pub_year, pub_order, pub_tags,
                        pub_paper, pub_scholar, pub_code, pub_project,
                        pub_bibtex, pub_present_type, pub_cur_img, pub_img],
                outputs=[pub_status, pub_dd, pub_state_idx],
            )
            pub_delete_btn.click(
                pub_delete,
                inputs=[pub_state_idx],
                outputs=[pub_status, pub_dd, pub_state_idx],
            )

        # ── Experience ─────────────────────────────────────────────────────────
        with gr.Tab("💼 Experience"):
            exp_state_idx = gr.State(-1)

            with gr.Row():
                exp_dd      = gr.Dropdown(label="Select Entry", choices=exp_choices(), scale=4)
                exp_new_btn = gr.Button("➕ New", scale=1)

            gr.Markdown("---")
            with gr.Row():
                with gr.Column():
                    exp_id    = gr.Textbox(label="ID (auto-generated if blank)")
                    exp_title = gr.Textbox(label="Position / Degree Title")
                    exp_org   = gr.Textbox(label="Organization / Institution")
                    exp_loc   = gr.Textbox(label="Location")
                with gr.Column():
                    exp_start = gr.Textbox(label="Start Date (e.g. Sep 2023)")
                    exp_end   = gr.Textbox(label="End Date (e.g. Present)")
                    exp_tags  = gr.Textbox(label="Tags (comma-separated)")
                    exp_link  = gr.Textbox(label="Link (optional)")
            exp_desc = gr.Textbox(label="Description", lines=4)

            with gr.Row():
                exp_save_btn   = gr.Button("💾 Save", variant="primary")
                exp_delete_btn = gr.Button("🗑️ Delete", variant="stop")
            exp_status = gr.Textbox(label="Status", interactive=False)

            def _exp_load(choice):
                vals = exp_load(choice)
                return vals  # (idx, id, title, org, loc, start, end, desc, tags, link)

            exp_dd.change(
                _exp_load, inputs=exp_dd,
                outputs=[exp_state_idx, exp_id, exp_title, exp_org, exp_loc,
                         exp_start, exp_end, exp_desc, exp_tags, exp_link],
            )
            exp_new_btn.click(
                exp_new,
                outputs=[exp_state_idx, exp_id, exp_title, exp_org, exp_loc,
                         exp_start, exp_end, exp_desc, exp_tags, exp_link],
            )
            exp_save_btn.click(
                exp_save,
                inputs=[exp_state_idx, exp_id, exp_title, exp_org, exp_loc,
                        exp_start, exp_end, exp_desc, exp_tags, exp_link],
                outputs=[exp_status, exp_dd, exp_state_idx],
            )
            exp_delete_btn.click(
                exp_delete,
                inputs=[exp_state_idx],
                outputs=[exp_status, exp_dd, exp_state_idx],
            )

        # ── Git Deploy ─────────────────────────────────────────────────────────
        with gr.Tab("🚀 Commit & Deploy"):
            gr.Markdown(
                "Changes saved above are written to JSON files immediately. "
                "Click **Commit & Push** to upload them to GitHub — "
                "GitHub Actions will then build and deploy the site automatically (~1–2 min)."
            )
            git_status_out = gr.Textbox(label="Current git status", lines=6, interactive=False)
            git_refresh = gr.Button("🔄 Refresh Status", variant="secondary")
            git_msg  = gr.Textbox(label="Commit message", value="Update profile content", lines=1)
            git_btn  = gr.Button("🚀 Commit & Push", variant="primary", size="lg")
            git_log  = gr.Textbox(label="Output", lines=12, interactive=False)

            git_refresh.click(git_status_fn, outputs=git_status_out)
            git_btn.click(git_commit_push, inputs=git_msg, outputs=git_log)
            demo.load(git_status_fn, outputs=git_status_out)


if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
    )
