document.addEventListener('DOMContentLoaded', () => {
    const previewContainer = document.getElementById('preview-container');
    const excalidrawContainer = document.getElementById('excalidraw-container');
    const originalContainer = document.getElementById('original-container');
    const originalCodeEl = originalContainer.querySelector('code');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const retryBtn = document.getElementById('retryBtn');
    const previewBtn = document.getElementById('previewBtn');
    const originalBtn = document.getElementById('originalBtn');

    let currentFileData = null;

    // The primary way to load data in the new automatic workflow.
    // Check session storage for data passed via redirect.
    chrome.storage.session.get(['previewFileData'], (result) => {
        if (result.previewFileData) {
            currentFileData = result.previewFileData;
            
            // Populate the original view
            try {
                const formattedJson = JSON.stringify(JSON.parse(currentFileData.content), null, 2);
                originalCodeEl.textContent = formattedJson;
            } catch {
                originalCodeEl.textContent = currentFileData.content;
            }

            // Render the preview by default
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

    // This listener remains for handling manual file opening from the (now disabled) popup,
    // which can be re-enabled in the future if needed.
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'loadFile') {
            currentFileData = request.fileData;
            renderExcalidraw(currentFileData);
            sendResponse({ status: 'success' });
        }
        return true;
    });

    previewBtn.addEventListener('click', () => {
        previewContainer.classList.remove('hidden');
        originalContainer.classList.add('hidden');
        previewBtn.classList.add('active');
        originalBtn.classList.remove('active');
    });

    originalBtn.addEventListener('click', () => {
        previewContainer.classList.add('hidden');
        originalContainer.classList.remove('hidden');
        previewBtn.classList.remove('active');
        originalBtn.classList.add('active');
    });

    retryBtn.addEventListener('click', () => {
        if (currentFileData) {
            renderExcalidraw(currentFileData);
        }
    });
}); 