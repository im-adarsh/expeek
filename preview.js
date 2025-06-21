document.addEventListener('DOMContentLoaded', () => {
    const excalidrawContainer = document.getElementById('excalidraw-container');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const retryBtn = document.getElementById('retryBtn');
    const fileNameH1 = document.getElementById('fileName');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const closeBtn = document.getElementById('closeBtn');

    let currentFileData = null;

    const renderExcalidraw = (fileData) => {
        try {
            loadingDiv.style.display = 'none';
            errorDiv.classList.add('hidden');
            excalidrawContainer.innerHTML = '';

            const { Excalidraw, exportToCanvas } = window.ExcalidrawLib;
            const data = JSON.parse(fileData.content);

            const excalidrawComponent = Excalidraw({
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

            excalidrawContainer.appendChild(excalidrawComponent);
            fileNameH1.textContent = fileData.name;
        } catch (e) {
            console.error('Error rendering Excalidraw:', e);
            loadingDiv.style.display = 'none';
            errorDiv.classList.remove('hidden');
        }
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'loadFile') {
            currentFileData = request.fileData;
            renderExcalidraw(currentFileData);
            sendResponse({ status: 'success' });
        }
        return true;
    });

    retryBtn.addEventListener('click', () => {
        if (currentFileData) {
            renderExcalidraw(currentFileData);
        }
    });

    closeBtn.addEventListener('click', () => {
        chrome.tabs.getCurrent(tab => {
            chrome.tabs.remove(tab.id);
        });
    });

    fullscreenBtn.addEventListener('click', () => {
        document.body.classList.toggle('fullscreen');
    });
}); 