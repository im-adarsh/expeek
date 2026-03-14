# Expeek – Excalidraw Viewer Chrome Extension

Chrome extension that auto-renders `.excalidraw` files from GitHub and GitLab in a full-screen modal overlay.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Production build → dist/
npm run dev          # Development build with watch mode
```

Load the extension: Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → select `dist/`.

After every code change, run `npm run build` and click the refresh icon on the extension card in `chrome://extensions`.

## Architecture

```
content.js   →  injected into GitHub/GitLab pages
                detects .excalidraw URL, fetches raw JSON, creates modal
                        │
                        │ postMessage({ type: "expeek:load", data })
                        ▼
viewer.html / viewer.js  →  iframe loaded from chrome-extension://
                             React + @excalidraw/excalidraw renders diagram
```

**Key files:**

| File | Role |
|------|------|
| `content.js` | URL detection, raw fetch, modal DOM, postMessage handshake |
| `viewer.js` | React component — receives data, renders `<Excalidraw>` |
| `viewer.html` | Iframe shell (`<div id="root">`) |
| `manifest.json` | MV3 config — host permissions, content script matches, web-accessible resources |
| `webpack.config.js` | Bundles `content.js` + `viewer.js` → `dist/`, copies static files |

## URL Patterns Supported

| Host | URL form | Notes |
|------|----------|-------|
| GitHub blob | `github.com/{u}/{r}/blob/{branch}/…/*.excalidraw` | Converted to raw URL before fetch |
| GitHub raw | `raw.githubusercontent.com/…/*.excalidraw` | Fetched directly |
| GitLab blob | `gitlab.com/{u}/{r}/-/blob/{branch}/…/*.excalidraw` | `/blob/` → `/raw/` |
| GitLab raw | `gitlab.com/{u}/{r}/-/raw/…/*.excalidraw` | Fetched directly |

## Gotchas

**CSS injection — must use `<style>` not `<link>`**
GitHub and GitLab have strict `style-src` CSP that blocks `chrome-extension://` URLs. Styles are injected as inline `<style>` tags in `content.js`, not as a `<link>` to `style.css`. The `style.css` file is only kept for reference and copied to `dist/` but not used at runtime.

**GitHub SPA navigation**
GitHub uses Turbo for client-side navigation. The content script only runs on full page loads. If a user clicks to a `.excalidraw` file from within GitHub (no hard reload), the extension won't trigger. Direct URL access (new tab, address bar, refresh) always works.

**postMessage handshake**
The content script sets up its `message` listener *before* the iframe loads. The iframe (viewer.js) fires `window.parent.postMessage("expeek:ready", "*")` in `useEffect` after React mounts. The content script then sends the file data. Do not reorder this sequence.

**Bundle size warning**
Webpack emits a size warning for `viewer.js` (~2.4 MiB) because `@excalidraw/excalidraw` is large. This is expected and fine for a Chrome extension — ignore it.

**web_accessible_resources**
`viewer.html` and `viewer.js` must be listed in `web_accessible_resources` in `manifest.json` so the content script can reference them via `chrome.runtime.getURL(...)` and load them in an iframe.
