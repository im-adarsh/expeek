# 📘 Technical Specification: Excalibox – Excalidraw File Viewer

## 1. Overview

**Excalibox** is a Chrome extension that previews raw `.excalidraw` files directly within the browser (especially on GitHub/GitLab). It displays the drawing in an overlay viewer without editing capabilities, using the official Excalidraw rendering library.

---

## 2. Goals

* Render `.excalidraw` files with a clean overlay UI
* Support local files, GitHub, GitLab, and public URLs
* Maintain performance and security
* Use official Excalidraw rendering packages

---

## 3. Components

### 🔁 `background/service-worker.js`

* Registers lifecycle events (install, activate)
* Handles runtime messaging from popup/content script
* Minimal logic, extensible in future

### 🧹 `content/content.js`

* Detects `.excalidraw` files via URL pattern
* Fetches and parses `.excalidraw` JSON
* Dynamically injects an iframe or shadow DOM overlay
* Renders file using `@excalidraw/excalidraw`

### 🎨 `content/content.css`

* Styles overlay container, dialog, and close button
* Ensures responsive design and visibility

### 💬 `popup/index.html`

* Basic UI with status info and actions
* Buttons for "Create Test File" and "Open Excalidraw"

### 📜 `popup/script.js`

* Creates test `.excalidraw` file
* Opens it in a new tab
* Shows inline notifications

---

## 4. Rendering Flow

1. **User navigates** to a raw `.excalidraw` file
2. `content.js` detects `.excalidraw` extension
3. Fetch file using `fetch(window.location.href)`
4. Parse JSON and validate schema
5. Mount Excalidraw renderer via iframe/shadow DOM
6. Show overlay with close (`×`) button

---

## 5. Dependencies

* [`@excalidraw/excalidraw`](https://www.npmjs.com/package/@excalidraw/excalidraw)
* May be included via CDN or npm build step

---

## 6. Chrome Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "Excalibox – Excalidraw File Viewer",
  "version": "1.0.0",
  "description": "Preview .excalidraw files directly in Chrome with a beautiful overlay viewer",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["*://*/*", "file:///*"],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*/*", "http://*/*", "file:///*"],
      "js": ["content/content.js"],
      "css": ["content/content.css"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup/index.html",
    "default_title": "Excalibox – Excalidraw File Viewer",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  },
  "icons": {
    "16": "assets/icons/icon16.png",
    "32": "assets/icons/icon32.png",
    "48": "assets/icons/icon48.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["assets/icons/*.png", "viewer/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 7. Message Protocols

### From `content.js` to `service-worker.js`

```js
chrome.runtime.sendMessage({ action: "ping" }, response => {
  console.log(response.message); // Extension is active
});
```

---

## 8. File Detection Logic (Pseudo-code)

```js
if (window.location.href.endsWith(".excalidraw")) {
  const data = await fetch(window.location.href).then(r => r.json());
  renderOverlay(data); // mount excalidraw viewer
}
```

---

## 9. Overlay UI Requirements

* **Position**: `fixed`, full viewport
* **Z-Index**: ≥ `10000`
* **Background**: semi-transparent dark
* **Close Button**: top-right `×`, floating, click-to-remove
* **Responsive Design**: adapt to viewport width/height

---

## 10. Security

* Strict `Content-Security-Policy` with limited `unsafe-inline` usage
* No external tracking, analytics, or telemetry
* JSON is sanitized before rendering
* Uses `DOMPurify` (optional) for extra protection if HTML parsing is involved

---

## 11. Build & Dev

```bash
# Development
npm install
npm run dev

# Production
npm run build
```

---

## 12. Planned Enhancements

* Keyboard shortcut to toggle overlay
* Support `.excalidraw.json`
* Inline rendering on PR diffs
* Export rendered file as PNG/SVG

---

## 13. Sample Overlay Mounting Code (content.js)

```js
import { Excalidraw } from "@excalidraw/excalidraw";

const container = document.createElement("div");
container.id = "excalidraw-overlay";
container.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; background: rgba(0,0,0,0.8);";
document.body.appendChild(container);

ReactDOM.render(<Excalidraw initialData={data} viewModeEnabled />, container);
```

---

## 14. Project Structure
/
├── manifest.json
├── README.md
├── TECHNICAL.md
├── .gitignore
├── package.json              # (if using a bundler/build process)
├── create-icons.html         # (optional dev tool)
├── generate-icons.js         # (optional dev tool)

├── background/
│   └── service-worker.js     # Background service worker (Manifest V3)

├── content/
│   ├── content.js            # Script injected into pages
│   └── content.css           # Styles for overlay and viewer

├── popup/
│   ├── index.html            # Popup UI
│   ├── script.js             # Handles test file creation / interaction
│   └── style.css             # Styling for popup window

├── viewer/                   # Optional (if using custom viewer iframe)
│   ├── viewer.html
│   ├── viewer.js
│   └── viewer.css

├── assets/
│   └── icons/
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png

├── tests/                    # Optional test folder
│   ├── content.test.js
│   └── puppeteer.e2e.test.js

├── dist/                     # Production build output (if bundled)
└── node_modules/             # Installed via npm or yarn
