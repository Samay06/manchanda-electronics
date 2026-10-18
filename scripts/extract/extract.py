"""
Manchanda Electricals - Phase 1 extraction.

Parses the Havells and Orient fan catalogues into data/products.json,
exports product cut-out images as WebP, and writes data/extract_report.md.

Run from the project root:  python scripts/extract/extract.py
Requires: pymupdf, pillow
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

import pymupdf
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PDF_DIR = os.path.join(ROOT, "data", "pdfs")
IMG_DIR = os.path.join(ROOT, "data", "images")
OUT_JSON = os.path.join(ROOT, "data", "products.json")
OUT_REPORT = os.path.join(ROOT, "data", "extract_report.md")

HAVELLS_PDF = "Catalogue_Havells_Consumer_Industrial_Fans.pdf"
ORIENT_PDF = "Orient_Electric_Fans_Catalogue_2026_1_1.pdf"

CATEGORIES = {
    "ceiling-fans": "Ceiling Fans",
    "table-fans": "Table Fans",
    "pedestal-fans": "Pedestal Fans",
    "wall-fans": "Wall Fans",
    "exhaust-fans": "Exhaust & Ventilation Fans",
    "personal-fans": "Personal Fans",
    "industrial-fans": "Industrial Fans",
}

# --- Section maps: (first page, last page) -> (category slug, sub-category) ---------
HAVELLS_SECTIONS = [
    (16, 39, "ceiling-fans", "BLDC Underlight"),
    (40, 67, "ceiling-fans", "BLDC"),
    (68, 73, "ceiling-fans", "Special Finish"),
    (74, 91, "ceiling-fans", "Decorative"),
    (92, 101, "ceiling-fans", "Regular"),
    (102, 109, "table-fans", "Table Fans"),
    (110, 127, "pedestal-fans", "Pedestal Fans"),
    (128, 141, "wall-fans", "Wall Fans"),
    (142, 149, "personal-fans", "Personal Fans"),
    (150, 167, "exhaust-fans", "Ventilation Fans"),
    (168, 176, "industrial-fans", "Industrial Fans"),
]
ORIENT_SECTIONS = [
    (29, 46, "ceiling-fans", "BLDC"),          # Aero series
    (49, 60, "ceiling-fans", "BLDC"),          # Energy efficient (Ecotech etc.)
    (63, 71, "ceiling-fans", "Vintage"),
    (74, 83, "ceiling-fans", "Decorative"),
    (86, 94, "ceiling-fans", "Regular"),       # Orient calls these "Classic"
    (99, 107, "table-fans", "Table Fans"),
    (110, 123, "pedestal-fans", "Pedestal Fans"),
    (126, 138, "wall-fans", "Wall Fans"),
    (142, 155, "exhaust-fans", "Exhaust Fans"),
    (158, 161, "industrial-fans", "Industrial Fans"),
]
ORIENT_NON_PRODUCT = {47, 61, 72, 84, 95, 139, 156}

ACRONYMS = {"HS", "NS", "DX", "ES", "LX", "CX", "UL", "SS", "VC", "IOT", "BLDC", "XL", "LSH",
            "DSP", "DLX", "ZX", "ZXR", "ZXC", "DB", "DS", "DXZ", "WS", "LED", "R", "II", "EP",
            "V2", "AQI", "DX"}

ORIENT_NOISE = {
    "comparison", "contact us", "products", "home", "introduction", "next", "back",
    "w w w . o r i e n t e l e c t r i c . c o m", "a e r o s e r i e s",
}
FAMILY_OVERRIDES = {  # name (upper) prefix -> series label
    "EP TRENDY": "Trendy", "TRENDY": "Trendy", "QUICK AIR": "Quick Air", "SS 390": "SS 390",
    "ES 40": "ES 40", "V2 ULTRA": "V2 Ultra", "I COOL": "I Cool", "THRILL AIR": "Thrill Air",
    "VENTIL AIR": "Ventil Air", "TURBO FORCE": "Turbo Force", "SMART AIR": "Smart Air",
    "POWER FLOW": "Power Flow", "HILL AIR": "Hill Air", "AIR FLOW": "Air Flow",
    "HIGH SPEED": "High Speed Exhaust", "SPRING AIR": "Spring Air", "NEW BREEZE": "Breeze",
    "SUMMER BREEZE": "Summer", "SUMMER": "Summer", "NEW AIR": "New Air", "AIR CIRCULATOR": "Air Circulator",
    "HEAVY DUTY": "Heavy Duty Exhaust", "THUNDER PRO": "Thunder Pro", "THUNDERSTORM": "Thunderstorm",
    "THUNDER": "Thunder", "WINDSTORM": "Windstorm", "AERO": "Aero", "ECOTECH": "Ecotech",
    "AEON": "Aeon", "PROTON": "Proton", "FALCON": "Falcon", "HORNET": "Hornet", "APACHE": "Apache",
}


def slugify(s):
    s = s.lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def pretty(name):
    """Title-case a catalogue heading while preserving acronyms."""
    out = []
    for tok in re.split(r"(\s+)", name.strip()):
        if tok.strip() == "":
            out.append(" ")
            continue
        up = tok.upper().strip(".")
        if up in ACRONYMS or re.fullmatch(r"[A-Z]\d+|\d+[A-Z]*", tok):
            out.append(tok.upper())
        elif tok.upper() == "AERO" or "." in tok:
            out.append(tok.upper() if len(tok) <= 5 and "." in tok else tok.title())
        else:
            out.append(tok.capitalize())
    return re.sub(r"\s+", " ", "".join(out)).strip()


def family(name):
    u = name.upper()
    for key in sorted(FAMILY_OVERRIDES, key=len, reverse=True):
        if u.startswith(key):
            return FAMILY_OVERRIDES[key]
    tok = re.split(r"[\s\-]+", name.strip())[0]
    return pretty(tok)


def section_for(page_no, sections):
    for a, b, cat, sub in sections:
        if a <= page_no <= b:
            return cat, sub
    return None, None


# --- Image export --------------------------------------------------------------------
def export_image(doc, xref, smask, dest_path, max_side=1100):
    try:
        pix = pymupdf.Pixmap(doc, xref)
        if pix.colorspace is None or pix.colorspace.n != 3 or pix.alpha:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix) if pix.colorspace is not None else pix
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        if smask:
            m = pymupdf.Pixmap(doc, smask)
            mimg = Image.frombytes("L", (m.width, m.height), m.samples) if m.n == 1 else None
            if mimg is not None:
                if mimg.size != img.size:
                    mimg = mimg.resize(img.size)
                img = img.convert("RGBA")
                img.putalpha(mimg)
                bbox = mimg.point(lambda v: 255 if v > 10 else 0).getbbox()
                if bbox:
                    img = img.crop(bbox)
        img.thumbnail((max_side, max_side))
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        img.save(dest_path, "WEBP", quality=82, method=4)
        return img.size
    except Exception as exc:  # noqa: BLE001
        print("  image export failed", xref, exc, file=sys.stderr)
        return None


def page_images(page, min_dim=150):
    """Return list of dict(xref,smask,bbox,w,h,cutout) for meaningful images."""
    res = []
    seen = set()
    page_area = page.rect.width * page.rect.height
    for info in page.get_images(full=True):
        xref, smask, w, h = info[0], info[1], info[2], info[3]
        if xref in seen or w < min_dim or h < min_dim:
            continue
        seen.add(xref)
        try:
            bb = page.get_image_bbox(info)
        except Exception:  # noqa: BLE001
            continue
        if bb.is_empty or bb.is_infinite:
            continue
        area = bb.width * bb.height
        res.append({
            "xref": xref, "smask": smask, "bbox": bb, "w": w, "h": h,
            "cutout": bool(smask), "frac": area / page_area, "area": area,
        })
    return res


def pick_product_images(imgs):
    cut = [i for i in imgs if i["cutout"]]
    if not cut:  # fallback: opaque images that are not full-bleed lifestyle backdrops
        cut = [i for i in imgs if i["frac"] < 0.35]
    if not cut:
        return []
    cut.sort(key=lambda i: -i["area"])
    primary = cut[0]
    rest = sorted(cut[1:], key=lambda i: (round(i["bbox"].y0 / 40), i["bbox"].x0))
    return [primary] + rest


def lines_of(page):
    out = []
    d = page.get_text("dict")
    for b in d["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            txt = "".join(s["text"] for s in l["spans"]).strip()
            if txt:
                out.append((txt, pymupdf.Rect(l["bbox"]), max(s["size"] for s in l["spans"])))
    return out


def caption_for(img, lines, taken, banned):
    best, best_d = None, 90
    r = img["bbox"]
    for txt, bb, size in lines:
        words = txt.split()
        if not (1 <= len(words) <= 4) or re.search(r"\d", txt) or size > 14:
            continue
        if txt.lower() in ORIENT_NOISE or txt.upper() in banned or "warranty" in txt.lower():
            continue
        if not all(w[:1].isupper() for w in words if w[0].isalpha()):
            continue
        dx = max(r.x0 - bb.x1, bb.x0 - r.x1, 0)
        dy = max(r.y0 - bb.y1, bb.y0 - r.y1, 0)
        d = (dx * dx + dy * dy) ** 0.5
        if d < best_d and txt not in taken:
            best, best_d = txt, d
    if best:
        taken.add(best)
    return best


# --- Havells -------------------------------------------------------------------------
HAV_ROW = re.compile(
    r"(\d+(?:\.\d+)?)\s*mm\s+(\d+(?:\.\d+)?)\s*W\s+(\d+)\s*r/min\s+(\d+(?:\.\d+)?)\s*(m3/min|m3/h)"
)


def parse_havells(doc):
    products = []
    for pno in range(1, len(doc) + 1):
        if pno < 16 or pno > 176:
            continue
        page = doc[pno - 1]
        cat, sub = section_for(pno, HAVELLS_SECTIONS)
        spans = [(s["size"], s["text"].strip(), s["bbox"]) for b in page.get_text("dict")["blocks"]
                 if b["type"] == 0 for l in b["lines"] for s in l["spans"] if s["text"].strip()]
        titles = [s for s in spans if 22 <= s[0] <= 24.5 and len(s[1]) > 1]
        if not titles or not cat:
            continue
        title_sp = sorted(titles, key=lambda s: (s[2][1], s[2][0]))
        title = " ".join(s[1] for s in title_sp)
        ty = title_sp[0][2][1]
        tag_sp = [s for s in spans if 12.5 <= s[0] <= 22 and abs(s[2][1] - ty) < 60 and s[1] != "+"]
        tagline = " ".join(s[1] for s in sorted(tag_sp, key=lambda s: (round(s[2][1]), s[2][0])))
        tagline = re.sub(r"\s+", " ", tagline).strip() or None
        if tagline and tagline.lower() == "wider":
            tagline = None

        text = page.get_text()
        feats = []
        note = None
        for blk in page.get_text("blocks"):
            bt = blk[4]
            if "•" in bt:
                for part in bt.split("•")[1:]:
                    part = re.sub(r"\s+", " ", part).strip()
                    if "NOTE" in part:
                        part, _, n = part.partition("NOTE")
                        note = ("NOTE" + n).strip(" :")
                        part = part.strip()
                    if part:
                        feats.append(part)
        spec = {}
        rows = HAV_ROW.findall(re.sub(r"\s+", " ", text))
        if rows:
            spec = {
                "sweepMm": [float(r[0]) if "." in r[0] else int(r[0]) for r in rows],
                "powerW": [float(r[1]) if "." in r[1] else int(r[1]) for r in rows],
                "speedRpm": [int(r[2]) for r in rows],
                "airDelivery": [f"{r[3]} {r[4]}" for r in rows],
            }
        star = re.search(r"AIR\s*\n?\s*DELIVERY\s*\n(NA|\d(?:\.\d)?)\s*\n", text)
        if star:
            spec["starRating"] = star.group(1)
        if note:
            spec["note"] = note

        imgs = pick_product_images(page_images(page))
        lines = lines_of(page)
        taken = set()
        banned = {title.upper()}
        images = []
        for im in imgs:
            images.append({**im, "caption": caption_for(im, lines, taken, banned)})
        if not feats and not spec:  # section divider page, not a product
            continue
        products.append({
            "brand": "Havells", "name": pretty(title), "tagline": tagline,
            "category": cat, "subCategory": sub, "series": family(title),
            "features": feats, "specs": spec, "warranty": None,
            "pages": [pno], "doc": doc, "_images": images,
            "description": None, "descriptionSource": None,
        })
    return products


# --- Orient --------------------------------------------------------------------------
ORIENT_HDR = {"sweep", "(mm)", "power", "(w)", "air delivery", "(cmm)", "rpm", "led", "air", "delivery"}


def orient_title(page):
    spans = [(s["size"], s["text"].strip(), s["bbox"]) for b in page.get_text("dict")["blocks"]
             if b["type"] == 0 for l in b["lines"] for s in l["spans"] if s["text"].strip()]
    if not spans:
        return None, None, None
    mx = max(s[0] for s in spans)
    if mx < 30:
        return None, None, None
    ts = sorted([s for s in spans if abs(s[0] - mx) < 1], key=lambda s: (round(s[2][1] / 6), s[2][0]))
    title = re.sub(r"\s+", " ", " ".join(s[1] for s in ts))
    ty = ts[0][2][1]
    variant = None
    for s in spans:
        if 22 <= s[0] <= 25 and len(s[1]) <= 4 and s[1] != "O" and abs(s[2][1] - ty) < 25:
            variant = s[1]
    tag = [s for s in spans if 18 <= s[0] <= 21.5 and abs(s[2][1] - ty) < 70 and s[1] != "O"]
    tagline = " ".join(s[1] for s in sorted(tag, key=lambda s: (round(s[2][1] / 8), s[2][0])))
    tagline = re.sub(r"\s+", " ", tagline).strip() or None
    return title, variant, tagline


def orient_blocks(page):
    out = []
    for blk in page.get_text("blocks"):
        t = re.sub(r"\s+", " ", blk[4]).strip()
        if not t or t.lower() in ORIENT_NOISE:
            continue
        if re.search(r"\b(NEXT|BACK)\b.*o r i e n t|^Comparison Contact Us|^Home Introduction|S E R I E S", t):
            continue
        if re.fullmatch(r"(A E R O|S E R I E S|[A-Z] ){2,}.*", t) and " " in t and len(t) < 50 and t.replace(" ", "").isupper():
            continue
        out.append(t)
    return out


def orient_spec(page, text):
    lines = [l.strip() for l in text.splitlines()]
    try:
        i = next(k for k, l in enumerate(lines) if l.lower() == "sweep")
    except StopIteration:
        return {}
    nums, hdr = [], set()
    for l in lines[i:]:
        ll = l.lower()
        if ll in ORIENT_HDR:
            hdr.add(ll)
        elif re.fullmatch(r"\d+(?:\.\d+)?W?", l):
            nums.append(l)
        elif l == "":
            continue
        elif nums:
            break
    cols = ["sweepMm", "airDeliveryCmm", "rpm", "powerW"]
    if "led" in hdr:
        cols.append("ledW")
    if not nums or len(nums) % len(cols):
        return {"raw": nums} if nums else {}
    spec = defaultdict(list)
    for r in range(0, len(nums), len(cols)):
        for c, col in enumerate(cols):
            v = nums[r + c].rstrip("W")
            spec[col].append(float(v) if "." in v else int(v))
    return dict(spec)


def parse_orient(doc):
    products, prev = [], None
    for pno in range(29, 162):
        if pno in ORIENT_NON_PRODUCT:
            prev = None
            continue
        page = doc[pno - 1]
        cat, sub = section_for(pno, ORIENT_SECTIONS)
        if not cat:
            prev = None
            continue
        title, variant, tagline = orient_title(page)
        if not title:
            prev = None
            continue
        full = pretty(title) + (f" {variant}" if variant else "")
        text = page.get_text()
        blocks = orient_blocks(page)
        # warranty
        wm = re.search(r"(\d\+?\d?)\s*years?\s*warranty", text, re.I)
        warranty = f"{wm.group(1)} Years" if wm else None
        wnote = next((b for b in blocks if "warranty" in b.lower() and b.startswith("*")), None)

        imgs = pick_product_images(page_images(page))
        lines = lines_of(page)
        taken, images = set(), []
        for im in imgs:
            images.append({**im, "caption": caption_for(im, lines, taken, {title.upper()})})

        paragraph = None
        long_blocks = [b for b in blocks if len(b) >= 70 and "warranty" not in b.lower()[:12]
                       and not b.startswith("*")]
        if long_blocks:
            paragraph = max(long_blocks, key=len)
        feats = [b for b in blocks if (len(b.split()) >= 4 or "warranty" in b.lower()) and b != paragraph
                 and len(b) < 140 and not b.startswith("*") and re.search(r"[a-z]", b)
                 and not re.match(r"(Air Delivery|Sweep|Power)", b)]

        spec = orient_spec(page, text)

        same = (prev is not None and prev["name"] == full and prev["pages"][-1] == pno - 1)
        if same:
            p = prev
            p["pages"].append(pno)
            p["_images"].extend(images)
            if not p["warranty"]:
                p["warranty"] = warranty
            if wnote and not p.get("warrantyNote"):
                p["warrantyNote"] = wnote
            if not p["description"] and paragraph:
                p["description"], p["descriptionSource"] = paragraph, "catalogue"
            p["features"] = list(dict.fromkeys(p["features"] + feats))
            if spec and not p["specs"]:
                p["specs"] = spec
            if tagline and not p["tagline"]:
                p["tagline"] = tagline
            continue
        prev = {
            "brand": "Orient", "name": full, "tagline": tagline, "category": cat, "subCategory": sub,
            "series": family(title), "features": feats, "specs": spec, "warranty": warranty,
            "pages": [pno], "doc": doc, "_images": images,
            "description": paragraph, "descriptionSource": "catalogue" if paragraph else None,
        }
        if wnote:
            prev["warrantyNote"] = wnote
        products.append(prev)
    return products


# --- Post-processing -----------------------------------------------------------------
def finalise(products):
    # unique slugs
    used = Counter()
    keys = Counter((p["brand"], p["name"]) for p in products)
    keys_cat = Counter((p["brand"], p["name"], p["category"]) for p in products)
    for p in products:
        base = f'{p["brand"]} {p["name"]}'
        if keys_cat[(p["brand"], p["name"], p["category"])] > 1 and p.get("tagline"):
            base += f' {p["tagline"]}'
        elif keys[(p["brand"], p["name"])] > 1:
            base += " " + p["category"].replace("-fans", "")
        slug = slugify(base)
        used[slug] += 1
        if used[slug] > 1:
            slug += f"-p{p['pages'][0]}"
        p["slug"] = slug

    for p in products:
        if not p["description"] and p["features"]:
            # honest fallback: stitched from the catalogue's own feature bullets
            usable = [f for f in p["features"] if "warranty" not in f.lower()] or p["features"]
            p["description"] = ". ".join(f.rstrip(".") for f in usable[:3]) + "."
            p["descriptionSource"] = "features"
        imgs = []
        for n, im in enumerate(p.pop("_images")[:8]):
            rel = f'{p["brand"].lower()}/{p["slug"]}-{n + 1}.webp'
            size = export_image(p["doc"], im["xref"], im["smask"], os.path.join(IMG_DIR, rel))
            if size:
                imgs.append({"path": f"images/{rel}", "caption": im.get("caption"),
                             "width": size[0], "height": size[1]})
        p["images"] = imgs
        p["sourcePdf"] = HAVELLS_PDF if p["brand"] == "Havells" else ORIENT_PDF
        p["sourcePage"] = p["pages"][0]
        p["categoryName"] = CATEGORIES[p["category"]]
        p.pop("doc")
    return products


def report(products):
    L = []
    L.append("# Extraction report\n")
    L.append(f"**Total products:** {len(products)}\n")
    by = Counter(p["brand"] for p in products)
    L.append("## By brand\n" + "\n".join(f"- {k}: {v}" for k, v in by.items()) + "\n")
    L.append("## Brand > Category > Sub-category (product counts)\n")
    tree = defaultdict(Counter)
    for p in products:
        tree[(p["brand"], p["categoryName"])][p["subCategory"]] += 1
    for (b, c), subs in sorted(tree.items()):
        L.append(f"- **{b} / {c}** ({sum(subs.values())}): " + ", ".join(f"{s} {n}" for s, n in subs.items()))
    L.append("\n## Series (brand / category: series = count)\n")
    ser = defaultdict(Counter)
    for p in products:
        ser[(p["brand"], p["categoryName"])][p["series"]] += 1
    for (b, c), s in sorted(ser.items()):
        L.append(f"- **{b} / {c}**: " + ", ".join(f"{k} ({v})" for k, v in sorted(s.items())))
    L.append("\n## Data gaps\n")
    for brand in by:
        ps = [p for p in products if p["brand"] == brand]
        noimg = [p for p in ps if not p["images"]]
        nodesc = [p for p in ps if not p["description"]]
        featdesc = [p for p in ps if p["descriptionSource"] == "features"]
        nowar = [p for p in ps if not p["warranty"]]
        L.append(f"### {brand} ({len(ps)})")
        L.append(f"- Missing image: {len(noimg)}")
        L.append(f"- Missing description: {len(nodesc)}  |  description built from feature bullets: {len(featdesc)}")
        L.append(f"- Missing warranty: {len(nowar)}")
        for label, lst in (("no image", noimg), ("no description", nodesc), ("no warranty", nowar)):
            if lst and len(lst) <= 40:
                L.append(f"  - {label}: " + "; ".join(f'{p["name"]} (p{p["sourcePage"]})' for p in lst))
        L.append("")
    return "\n".join(L)


def main():
    hdoc = pymupdf.open(os.path.join(PDF_DIR, HAVELLS_PDF))
    odoc = pymupdf.open(os.path.join(PDF_DIR, ORIENT_PDF))
    print("Parsing Havells...")
    hp = parse_havells(hdoc)
    print("Parsing Orient...")
    op = parse_orient(odoc)
    products = finalise(hp + op)
    for p in products:
        p.pop("pages", None)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump({"categories": CATEGORIES, "products": products}, f, ensure_ascii=False, indent=2)
    rep = report(products)
    with open(OUT_REPORT, "w", encoding="utf-8") as f:
        f.write(rep)
    print(rep[:3000])


if __name__ == "__main__":
    main()
