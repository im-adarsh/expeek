# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- Kebab-case for entry points: `content.js`, `background.js`, `viewer.js`
- Lowercase with hyphens for generated assets: `icon16.png`, `icon32.png`
- Configuration files are standard: `.babelrc`, `webpack.config.js`, `manifest.json`

**Functions:**
- camelCase for regular functions: `getRawUrl()`, `showError()`, `createOverlay()`
- camelCase for class methods: `init()`, `tryInitialize()`, `isExcalidrawFile()`, `renderExcalidraw()`
- Descriptive names reflecting purpose: `fetchExcalidrawFile()`, `loadExcalidrawLibraries()`

**Variables:**
- camelCase for all variables: `rawUrl`, `rawFile`, `response`, `fileContent`, `viewerDiv`
- Prefix with `is` for boolean checks: `isExcalidrawFile`, `isGithubRaw`, `hasExcalidrawExtension`, `isExcalidrawContent`
- Prefix with `has` for possession checks: `hasExcalidrawExtension`
- Private/internal properties prefixed with underscore in class context (observed in `ExcaliboxViewer`): `this.overlay`, `this.viewer`, `this.excalidrawInstance`

**Classes:**
- PascalCase: `ExcaliboxViewer`, `App`
- Descriptive names indicating responsibility: `ExcaliboxViewer` is the main viewer class

**DOM Element IDs:**
- Kebab-case with semantic prefix: `excalibox-overlay`, `excalibox-viewer`, `excalibox-close`, `loading`, `error`, `error-msg`, `root`

## Code Style

**Formatting:**
- No explicit linter configured (no ESLint/Prettier files present)
- Babel transpilation with preset-react for JSX support
- Target: Chrome 100+
- Indentation: 2 spaces (observed consistently across files)

**Import Organization:**
- React/library imports first: `import { createRoot } from "react-dom/client"`
- State hooks next: `import { useState, useEffect } from "react"`
- External packages: `import { Excalidraw } from "@excalidraw/excalidraw"`
- No path aliases detected; relative imports not used in main files

**Error Handling:**

Pattern 1: Try-catch with console.error logging (in `content/content.js`):
```javascript
try {
  // operation
} catch (error) {
  console.error('Failed to fetch Excalidraw file:', error);
  return null;
}
```

Pattern 2: Promise-based error handling (in `viewer.js`):
```javascript
fetch(rawUrl)
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  })
  .catch((err) => {
    showError(`Failed to load file: ${err.message}`);
  });
```

Pattern 3: Explicit error display (in `viewer.js`):
```javascript
function showError(msg) {
  document.getElementById("loading").style.display = "none";
  document.getElementById("error").style.display = "flex";
  document.getElementById("error-msg").textContent = msg;
}
```

**Logging:**
- Framework: `console` (no dedicated logging library)
- Pattern: Log progress during initialization, errors on failures
- Examples from `content/content.js`: `console.log('ExcaliboxViewer initializing...')`, `console.error('Error during initialization:', error)`
- Verbose console logging for debugging URL detection and library loading

## Comments

**When to Comment:**
- File-level comments explaining script purpose: `/** * Tiny content script — just detects the URL ... */`
- HTML comments for major sections: `<!-- Loading splash -->`, `<!-- Error state -->`
- Inline comments for non-obvious logic: `// Already loaded`, `// Clear retry attempts if successful`
- Explanatory comments in regex patterns and conditional checks

**JSDoc/TSDoc:**
- Minimal JSDoc usage observed; function-level comments preferred
- Class methods lack JSDoc but are self-documenting through descriptive names

## Function Design

**Size:**
- Typically 10-30 lines for utility functions
- Class methods range from 5 lines (simple getters) to 40 lines (complex async operations)
- Example: `getRawUrl()` = 24 lines, `fetchExcalidrawFile()` = 43 lines

**Parameters:**
- 0-2 parameters typical for functions
- Class-based design with instance state preferred over function parameters for stateful operations
- No destructuring observed; direct parameter passing

**Return Values:**
- Explicit returns in conditional logic: `return null;`, `return true;`, `return href;`
- Promise-returning functions for async operations: `async fetchExcalidrawFile()`, `async init()`
- Functions returning DOM elements or state values

## Module Design

**Exports:**
- `viewer.js` uses ES6 import/export with React: `import { Excalidraw }` and default export of App component
- `content.js` is a simple script (no exports)
- `background.js` uses Chrome runtime APIs (no exports)

**Barrel Files:**
- Not used; no index.ts/index.js for re-exports observed

**Webpack Configuration:**
- Entry points: `./content.js`, `./background.js`, `./viewer.js`
- Each bundles independently to `dist/[name].js`
- Babel-loader transpiles JavaScript/JSX
- CopyPlugin copies static assets: `manifest.json`, `viewer.html`, icons
- Excalidraw assets copied from node_modules to `dist/excalidraw-assets`

## Component Patterns

**React Components:**
- Functional components with hooks: `function App()` in `viewer.js`
- useState for data state: `const [data, setData] = useState(null)`
- useEffect for side effects (fetch, DOM queries): Runs once on mount with empty dependency array
- No TypeScript; plain JavaScript with JSX

**Class-Based Patterns:**
- `ExcaliboxViewer` in `content/content.js` uses class-based state management
- Instance properties: `this.overlay`, `this.viewer`, `this.excalidrawInstance`
- Async methods with error handling
- Constructor pattern with initialization count tracking: `this.initAttempts = 0`

## URL and Path Handling

**Regex Patterns:**
- GitHub blob URL detection: `/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/(.+\.excalidraw)$/`
- GitLab blob to raw conversion: `/-/blob/` → `/-/raw/`
- URL parameter extraction: `new URLSearchParams(window.location.search).get("rawUrl")`

## DOM Manipulation

**Pattern:**
- Direct `document.getElementById()` for element selection
- Direct property assignment for visibility: `element.style.display = "none"` or `"flex"`
- Class name manipulation for animations: `loading.classList.add("fade-out")`
- innerHTML for SVG content in `viewer.html`
- textContent for user-facing messages to prevent XSS

---

*Convention analysis: 2026-03-15*
