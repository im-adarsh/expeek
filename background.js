// This is the service worker for the extension.
// It currently has no specific background tasks,
// but it's here for future enhancements.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Excalidraw Previewer extension installed.');
}); 