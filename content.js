// This script runs in the context of web pages.
// It listens for messages from the popup to preview files.

(function() {
    const url = window.location.href;
    const isExcalidrawUrl = url.includes('.excalidraw') || (url.endsWith('.json') && url.toLowerCase().includes('excalidraw'));

    if (!isExcalidrawUrl) {
        return;
    }

    const pageContent = document.body.innerText;

    try {
        const data = JSON.parse(pageContent);
        if (data && data.type === 'excalidraw') {
            chrome.runtime.sendMessage({
                action: 'showPreviewInCurrentTab',
                fileData: {
                    name: url.split('/').pop().split('?')[0],
                    content: pageContent,
                    timestamp: Date.now()
                }
            });
        }
    } catch (e) {
        // Not a valid JSON file, this page is not for us.
    }
})(); 