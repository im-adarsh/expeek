// This script runs in the context of web pages.
// It listens for messages from the popup to preview files.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'previewFile') {
        fetch(request.url)
            .then(response => response.text())
            .then(content => {
                const fileData = {
                    name: request.url.split('/').pop(),
                    content: content,
                    timestamp: Date.now()
                };
                
                // Open a new preview tab
                chrome.runtime.sendMessage({
                    action: 'openPreview',
                    fileData: fileData
                });
                sendResponse({status: 'success'});
            })
            .catch(error => {
                console.error('Error fetching file content:', error);
                sendResponse({status: 'error', message: error.message});
            });
        
        return true; // Indicates that the response is sent asynchronously
    }
});

// The background script will now handle opening the preview tab
// This makes the logic more centralized.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openPreview") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("preview.html")
        }, (tab) => {
            // Use a listener to send data only when the tab is fully loaded
            const listener = (tabId, changeInfo) => {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'loadFile',
                        fileData: request.fileData
                    });
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        });
        sendResponse({status: "opening"});
        return true;
    }
}); 