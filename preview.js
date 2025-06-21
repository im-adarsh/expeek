document.addEventListener('DOMContentLoaded', () => {
    const excalidrawContainer = document.getElementById('excalidraw-container');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const retryBtn = document.getElementById('retryBtn');
    const previewBtn = document.getElementById('previewBtn');
    const originalBtn = document.getElementById('originalBtn');

    let currentFileData = null;
    
    // Load the file data that was saved by the background script.
    chrome.storage.session.get(['previewFileData'], (result) => {
        if (result.previewFileData) {
            currentFileData = result.previewFileData;
            renderExcalidraw(currentFileData);
            // Clean up the storage so it's not reused accidentally.
            chrome.storage.session.remove(['previewFileData']);
        }
    });

    const renderExcalidraw = (fileData) => {
        try {
            loadingDiv.style.display = 'none';
            errorDiv.classList.add('hidden');
            excalidrawContainer.innerHTML = '';

            const { Excalidraw } = window.ExcalidrawLib;
            const data = JSON.parse(fileData.content);

            const excalidrawComponent = React.createElement(Excalidraw, {
                initialData: {
                    elements: data.elements,
                    appState: { ...data.appState, viewBackgroundColor: '#ffffff' }
                },
                viewModeEnabled: true,
                zenModeEnabled: false,
                gridModeEnabled: false,
                theme: 'light',
                name: fileData.name
            });

            ReactDOM.render(excalidrawComponent, excalidrawContainer);
        } catch (e) {
            console.error('Error rendering Excalidraw:', e);
            loadingDiv.style.display = 'none';
            errorDiv.classList.remove('hidden');
        }
    };

    // --- History-based Navigation ---
    previewBtn.addEventListener('click', () => {
        // Go forward to the preview (if you just came from the original page).
        history.forward();
    });

    originalBtn.addEventListener('click', () => {
        // Go back to the original raw file page.
        history.back();
    });

    retryBtn.addEventListener('click', () => {
        if (currentFileData) {
            renderExcalidraw(currentFileData);
        }
    });
}); 