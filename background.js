// This is the service worker for the extension.
// It currently has no specific background tasks,
// but it's here for future enhancements.

function openPreview(fileData) {
    chrome.tabs.create({
        url: chrome.runtime.getURL("preview.html")
    }, (tab) => {
        const listener = (tabId, changeInfo) => {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'loadFile',
                    fileData: fileData
                });
                chrome.tabs.onUpdated.removeListener(listener);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

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
    if (request.action === "openPreview") {
        openPreview(request.fileData);
        sendResponse({status: "opening"});
        return true; 
    } else if (request.action === 'showPreviewInCurrentTab') {
        const tabId = sender.tab.id;
        showPreviewInTab(tabId, request.fileData);
        sendResponse({status: "redirecting"});
        return true;
    } else if (request.action === 'previewFileFromUrl') {
        fetch(request.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(content => {
                const fileData = {
                    name: request.url.split('/').pop().split('?')[0],
                    content: content,
                    timestamp: Date.now()
                };
                
                openPreview(fileData);
                sendResponse({status: 'success'});
            })
            .catch(error => {
                console.error('Error fetching file content:', error);
                sendResponse({status: 'error', message: error.message});
            });
        
        return true; // Indicates that the response is sent asynchronously
    }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Ex-Peek extension installed.');
}); 