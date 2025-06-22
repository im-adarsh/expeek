(function() {
    const VIEWER_URL = 'https://<YOUR_GITHUB_USERNAME>.github.io/expeek/preview.html';

    // 1. Check if we are on a raw Excalidraw file URL.
    const isExcalidrawUrl = window.location.href.includes('.excalidraw') || 
                            (window.location.href.endsWith('.json') && document.body.innerText.includes('"type": "excalidraw"'));
    
    if (!isExcalidrawUrl) {
        return;
    }

    // 2. We need to run this after the page's content has loaded.
    // The raw JSON is in the body's innerText.
    try {
        const fileContent = document.body.innerText;
        // Verify it's valid JSON before proceeding.
        JSON.parse(fileContent);

        // 3. Base64-encode the content to make it URL-safe.
        const encodedContent = btoa(fileContent);

        // 4. Redirect to the viewer page with the data in the hash.
        window.location.href = `${VIEWER_URL}#${encodedContent}`;

    } catch (e) {
        console.error("Ex-Peek: Failed to parse or redirect Excalidraw file.", e);
    }
})();