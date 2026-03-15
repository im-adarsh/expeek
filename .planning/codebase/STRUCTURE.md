# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
expeek/
├── content.js              # Entry point for webpack: content script (URL detection)
├── background.js           # Entry point for webpack: background service worker (message relay)
├── viewer.js               # Entry point for webpack: viewer React component (rendering)
├── viewer.html             # Sandboxed page template with loading/error UI
├── manifest.json           # Chrome MV3 extension configuration
├── style.css               # Legacy CSS (unused in current build, kept for reference)
├── webpack.config.js       # Build configuration (3 entry points)
├── .babelrc                # Babel transpilation config (ES6 → Chrome 100 compatible)
├── package.json            # Dependencies + build scripts
├── content/                # Legacy directory (old inline content script approach)
│   └── content.js
├── dist/                   # Build output directory
│   ├── content.js          # Bundled content script
│   ├── background.js       # Bundled background worker
│   ├── viewer.js           # Bundled viewer component
│   ├── viewer.html         # Copied viewer template
│   ├── manifest.json       # Copied extension config
│   ├── icon*.png           # Generated icons (16, 32, 48, 128)
│   └── excalidraw-assets/  # Copied Excalidraw library assets (locales, fonts, etc.)
├── icons/                  # Icon source and generated images
│   ├── icon.svg            # SVG source
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/                # Utility scripts
│   └── generate-icons.js   # Sharp-based PNG icon generation from SVG
├── docs/                   # Documentation (external reference)
├── example/                # Example diagrams or test files
├── node_modules/           # npm dependencies
└── .planning/              # GSD planning artifacts
```

## Directory Purposes

**Root Level Source Files:**
- Purpose: Main source code for the extension
- Contains: Three webpack entry points (content.js, background.js, viewer.js), manifest, and templates
- Key files: `content.js`, `background.js`, `viewer.js`, `viewer.html`, `manifest.json`

**`dist/`:**
- Purpose: Built extension ready to load in Chrome
- Contains: Bundled JavaScript, copied assets, generated icons, Excalidraw library files
- Generated: Yes (by webpack)
- Committed: No (.gitignore rules)

**`content/`:**
- Purpose: Archive of older content script approach (kept for reference, not used)
- Contains: Original monolithic content.js with full rendering logic
- Status: Legacy/deprecated (new architecture splits into background + viewer)

**`icons/`:**
- Purpose: Icon source and generated images for extension manifest
- Contains: `icon.svg` (source) and 4 PNG sizes (16, 32, 48, 128)
- Key files: `icon.svg` (source of truth), generated PNGs (committed)

**`scripts/`:**
- Purpose: Build utilities
- Contains: `generate-icons.js` (sharp-based SVG → PNG converter)

**`node_modules/`:**
- Purpose: npm dependencies
- Contains: react, react-dom, @excalidraw/excalidraw, webpack, babel, etc.
- Committed: No

## Key File Locations

**Entry Points:**
- `content.js`: Content script entry (detects URL, sends message to background)
- `background.js`: Service worker entry (relays message, navigates tab)
- `viewer.js`: React viewer entry (fetches file, renders Excalidraw)
- `viewer.html`: Sandboxed page template (loading UI, error UI, React root div)

**Configuration:**
- `manifest.json`: Extension metadata, permissions, content script matching rules
- `webpack.config.js`: Build rules (Babel transpilation, asset copying, chunk splitting)
- `.babelrc`: Babel presets (ES6 → Chrome 100, React JSX automatic mode)
- `package.json`: Dependencies and npm scripts

**Core Logic:**
- `content.js`: `getRawUrl()` function (URL normalization), message sending
- `background.js`: Message listener, tab navigation
- `viewer.js`: React `App` component (state management, fetch, error handling)

**Static Assets:**
- `icons/icon.svg`: Source icon (gradients, eye motif)
- `icons/icon*.png`: Generated PNG icons for manifest
- `viewer.html`: HTML template with inline CSS, loading spinner, error state
- `style.css`: Legacy CSS (overlay styles from earlier approach, not used)

## Naming Conventions

**Files:**
- Entry points: camelCase, no extension in webpack config (e.g., `content`, `viewer`)
- Build output: Same as entry points in `dist/` (e.g., `dist/content.js`)
- Assets: lowercase with numbers (e.g., `icon16.png`)
- Config files: kebab-case or dot-files (e.g., `.babelrc`, `webpack.config.js`)

**JavaScript:**
- Functions: camelCase (e.g., `getRawUrl()`, `showError()`)
- Classes: PascalCase (from legacy: `ExcaliboxViewer`)
- Variables: camelCase (e.g., `rawUrl`, `viewer`)
- Constants: UPPER_SNAKE_CASE (e.g., `EXCALIDRAW_CDN`)

**CSS Classes:**
- Pattern: `expeek-{component}` (e.g., `.expeek-overlay`, `.expeek-close`)
- State modifiers: kebab-case (e.g., `.fade-out`)

## Where to Add New Code

**New Feature (URL support):**
- Primary: Add pattern to `getRawUrl()` in `content.js`
- Example: If adding Gitea support, add new conditional branch checking for `gitea.com` domains
- Test: Navigate to the new host's file URL, verify message is sent and viewer loads

**New Component/Module (e.g., file history):**
- Implementation: Create new React component in new file (e.g., `viewer-history.js`)
- Integration: Import and use in `viewer.js` App component
- Build: Webpack will auto-include in `viewer.js` bundle

**Utilities (shared helpers):**
- Location: Create in root (e.g., `url-utils.js`) or in a `lib/` directory
- Webpack config: Add as import in entry files (no separate entry point needed unless splitting bundles)

**Styling:**
- Inline CSS in HTML files (e.g., add `<style>` tags in `viewer.html`)
- Reason: External stylesheets blocked by CSP, inline styles are safe

**Icons:**
- SVG source: Edit `icons/icon.svg` directly (or use vector editor)
- PNG generation: Run `npm run icons` to regenerate 4 sizes from SVG
- Webpack copies generated PNGs to `dist/icons/`

## Special Directories

**`dist/` (Build Output):**
- Purpose: Chrome extension ready to load
- Generated: Yes (webpack output)
- Committed: No
- Load unpacked: Point Chrome to `dist/` directory via `chrome://extensions` → Developer mode → Load unpacked

**`node_modules/` (Dependencies):**
- Purpose: npm packages
- Generated: Yes (by npm install)
- Committed: No
- Key packages: `react`, `react-dom`, `@excalidraw/excalidraw`, `webpack`, `@babel/*`

**`content/` (Legacy Archive):**
- Purpose: Old single-file approach for reference (do not use)
- Status: Deprecated
- Keep: For historical context, but new work goes in root files

**`.planning/` (GSD Artifacts):**
- Purpose: Project planning documents
- Generated: By GSD tools (or manual)
- Committed: Yes
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, etc.

## Build Process

**Development:**
```bash
npm run dev           # Watch mode, rebuilds on file change
                      # Output: dist/ with source maps
```

**Production:**
```bash
npm run icons         # Generate icon PNGs from SVG
npm run build         # Webpack production build → dist/
                      # Minified, no source maps
```

**Load Extension:**
1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select `dist/` folder

**Refresh After Code Changes:**
1. Re-run `npm run build`
2. Go to `chrome://extensions`
3. Click refresh icon on Expeek card
4. Hard-refresh the .excalidraw file page (Ctrl+Shift+R or Cmd+Shift+R)

---

*Structure analysis: 2026-03-15*
