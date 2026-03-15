# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Stale Content Directory:**
- Issue: `/Users/adarshkumar/Workspace/go/expeek/content/` directory exists with outdated implementation (`content/content.js`) that uses CDN-loaded Excalidraw libraries and an overlay approach. This differs fundamentally from the current architecture which uses bundled React + Excalidraw in a sandbox page.
- Files: `content/content.js` (231 lines of legacy code)
- Impact: Confusion during development, potential merge conflicts, doubled maintenance surface. New developers may incorrectly reference or extend the old implementation.
- Fix approach: Remove the `content/` directory entirely. The active implementation is `content.js` (36 lines) at root, bundled via webpack. The legacy overlay approach (`content/content.js`) is superseded by the sandbox viewer approach.

**Excessive Console Logging in Production:**
- Issue: The legacy `content/content.js` contains 23 console.log/error calls left in code. These will appear in user's browser console on every file load.
- Files: `content/content.js` (lines throughout)
- Impact: User-facing console noise, potential privacy concern (logs reveal URLs/state), no corresponding logging level control for production vs development.
- Fix approach: Either remove entirely or wrap with environment-based log level check. Current active code uses minimal logging.

**Missing Error Recovery Mechanism:**
- Issue: In `viewer.js`, if the fetch fails, the error is displayed (line 29: `showError()`), but there's no retry mechanism or user-facing retry button. User must manually go back and try again.
- Files: `viewer.js` (lines 17-30)
- Impact: Poor user experience on transient network issues (timeouts, temporary 403 from GitHub API rate limits).
- Fix approach: Add a "Retry" button in the error state that reloads the file without requiring manual navigation.

## Known Bugs

**Potential XSS via Document Title:**
- Symptoms: If a malicious .excalidraw filename is crafted with JavaScript/HTML, `document.title = decodeURIComponent(rawUrl).split("/").pop()` (line 15 of `viewer.js`) could execute if the title setter doesn't properly escape.
- Files: `viewer.js` (line 15)
- Trigger: Navigate to URL like `raw.githubusercontent.com/user/repo/<img%20src=x%20onerror=alert(1)>.excalidraw`
- Workaround: None currently. The browser's `document.title` property is text-only so this is actually safe, but the pattern is fragile.
- Note: Not a real vulnerability since `document.title` doesn't execute scripts, but the code pattern suggests misunderstanding of XSS vectors.

**Missing URL Validation in Viewer:**
- Symptoms: `viewer.js` (line 9) accepts any `rawUrl` from URLSearchParams without validating it points to a legitimate GitHub/GitLab raw file URL.
- Files: `viewer.js` (lines 9, 17)
- Trigger: Manually craft a viewer.html URL with arbitrary `rawUrl` parameter pointing to any HTTP endpoint
- Workaround: None
- Impact: Extension could be tricked into fetching from unintended domains (though limited by CORS and CSP in practice).

## Security Considerations

**CORS Dependency Without Fallback:**
- Risk: The extension relies on `fetch(rawUrl)` working via CORS. If GitHub/GitLab ever restrict cross-origin JSON fetches from extensions, the extension breaks silently.
- Files: `viewer.js` (line 17)
- Current mitigation: GitHub's raw content is CORS-enabled. No issues currently.
- Recommendations:
  1. Add explicit CORS error handling in the `.catch()` block to distinguish CORS failures from other errors.
  2. Consider using `chrome.runtime.sendMessage()` to fetch via background service worker (if CORS becomes restrictive), as service workers may have different CORS rules.

**Overly Broad Host Permissions:**
- Risk: `manifest.json` requests `https://github.com/*` and `https://gitlab.com/*` — not scoped to specific paths or just raw content URLs.
- Files: `manifest.json` (lines 13-17)
- Current mitigation: The content script only runs on `.excalidraw` file URLs (manifest line 24-26), and the background worker only opens the viewer (doesn't access user data).
- Recommendations: These permissions are appropriate for the use case (need to detect links on any GitHub/GitLab page), but document this in comments.

**Sandboxed Viewer Isolation:**
- Risk: `viewer.html` runs in a sandbox (manifest line 32-34), which is good. However, if Excalidraw library ever has a vulnerability, the sandbox can still be escaped.
- Files: `manifest.json`, `viewer.html`
- Current mitigation: Sandbox prevents access to `chrome.*` APIs and DOM APIs of the main page.
- Recommendations: Keep `@excalidraw/excalidraw` updated regularly. Set up automated dependency scanning (e.g., GitHub Dependabot).

## Performance Bottlenecks

**Large Bundle Size — Excalidraw Bundled:**
- Problem: `dist/viewer.js` is 2.4 MiB. This is acknowledged in CLAUDE.md as expected behavior, but it's still a concern.
- Files: `dist/viewer.js` (2.4M)
- Cause: `@excalidraw/excalidraw` library is large (~2.2 MiB minified). Webpack bundles the entire library into the content script bundle.
- Improvement path:
  1. **Lazy load the viewer.js:** Currently `viewer.html` loads `viewer.js` synchronously (line 167). Consider loading after the DOM settles.
  2. **Code split or lazy bundle:** Split the bundle so the heavy Excalidraw code only loads when viewing a diagram (already done — the bundle only loads on .excalidraw URLs, but the monolithic bundle should be split further if feasible).
  3. **Measure impact:** On slow networks, the 2.4 MiB download could cause noticeable lag before the diagram renders. Monitor real-world performance metrics if this extension reaches users.

**Synchronous Asset Path Setup:**
- Problem: `viewer.html` line 166 sets `window.EXCALIDRAW_ASSET_PATH` synchronously before loading `viewer.js`. If this timing is wrong, Excalidraw may not find its asset files (fonts, icons).
- Files: `viewer.html` (lines 166-167)
- Cause: Webpack copies Excalidraw assets to `dist/excalidraw-assets/` (webpack.config.js line 44-46). The URL must be correct before Excalidraw initializes.
- Improvement path: Add error handling in `viewer.js` to detect missing assets and provide a clear error message instead of silent failures.

## Fragile Areas

**URL Detection Regex Patterns:**
- Files: `content.js` (lines 8-30)
- Why fragile: The regex patterns assume fixed URL structures. Any change to GitHub/GitLab URL patterns breaks detection.
  - GitHub blob: `github.com/{u}/{r}/blob/{branch}/…`
  - GitLab blob: `gitlab.com/{u}/{r}/-/blob/{branch}/…`
- Safe modification: Use URL parsing (`URL` API) instead of regex. Example:
  ```javascript
  const url = new URL(href);
  if (url.host === 'github.com' && url.pathname.includes('/blob/')) { ... }
  ```
  This is less error-prone than regex fragmentation.
- Test coverage: No unit tests for URL detection patterns. If regex fails, it fails in production only.

**Raw URL Conversion Logic:**
- Files: `content.js` (lines 6-31)
- Why fragile: The `getRawUrl()` function has separate regex for each platform. If a user accesses a .excalidraw file on a GitHub/GitLab mirror or custom instance, the extension silently does nothing.
- Safe modification: Parametrize the host detection to support custom instances (e.g., GitHub Enterprise on `github.company.com`).
- Test coverage: No automated tests for the conversion logic.

**Error Display Without Context:**
- Files: `viewer.js` (lines 53-57)
- Why fragile: The `showError()` function directly sets `textContent` on the error message div, but doesn't handle cases where the DOM elements don't exist or have been removed.
- Safe modification: Add a check that the elements exist before modifying them. Use try-catch around DOM operations.

**Manifest Content Script Matching:**
- Files: `manifest.json` (lines 23-27)
- Why fragile: The matches pattern `"https://*/…/*.excalidraw"` is exact. If GitHub/GitLab serve .excalidraw files with query parameters or fragments, the content script won't run.
  - Example: `github.com/user/repo/blob/main/file.excalidraw?token=xyz` won't match because the pattern doesn't account for query strings.
- Safe modification: Update pattern to `"https://github.com/*/*.excalidraw*"` to allow trailing query parameters/fragments.
- Impact: If a file is shared via link with parameters, extension breaks.

## Scaling Limits

**Single-File Extension:**
- Capacity: The extension is a single-instance tool — one viewer per tab. No scaling issues per se, but if the codebase grows (e.g., annotations, collaboration), the monolithic approach becomes a limit.
- Limit: If future versions need persistent state (user preferences, recent files), the service worker can be used, but currently there's no storage.
- Scaling path: If persistence is added, use `chrome.storage.local` for user preferences, keeping state size <1MB per Chrome's limits.

## Dependencies at Risk

**@excalidraw/excalidraw^0.17.0:**
- Risk: Major version lock (`^0.17.0`) means the extension can receive 0.17.x to 0.99.y versions without explicit update. Breaking changes in minor versions are possible (has happened before in Excalidraw).
- Impact: Auto-updated via npm, could silently break rendering if Excalidraw's API changes.
- Migration plan:
  1. Lock to exact version: `"@excalidraw/excalidraw": "0.17.0"` to avoid surprise breaks.
  2. Test major version upgrades in a staging phase before publishing.
  3. Monitor Excalidraw release notes for breaking changes.

**React^18.2.0:**
- Risk: Major version constraints. React 19+ could introduce breaking changes (unlikely given React's backwards compatibility, but possible).
- Impact: Low likelihood but would require refactoring if major version breaks JSX or hooks.
- Migration plan: Same as Excalidraw — lock versions and test upgrades explicitly.

**Webpack^5.89.0:**
- Risk: Webpack 5 is stable, but future major versions could have breaking changes in config format or plugin APIs.
- Impact: Medium — webpack config changes could break the build process. No runtime impact.
- Mitigation: Lock webpack version and validate the build after any dependency update.

**Sharp^0.34.5 (Icon Generation):**
- Risk: Only used during build (dev dependency), so less critical. However, if `scripts/generate-icons.js` breaks, `npm run build` fails.
- Impact: Blocks builds if Sharp breaks. Low priority since alternatives exist.
- Migration plan: Have a pre-generated icon set as fallback, or document manual icon generation.

## Test Coverage Gaps

**No Automated Tests:**
- What's not tested:
  1. URL detection logic (does GitHub blob → raw conversion work for all URL patterns?)
  2. Error handling (does the extension gracefully handle 404, 403, timeout errors?)
  3. Excalidraw JSON parsing (does the extension reject invalid .excalidraw files?)
  4. Platform-specific behavior (does it work on both GitHub and GitLab?)
- Files: `content.js`, `viewer.js`, `background.js` — no `.test.js` or `.spec.js` files exist
- Risk: Regressions go undetected. If a future change breaks URL detection, it fails in production only. If Excalidraw JSON structure changes, the extension silently breaks.
- Priority: High — automated tests for core URL detection and error paths would prevent production issues.

**Manual Testing Load:**
- What's missing: No test Excalidraw files committed to the repo beyond `example/sample.excalidraw`.
- Impact: Developers must manually create test cases or use their own files. Reduces test coverage consistency.
- Recommendation: Add a small set of test .excalidraw files in the repo covering:
  1. Minimal valid file (empty diagram)
  2. File with complex elements (text, images, etc.)
  3. File with custom appState settings
  4. Malformed JSON (to test error handling)

## Missing Critical Features

**No Offline Support:**
- Problem: The extension requires a network fetch to GitHub/GitLab every time. If offline, it fails silently.
- Blocks: Users cannot view cached .excalidraw files when offline.
- Mitigation: This is acceptable for the current scope (it's a viewer, not an editor), but document this limitation.

**No Support for Private GitHub Repositories:**
- Problem: If a .excalidraw file is in a private repo, the user must be logged into GitHub for the fetch to succeed. The extension doesn't handle authentication tokens.
- Blocks: Private repo diagrams cannot be viewed through this extension.
- Mitigation: GitHub browser cookies are sent with fetch (via `credentials: 'same-origin'` in viewer.js), so if the user is logged into GitHub, private files should work. However, this isn't tested or documented.
- Recommendation: Test with a private repo .excalidraw file and document expected behavior.

**No Download/Export Option:**
- Problem: Diagrams are read-only, and there's no "download" button to save the .excalidraw JSON locally.
- Blocks: Users must go back to GitHub/GitLab to download the file.
- Priority: Low — nice-to-have, not critical.

---

*Concerns audit: 2026-03-15*
