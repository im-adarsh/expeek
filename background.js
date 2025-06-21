// This service worker handles the redirection to the preview page.

function showPreviewInTab(tabId, fileData) {
    // We are about to navigate the tab, so we need to store the data
    // in a place that persists through navigation. Session storage is ideal.
    chrome.storage.session.set({ 'previewFileData': fileData }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving to session storage:', chrome.runtime.lastError);
            return;
        }
        chrome.tabs.update(tabId, { url: chrome.runtime.getURL("preview.html") });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showPreviewInCurrentTab') {
        const tabId = sender.tab.id;
        showPreviewInTab(tabId, request.fileData);
        sendResponse({status: "redirecting"});
        return true;
    }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Ex-Peek extension installed.');
}); 