/**
 * Background service worker.
 * Receives "open" messages from the content script and navigates
 * the current tab to the sandboxed viewer page.
 */

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "open" || !msg.rawUrl) return;

  const viewerUrl =
    chrome.runtime.getURL("viewer.html") +
    "?rawUrl=" +
    encodeURIComponent(msg.rawUrl);

  // Replace the current tab (raw file page) with the viewer
  chrome.tabs.update(sender.tab.id, { url: viewerUrl });
});
