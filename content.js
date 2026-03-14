/**
 * Tiny content script — just detects the URL and tells the background
 * worker to open the viewer. All heavy lifting is in viewer.js.
 */

function getRawUrl(href) {
  // GitHub blob → raw
  const ghMatch = href.match(
    /^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/(.+\.excalidraw)$/
  );
  if (ghMatch) {
    return `https://raw.githubusercontent.com/${ghMatch[1]}/${ghMatch[2]}`;
  }

  // GitHub raw — use as-is
  if (/^https:\/\/raw\.githubusercontent\.com\/.+\.excalidraw$/.test(href)) {
    return href;
  }

  // GitLab blob → raw
  if (/^https:\/\/gitlab\.com\/.+\/-\/blob\/.+\.excalidraw$/.test(href)) {
    return href.replace("/-/blob/", "/-/raw/");
  }

  // GitLab raw — use as-is
  if (/^https:\/\/gitlab\.com\/.+\/-\/raw\/.+\.excalidraw$/.test(href)) {
    return href;
  }

  return null;
}

const rawUrl = getRawUrl(window.location.href);
if (rawUrl) {
  chrome.runtime.sendMessage({ type: "open", rawUrl });
}
