# Expeek – Excalidraw Viewer for GitHub & GitLab

> Instantly render `.excalidraw` files from GitHub and GitLab — no download, no copy-paste.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://github.com/im-adarsh/expeek)

---

## What it does

When you open a `.excalidraw` file URL on GitHub or GitLab, Expeek automatically navigates to a full-screen Excalidraw viewer — no copy-paste, no downloading, no switching apps.

**Supported URL patterns:**

| Host | URL |
|------|-----|
| GitHub blob | `github.com/{user}/{repo}/blob/{branch}/…/file.excalidraw` |
| GitHub raw | `raw.githubusercontent.com/{user}/{repo}/{branch}/…/file.excalidraw` |
| GitLab blob | `gitlab.com/{user}/{repo}/-/blob/{branch}/…/file.excalidraw` |
| GitLab raw | `gitlab.com/{user}/{repo}/-/raw/{branch}/…/file.excalidraw` |

---

## Installation

### Option A — Load from source (Developer mode)

1. **Clone the repo**
   ```bash
   git clone https://github.com/im-adarsh/expeek.git
   cd expeek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```
   This generates the `dist/` folder.

4. **Load in Chrome**
   - Open `chrome://extensions`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked**
   - Select the `dist/` folder

5. **Done.** Navigate to any `.excalidraw` file on GitHub or GitLab.

---

## Usage

1. Open any `.excalidraw` file URL on GitHub or GitLab — for example:
   ```
   https://raw.githubusercontent.com/im-adarsh/expeek/main/example/sample.excalidraw
   ```

2. Expeek automatically opens the file in a full-screen Excalidraw viewer.

3. The diagram is rendered in **view-only mode** — pan, zoom, and inspect freely.

---

## Development

```bash
npm run dev     # Watch mode — rebuilds on every file change
npm run build   # Production build → dist/
```

After rebuilding, click the **refresh icon** on the Expeek card in `chrome://extensions`.

### Project structure

```
expeek/
├── content.js        # Content script — detects .excalidraw URLs, notifies background
├── background.js     # Service worker — navigates tab to viewer
├── viewer.html       # Viewer page shell (manifest sandbox page)
├── viewer.js         # React + @excalidraw/excalidraw renderer
├── manifest.json     # Chrome MV3 manifest
├── webpack.config.js # Build config
└── example/          # Sample .excalidraw file for testing
```

---

## How it works

```
1. Content script fires on .excalidraw URL
        │
        │  chrome.runtime.sendMessage({ rawUrl })
        ▼
2. Background service worker receives message
        │
        │  chrome.tabs.update → viewer.html?rawUrl=...
        ▼
3. Viewer page (sandbox extension page)
   fetches raw JSON → renders with @excalidraw/excalidraw
```

The viewer runs as a Chrome extension sandbox page, which allows the dynamic code evaluation that Excalidraw requires internally — without needing `unsafe-eval` in the extension CSP.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-change`
3. Commit your changes: `git commit -m 'add my change'`
4. Push and open a PR: `git push origin feature/my-change`

---

## License

[MIT](LICENSE) © [Adarsh Kumar](https://github.com/im-adarsh)
