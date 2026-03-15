# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Chrome Extension with Sandboxed Viewer

The extension uses a **three-part architecture** where a lightweight content script detects `.excalidraw` files on GitHub/GitLab, signals a background service worker, which navigates to a sandboxed viewer page. The viewer runs React + Excalidraw in an isolated execution context to bypass host page CSP restrictions.

**Key Characteristics:**
- Minimal content script (URL detection only)
- Message-passing between content script and background worker
- Sandboxed viewer page for React + Excalidraw rendering
- No iframes — inline DOM rendering avoids CSP sandbox propagation
- Inline CSS injection to avoid `chrome-extension://` CSP blocks

## Layers

**Detection Layer:**
- Purpose: Identify `.excalidraw` file URLs on GitHub/GitLab
- Location: `content.js`
- Contains: URL pattern matching (GitHub blob/raw, GitLab blob/raw)
- Depends on: Chrome runtime messaging API
- Used by: Chrome extension content script injection mechanism

**Message Relay Layer:**
- Purpose: Bridge content script and background worker with secure message passing
- Location: `background.js`
- Contains: Message listener that converts raw file URL to viewer page URL
- Depends on: Chrome runtime onMessage API, tabs API
- Used by: Content script (sender), viewer page (receiver)

**Viewer Layer:**
- Purpose: Fetch, parse, and render `.excalidraw` JSON files with interactive UI
- Location: `viewer.html`, `viewer.js`
- Contains: React component with Excalidraw integration, loading/error states
- Depends on: React 18, Excalidraw 0.17, Excalidraw CDN assets
- Used by: Browser tab navigation (triggered by background worker)

**Build & Bundle Layer:**
- Purpose: Compile JSX/ES6 to Chrome-compatible JavaScript, copy static assets
- Location: `webpack.config.js`, `package.json`
- Contains: Three entry points (content, background, viewer), Babel transpilation
- Depends on: Webpack, Babel, copy-webpack-plugin
- Used by: CI/CD pipeline (build scripts)

## Data Flow

**File View Request:**

1. User navigates to `.excalidraw` file on GitHub/GitLab
2. Content script (`content.js`) executes in page's isolated JS world
3. `getRawUrl()` normalizes the URL (github.com blob → raw.githubusercontent.com, gitlab.com blob → raw path)
4. `chrome.runtime.sendMessage()` sends `{ type: "open", rawUrl }` to background worker
5. Background worker (`background.js`) receives message, constructs viewer page URL with raw URL as query param
6. `chrome.tabs.update()` navigates current tab to `viewer.html?rawUrl=<encoded-url>`
7. Viewer page loads (`viewer.html`), runs `viewer.js`
8. React component extracts `rawUrl` from search params
9. `fetch(rawUrl)` retrieves raw JSON from GitHub/GitLab
10. JSON is parsed and passed to Excalidraw as `initialData`
11. Excalidraw renders interactive diagram in view-only mode

**State Management:**
- URL state: Passed via query parameter (`?rawUrl=...`) — survives page reload
- UI state: React local state (loading, data, error)
- No persistent storage: Each file view is isolated, no cache between sessions

## Key Abstractions

**URL Normalization:**
- Purpose: Convert various GitHub/GitLab URL formats to raw file URLs
- Implementation: `getRawUrl()` function in `content.js`
- Patterns:
  - GitHub blob: `github.com/{user}/{repo}/blob/{branch}/{path}` → `raw.githubusercontent.com/{user}/{repo}/{branch}/{path}`
  - GitLab blob: `gitlab.com/{user}/{repo}/-/blob/{branch}/{path}` → `gitlab.com/{user}/{repo}/-/raw/{branch}/{path}`

**Viewer Component:**
- Purpose: Encapsulate React + Excalidraw lifecycle
- Location: `viewer.js` (App function)
- Pattern: Functional component with useEffect for data fetching
- Lifecycle: Extract URL → Fetch JSON → Fade loading spinner → Render Excalidraw

**Error Boundary:**
- Purpose: Graceful degradation on fetch/parse failures
- Implementation: try/catch in fetch chain, `showError()` displays error UI
- Files: `viewer.js` (catch handler), `viewer.html` (error div)

## Entry Points

**Content Script:**
- Location: `content.js`
- Triggers: Page load matching manifest patterns (`*.excalidraw` on github.com, raw.githubusercontent.com, gitlab.com)
- Responsibilities: Detect file URL, normalize to raw form, send message to background worker

**Background Service Worker:**
- Location: `background.js`
- Triggers: `chrome.runtime.onMessage` listener (receives "open" message type)
- Responsibilities: Build viewer page URL, navigate tab to sandboxed page

**Viewer Page:**
- Location: `viewer.html` + `viewer.js`
- Triggers: Tab navigation to `viewer.html?rawUrl=...`
- Responsibilities: Render loading UI, fetch file, parse JSON, render Excalidraw

## Error Handling

**Strategy:** Fail gracefully with user-visible error messages

**Patterns:**
- HTTP errors: Caught in fetch promise chain, displayed via `showError()`
- JSON parse errors: Caught, logged to console, error UI shown
- Missing URL: `showError("No file URL provided.")`
- Excalidraw library load failures: Logged, viewer shows error state
- Network timeouts: Caught by fetch rejection, error message includes status/statusText

**Error Recovery:**
- User can click "Go back" button in error state to return to previous page
- No auto-retry — single fetch attempt per view

## Cross-Cutting Concerns

**Logging:**
- Development: Console.log statements in viewer.js for debugging (loading, render states)
- Content script: No logging (minimal surface)
- No production telemetry

**Validation:**
- URL validation: Regex patterns in `getRawUrl()` — 4 domain/path patterns supported
- File validation: JSON structure check in viewer (expects `elements`, `appState`, `files` fields from Excalidraw schema)
- HTTP validation: Status check (`!res.ok` throws error)

**Authentication:**
- None required — all URLs are public (GitHub raw files, GitLab raw API)
- Same-origin credentials not used (`credentials: 'same-origin'` in fetch but files are cross-origin)

**Security Boundaries:**
- Content scripts run in isolated JS world (not subject to page CSP)
- Viewer page runs in sandbox context (defined in manifest — limits iframe/eval capabilities)
- No `unsafe-eval` used — React + Excalidraw ship as bundled, pre-evaluated code
- Inline CSS in HTML (no external stylesheet CSP violations)
- Query parameter is URL-encoded to prevent injection

---

*Architecture analysis: 2026-03-15*
