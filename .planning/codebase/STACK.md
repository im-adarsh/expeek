# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- JavaScript (ES6+) - Content scripts, background worker, viewer application

**Secondary:**
- JSX - React component syntax used in `viewer.js`

## Runtime

**Environment:**
- Chrome/Chromium browser (Chrome Extension MV3)
- Node.js (development only)

**Package Manager:**
- npm (lockfile: `package-lock.json`)

## Frameworks

**Core:**
- React 18.2.0 - UI rendering for the Excalidraw viewer component
- @excalidraw/excalidraw 0.17.0 - Diagram viewing and rendering engine
- react-dom 18.2.0 - DOM mounting for React components

**Build/Dev:**
- Webpack 5.89.0 - Module bundler for Chrome extension packaging
- webpack-cli 5.1.4 - CLI for webpack
- Babel 7.23.0 - JavaScript transpilation to Chrome 100+ compatibility
  - @babel/core 7.23.0
  - @babel/preset-env 7.23.0 - Modern JavaScript syntax transformation
  - @babel/preset-react 7.22.0 - JSX syntax transformation
  - babel-loader 9.1.3 - Webpack loader for Babel

**Build Tools:**
- copy-webpack-plugin 11.0.0 - Copies static assets (manifest, HTML, icons, Excalidraw assets) to dist
- sharp 0.34.5 - Image manipulation for icon generation from SVG
- process 0.11.10 - Polyfill for Node.js `process` global in browser context

## Key Dependencies

**Critical:**
- @excalidraw/excalidraw 0.17.0 - Core drawing visualization. Large library (~2.4 MiB in bundle). Includes canvas rendering, file format support, and UI components.
- react 18.2.0 - Required for component lifecycle, state management, and rendering the Excalidraw viewer in isolation
- react-dom 18.2.0 - Enables React rendering to DOM via `createRoot()` in sandboxed context

**Infrastructure:**
- copy-webpack-plugin 11.0.0 - Copies Excalidraw assets (`node_modules/@excalidraw/excalidraw/dist/excalidraw-assets`) to bundle output for proper asset loading

## Configuration

**Babel Configuration:**
- File: `.babelrc`
- Target: Chrome 100+
- Presets: @babel/preset-env, @babel/preset-react (automatic JSX runtime)

**Webpack Configuration:**
- File: `webpack.config.js`
- Entry points:
  - `content.js` - URL detection and message passing
  - `background.js` - Background service worker for tab messaging
  - `viewer.js` - React + Excalidraw viewer application
- Output: `dist/` directory
- Assets copied: `manifest.json`, `viewer.html`, icons (16×16, 32×32, 48×48, 128×128), Excalidraw assets
- Module resolution: Fallback `process` polyfill for browser environment

**Icon Generation:**
- Script: `scripts/generate-icons.js`
- Input: `icons/icon.svg`
- Output: Resizes SVG to PNG at 16, 32, 48, 128 pixel dimensions using Sharp

## Platform Requirements

**Development:**
- Node.js (version unspecified in package.json, inferred from dev dependencies to be modern LTS)
- npm for dependency management
- Chrome/Chromium browser with extension development mode enabled

**Production:**
- Chrome browser version 100+ (per Babel target)
- No external runtime dependencies for deployed extension
- All code bundled into single extension package (`dist/`)

**Browser APIs Used:**
- Chrome Extension MV3 APIs: `chrome.runtime.sendMessage()`, `chrome.tabs.update()`, `chrome.runtime.onMessage`
- Fetch API for loading `.excalidraw` JSON files from GitHub/GitLab
- DOM APIs for element manipulation and mounting React
- URL/URLSearchParams APIs for query parameter handling
- CSS Grid, Flexbox for styling

## Build Output

**Development:**
```bash
npm run dev        # Webpack watch mode, unminified
npm run build      # Production minified bundle
npm run icons      # Generate PNG icons from SVG (runs as part of build script)
```

**Artifacts:**
- `dist/manifest.json` - MV3 manifest configuration
- `dist/content.js` - Bundled content script
- `dist/background.js` - Bundled background worker
- `dist/viewer.js` - Bundled React + Excalidraw viewer
- `dist/viewer.html` - Sandboxed page hosting viewer
- `dist/icon*.png` - Icons at multiple sizes
- `dist/excalidraw-assets/` - Excalidraw static assets (fonts, styles)

---

*Stack analysis: 2026-03-15*
