# Expeek – Excalidraw Viewer Chrome Extension

Chrome extension that auto-renders `.excalidraw` files from GitHub and GitLab in a full-screen modal overlay.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Production build → dist/
npm run dev          # Development build with watch mode
npm run icons        # Regenerate PNG icons from icons/icon.svg (auto-runs in build)
```

Load the extension: Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → select `dist/`.

After every code change, run `npm run build` and click the refresh icon on the extension card in `chrome://extensions`.

## Architecture

Three-part architecture: content script → background worker → sandboxed viewer page.

```
content.js  (content script, isolated JS world)
  │  detects .excalidraw URL, normalizes to raw URL
  └─► chrome.runtime.sendMessage({ type: "open", rawUrl })
         │
background.js  (service worker)
  │  receives message, navigates tab to viewer page
  └─► chrome.tabs.update → viewer.html?rawUrl=<encoded>
         │
viewer.html + viewer.js  (sandboxed extension page)
       fetches raw JSON, renders React + Excalidraw
```

**Key files:**

| File | Role |
|------|------|
| `content.js` | URL detection + raw URL normalization, sends message to background |
| `background.js` | Service worker — receives message, navigates tab to viewer |
| `viewer.js` | React + Excalidraw component — fetches file, renders diagram |
| `viewer.html` | Sandboxed extension page hosting viewer.js |
| `manifest.json` | MV3 config — host permissions, content script URL matches |
| `webpack.config.js` | Bundles three entry points → `dist/` |

## URL Patterns Supported

| Host | URL form | Notes |
|------|----------|-------|
| GitHub blob | `github.com/{u}/{r}/blob/{branch}/…/*.excalidraw` | Converted to raw URL before fetch |
| GitHub raw | `raw.githubusercontent.com/…/*.excalidraw` | Fetched directly |
| GitLab blob | `gitlab.com/{u}/{r}/-/blob/{branch}/…/*.excalidraw` | `/blob/` → `/raw/` |
| GitLab raw | `gitlab.com/{u}/{r}/-/raw/…/*.excalidraw` | Fetched directly |

## Gotchas

**Viewer runs in a sandboxed extension page, not inline**
`raw.githubusercontent.com` CSP would block inline rendering. Instead, `background.js` navigates the tab to `viewer.html` (a sandboxed extension page declared under `sandbox.pages` in `manifest.json`). The viewer runs in an isolated context with its own CSP, not subject to the host page's restrictions. Content scripts (`content.js`) also run in an isolated JS world unaffected by page CSP.

**CSS injection — must use `<style>` not `<link>`**
GitHub and GitLab have strict `style-src` CSP that blocks `chrome-extension://` URLs. Styles are injected as inline `<style>` tags in `content.js`. Use `!important` on overlay styles to prevent the host page from overriding positioning/z-index.

**GitHub SPA navigation**
GitHub uses Turbo for client-side navigation. The content script only runs on full page loads. If a user clicks to a `.excalidraw` file from within GitHub (no hard reload), the extension won't trigger. Direct URL access (new tab, address bar, refresh) always works.

**Bundle size**
Webpack emits a size warning for `viewer.js` (~2.4 MiB) because `@excalidraw/excalidraw` is large. This is expected — the bundle only loads when viewing `.excalidraw` URLs so it doesn't affect normal browsing performance.

**Legacy `content/` directory**
A `content/content.js` file (231 lines) exists from an older inline-rendering approach. It is NOT used — the active entry point is `content.js` at the repo root. Ignore or delete `content/` to avoid confusion.

**`unsafe-eval` in Chrome MV3**
Chrome MV3 blocks `unsafe-eval` in extension pages, but `viewer.html` is declared under `sandbox.pages` in `manifest.json`, which uses a separate CSP that can permit it. Content scripts (`content.js`) are also not subject to the extension CSP. Do not add `unsafe-eval` to `content_security_policy.extension_pages` — it causes "Failed to load extension".
