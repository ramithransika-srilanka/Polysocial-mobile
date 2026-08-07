# Polysocial Mobile

Landing page for **Polysocial Mobile**, exported from Figma.

## Contents

| File | Description |
| --- | --- |
| `index.html` | The published website — a self-contained page with all images and fonts embedded. No build step or external assets required; open it directly in a browser. |
| `design-context.html` | The Figma design context (design tokens, color/typography variables, and component structure) used to produce the page. |

## Viewing locally

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

JavaScript must be enabled — the page unpacks its embedded assets at load time.

## Publishing with GitHub Pages

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Choose the branch and the `/ (root)` folder, then **Save**.

The included `.nojekyll` file ensures GitHub Pages serves the files as-is.
