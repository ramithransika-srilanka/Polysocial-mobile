#!/usr/bin/env python3
"""
One-time de-bundler for the Figma "bundled page" export.

The exported index.html inlines every asset as base64 inside
<script type="__bundler/manifest"> and stores the real page HTML inside
<script type="__bundler/template">. A runtime script rehydrates the page by
turning each UUID reference into a blob: URL.

This script reverses that: it extracts every asset to a real file under
src-assets/ and writes the real page HTML to build/page.raw.html with every
UUID / ext-resource reference rewritten to point at those files. The result is
a conventional, file-based static site that no longer needs the base64
unpacker.

Run once:  python3 scripts/extract_bundle.py <bundle.html>
"""
import re, json, base64, zlib, gzip, struct, sys, os, hashlib

BUNDLE = sys.argv[1] if len(sys.argv) > 1 else "index.html"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src-assets")
BUILD = os.path.join(ROOT, "build")

UUID = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

# Hero frame order recovered earlier (uuid -> frame number 1..8).
HERO = {
    "88b8e312-f63d-40c7-828f-a2f0ce03bb5a": 1, "e55f629a-3e7e-428f-8e60-36bd2f6d3e26": 2,
    "2960d976-ad34-4896-87c4-d6a3e7d9e35b": 3, "1c3f14d2-ce56-416e-83bc-74f93f657ea5": 4,
    "f23b4b68-f926-4c55-b798-1c6af6a30462": 5, "fd8d21eb-7978-429b-8d77-2b232c8ca946": 6,
    "466696cf-0411-436a-b84c-ae2bed4fdc97": 7, "fad500ab-936b-4070-90ec-fe678d87a132": 8,
}

EXT_KIND = {  # mime -> (subdir, extension)
    "image/png": ("img", "png"), "image/jpeg": ("img", "jpg"), "image/gif": ("img", "gif"),
    "image/svg+xml": ("svg", "svg"), "image/webp": ("img", "webp"),
    "video/mp4": ("video", "mp4"), "video/webm": ("video", "webm"),
    "font/woff2": ("font", "woff2"), "font/woff": ("font", "woff"),
    "application/javascript": ("js", "js"), "text/javascript": ("js", "js"),
}


def read_script(doc, kind):
    o = '<script type="__bundler/%s">' % kind
    i = doc.index(o) + len(o)
    j = doc.index("</script>", i)
    return doc[i:j].strip()


def decode(entry):
    b = base64.b64decode(entry["data"])
    if entry.get("compressed"):
        for fn in (zlib.decompress, lambda x: zlib.decompress(x, -15), gzip.decompress):
            try:
                return fn(b)
            except Exception:
                pass
    return b


def png_dims(b):
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", b[16:24])
    return (None, None)


def main():
    doc = open(os.path.join(ROOT, BUNDLE), encoding="utf-8").read()
    manifest = json.loads(read_script(doc, "manifest"))
    template = json.loads(read_script(doc, "template"))
    ext_resources = json.loads(read_script(doc, "ext_resources"))

    # Recover the ext-resource path map (id -> "assets/foo.jpg") from the
    # design-context file's <meta ext-resource-dependency> tags.
    dc_path = os.path.join(ROOT, "design-context.html")
    id_to_path = {}
    if os.path.exists(dc_path):
        dc = open(dc_path, encoding="utf-8").read()
        for m in re.finditer(
            r'<meta name="ext-resource-dependency" content="([^"]+)" data-resource-id="([^"]+)"',
            dc,
        ):
            id_to_path[m.group(2)] = m.group(1)
    # uuid -> ext path (only for the image ext-resources; skip external JS CDNs)
    uuid_to_extpath = {}
    for r in ext_resources:
        p = id_to_path.get(r["id"])
        if p and not r["id"].startswith("http"):
            uuid_to_extpath[r["uuid"]] = p

    for sub in ("img", "video", "font", "js", "svg", "raw"):
        os.makedirs(os.path.join(SRC, sub), exist_ok=True)
    os.makedirs(BUILD, exist_ok=True)

    uuid_to_relpath = {}
    catalog = []
    misc = 0
    for uuid, entry in manifest.items():
        data = decode(entry)
        mime = entry["mime"]
        sub, ext = EXT_KIND.get(mime, ("raw", "bin"))
        # Meaningful names where we can.
        if uuid in HERO:
            name = "hero-%d" % HERO[uuid]
        elif uuid in uuid_to_extpath:
            name = os.path.splitext(os.path.basename(uuid_to_extpath[uuid]))[0]
        else:
            name = uuid[:8]
        rel = "src-assets/%s/%s.%s" % (sub, name, ext)
        with open(os.path.join(ROOT, rel), "wb") as f:
            f.write(data)
        uuid_to_relpath[uuid] = rel
        w, h = png_dims(data)
        catalog.append({"uuid": uuid, "path": rel, "mime": mime,
                        "bytes": len(data), "w": w, "h": h})

    # --- Rewrite the template so references point at the extracted files. ---
    page = template

    # 1) src="uuid" and url("uuid") / url(uuid) -> real relative paths
    def sub_uuid(m):
        u = m.group("u")
        return m.group(0).replace(u, uuid_to_relpath.get(u, u))

    page = re.sub(r'src="(?P<u>%s)"' % UUID, sub_uuid, page)
    page = re.sub(r'url\((["\']?)(?P<u>%s)\1\)' % UUID,
                  lambda m: "url(%s%s%s)" % (m.group(1), uuid_to_relpath.get(m.group("u"), m.group("u")), m.group(1)),
                  page)

    # 2) ext-resource "assets/foo.jpg" paths -> extracted files
    path_to_rel = {}
    for uuid, extpath in uuid_to_extpath.items():
        path_to_rel[extpath] = uuid_to_relpath[uuid]
    for extpath, rel in path_to_rel.items():
        page = page.replace(extpath, rel)

    # Sanity: no bare UUID references should remain in element attributes.
    leftover = re.findall(r'(?:src|href)="(%s)"' % UUID, page)
    with open(os.path.join(BUILD, "page.raw.html"), "w", encoding="utf-8") as f:
        f.write(page)
    with open(os.path.join(BUILD, "asset-catalog.json"), "w") as f:
        json.dump({"assets": catalog, "uuid_to_path": uuid_to_relpath,
                   "ext_paths": path_to_rel}, f, indent=2)

    print("Extracted %d assets to src-assets/" % len(catalog))
    print("Wrote build/page.raw.html (%d bytes)" % len(page))
    print("Leftover UUID src/href refs:", len(leftover), leftover[:5])
    # summary by kind
    from collections import defaultdict
    agg = defaultdict(lambda: [0, 0])
    for a in catalog:
        agg[a["mime"]][0] += 1
        agg[a["mime"]][1] += a["bytes"]
    for mime, (c, s) in sorted(agg.items(), key=lambda x: -x[1][1]):
        print("  %-24s %2d  %8.1f KB" % (mime, c, s / 1024))


if __name__ == "__main__":
    main()
