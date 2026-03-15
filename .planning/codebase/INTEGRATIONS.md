# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**File Hosting Providers:**
- GitHub (github.com, raw.githubusercontent.com) - Host `.excalidraw` diagram files
  - No API client required; direct fetch via standard HTTP
  - Content-Security-Policy: `sandbox` directive prevents iframe execution
- GitLab (gitlab.com) - Host `.excalidraw` diagram files
  - No API client required; direct fetch via standard HTTP

**File Format:**
- `.excalidraw` JSON files - Downloaded via fetch() and parsed as JSON
  - Expected structure: `{ elements: [], appState: {}, files: null }`
  - No third-party validation or schema service

## Data Storage

**Databases:**
- None - Extension is stateless

**File Storage:**
- GitHub and GitLab only (external, read-only)
- No local persistence or caching

**Caching:**
- None - Each diagram fetch is fresh from remote source

## Authentication & Identity

**Auth Provider:**
- None - Public repositories only
- No authentication required for fetch operations
- Uses standard HTTP GET requests to public raw file URLs

## Monitoring & Observability

**Error Tracking:**
- None - No error tracking service integrated

**Logs:**
- Console logging only (accessible via Chrome DevTools)
- Error messages displayed in-browser via error overlay in `viewer.html`

## CI/CD & Deployment

**Hosting:**
- Chrome Web Store (distribution channel, not runtime dependency)

**CI Pipeline:**
- None configured

**Manual Deployment:**
- Extension loaded via `chrome://extensions` Developer Mode
- Unpacked extension directory: `dist/`

## Environment Configuration

**Required env vars:**
- None - Extension uses no environment variables

**Secrets location:**
- Not applicable - No API keys, tokens, or secrets required

## HTTP Requests

**Outbound:**
- `fetch(rawUrl)` in `viewer.js` line 17 - Fetches `.excalidraw` JSON from:
  - `https://raw.githubusercontent.com/{user}/{repo}/{path}/*.excalidraw`
  - `https://gitlab.com/{user}/{repo}/-/raw/{path}/*.excalidraw`
- Request headers: Standard browser defaults (no custom auth)
- CORS: Relies on public file endpoints (no CORS configuration required)

**Incoming:**
- None - Extension does not expose any HTTP endpoints

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## External Libraries (CDN/Remote)

- All dependencies bundled locally via npm + Webpack
- No remote CDN loading (except for Excalidraw assets, bundled in `dist/excalidraw-assets/`)
- Excalidraw library loaded from NPM registry during build, not at runtime

## Chrome Extension Permissions

**Permissions Requested:**
- `tabs` - Permission to update current tab URL (for navigation to viewer page)

**Host Permissions:**
- `https://github.com/*` - Content script matching on GitHub blob URLs
- `https://raw.githubusercontent.com/*` - Content script matching on GitHub raw URLs
- `https://gitlab.com/*` - Content script matching on GitLab blob/raw URLs

**Restrictions:**
- Content scripts only inject on pages matching `.excalidraw` file patterns
- No access to user data, cookies, or browsing history
- No background network requests (only fetch from viewer page context)

---

*Integration audit: 2026-03-15*
