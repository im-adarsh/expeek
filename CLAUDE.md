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

Everything lives in a single content script — no iframe, no background worker needed.

```
content.js  (content script, isolated JS world)
  │
  ├── detects .excalidraw URL
  ├── fetches raw JSON via fetch()
  └── renders React + Excalidraw directly into the page DOM
      (modal overlay div appended to document.body)
```

**Key files:**

| File | Role |
|------|------|
| `content.js` | Everything: URL detection, fetch, React + Excalidraw modal |
| `manifest.json` | MV3 config — host permissions, content script URL matches |
| `webpack.config.js` | Bundles `content.js` → `dist/content.js` |

## URL Patterns Supported

| Host | URL form | Notes |
|------|----------|-------|
| GitHub blob | `github.com/{u}/{r}/blob/{branch}/…/*.excalidraw` | Converted to raw URL before fetch |
| GitHub raw | `raw.githubusercontent.com/…/*.excalidraw` | Fetched directly |
| GitLab blob | `gitlab.com/{u}/{r}/-/blob/{branch}/…/*.excalidraw` | `/blob/` → `/raw/` |
| GitLab raw | `gitlab.com/{u}/{r}/-/raw/…/*.excalidraw` | Fetched directly |

## Gotchas

**No iframe — content script renders inline**
`raw.githubusercontent.com` is served with `Content-Security-Policy: sandbox` which propagates to ALL child iframes, blocking script execution. The fix is to skip iframes entirely: React + Excalidraw are bundled directly into `content.js` and rendered into a div appended to `document.body`. Content scripts run in an isolated JS world that is not subject to the page's CSP — eval and dynamic code execution work fine.

**CSS injection — must use `<style>` not `<link>`**
GitHub and GitLab have strict `style-src` CSP that blocks `chrome-extension://` URLs. Styles are injected as inline `<style>` tags in `content.js`. Use `!important` on overlay styles to prevent the host page from overriding positioning/z-index.

**GitHub SPA navigation**
GitHub uses Turbo for client-side navigation. The content script only runs on full page loads. If a user clicks to a `.excalidraw` file from within GitHub (no hard reload), the extension won't trigger. Direct URL access (new tab, address bar, refresh) always works.

**Bundle size**
Webpack emits a size warning for `content.js` (~2.4 MiB) because `@excalidraw/excalidraw` is large. This is expected — the content script only loads on `.excalidraw` URLs so it doesn't affect normal browsing performance.

**`unsafe-eval` in Chrome MV3**
Chrome MV3 hard-blocks `unsafe-eval` in `content_security_policy.extension_pages`. Adding it causes "Failed to load extension". The inline content-script approach sidesteps this entirely since content scripts are not extension pages and are not subject to the extension CSP.
