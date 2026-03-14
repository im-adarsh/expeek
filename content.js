/**
 * Expeek content script.
 * Detects .excalidraw file URLs on GitHub/GitLab, fetches the raw JSON,
 * and renders it in a full-screen modal overlay via an iframe.
 */

function getRawUrl(href) {
  // GitHub blob: github.com/{u}/{r}/blob/{branch}/.../*.excalidraw
  const ghBlob = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/(.+\.excalidraw)$/;
  const ghMatch = href.match(ghBlob);
  if (ghMatch) {
    return `https://raw.githubusercontent.com/${ghMatch[1]}/${ghMatch[2]}`;
  }

  // GitHub raw: raw.githubusercontent.com/.../*.excalidraw — use as-is
  if (/^https:\/\/raw\.githubusercontent\.com\/.+\.excalidraw$/.test(href)) {
    return href;
  }

  // GitLab blob: gitlab.com/{u}/{r}/-/blob/{branch}/.../*.excalidraw
  const glBlob = /^https:\/\/gitlab\.com\/.+\/-\/blob\/.+\.excalidraw$/;
  if (glBlob.test(href)) {
    return href.replace("/-/blob/", "/-/raw/");
  }

  // GitLab raw: gitlab.com/{u}/{r}/-/raw/.../*.excalidraw — use as-is
  if (/^https:\/\/gitlab\.com\/.+\/-\/raw\/.+\.excalidraw$/.test(href)) {
    return href;
  }

  return null;
}

async function init() {
  const rawUrl = getRawUrl(window.location.href);
  if (!rawUrl) return;

  let fileContent;
  try {
    const res = await fetch(rawUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fileContent = await res.json();
  } catch (err) {
    console.error("[Expeek] Failed to fetch .excalidraw file:", err);
    return;
  }

  showModal(fileContent);
}

function showModal(fileContent) {
  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "expeek-overlay";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "expeek-close";
  closeBtn.setAttribute("aria-label", "Close Excalidraw viewer");
  closeBtn.textContent = "✕";

  // Iframe
  const iframe = document.createElement("iframe");
  iframe.className = "expeek-iframe";
  iframe.src = chrome.runtime.getURL("viewer.html");
  iframe.setAttribute("allow", "");

  overlay.appendChild(closeBtn);
  overlay.appendChild(iframe);

  // Inject styles inline to bypass page CSP (style-src won't allow chrome-extension://)
  const style = document.createElement("style");
  style.textContent = `
    .expeek-overlay {
      position: fixed; inset: 0; z-index: 999999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    }
    .expeek-iframe {
      width: 90vw; height: 90vh; border: none;
      border-radius: 8px; box-shadow: 0 24px 64px rgba(0,0,0,0.4); background: #fff;
    }
    .expeek-close {
      position: absolute; top: 20px; right: 20px;
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.9); color: #333; font-size: 16px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: background 0.15s, transform 0.1s;
      z-index: 1000000;
    }
    .expeek-close:hover { background: #fff; transform: scale(1.1); }
    .expeek-close:focus-visible { outline: 2px solid #4f7ef8; outline-offset: 2px; }
  `;
  document.head.appendChild(style);

  document.body.appendChild(overlay);

  // Send content once iframe signals it's ready
  window.addEventListener("message", function onMessage(e) {
    if (e.source === iframe.contentWindow && e.data === "expeek:ready") {
      iframe.contentWindow.postMessage(
        { type: "expeek:load", data: fileContent },
        "*"
      );
      window.removeEventListener("message", onMessage);
    }
  });

  function close() {
    overlay.remove();
    style.remove();
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") close();
  }

  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", onKeyDown);
}

init();
