// Content script for Excalibox extension
// Detects .excalidraw files and renders them in an overlay

(function() {
  'use strict';
  
  // Check if we're on a .excalidraw file
  function isExcalidrawFile() {
    const url = window.location.href;
    return url.endsWith('.excalidraw') || url.includes('.excalidraw?');
  }
  
  // Create overlay container
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'excalibox-overlay';
    overlay.className = 'excalibox-overlay';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'excalibox-close';
    closeButton.innerHTML = '×';
    closeButton.title = 'Close viewer';
    closeButton.addEventListener('click', () => {
      removeOverlay();
    });
    
    // Create viewer container
    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'excalibox-viewer';
    viewerContainer.className = 'excalibox-viewer';
    
    overlay.appendChild(closeButton);
    overlay.appendChild(viewerContainer);
    
    return overlay;
  }
  
  // Remove overlay
  function removeOverlay() {
    const overlay = document.getElementById('excalibox-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
  
  // Sanitize JSON data
  function sanitizeData(data) {
    // Basic validation - ensure it's an object with expected properties
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data format');
    }
    
    // Check for required Excalidraw properties
    if (!data.type || data.type !== 'excalidraw') {
      throw new Error('Not a valid Excalidraw file');
    }
    
    return data;
  }
  
  // Create iframe for Excalidraw viewer
  function createViewerIframe(data) {
    const iframe = document.createElement('iframe');
    iframe.className = 'excalibox-iframe';
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    
    // Create a simple HTML page with Excalidraw
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Excalidraw Viewer</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #root { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script src="https://unpkg.com/@excalidraw/excalidraw@0.17.0/dist/excalidraw.production.min.js"></script>
    <script>
        const { Excalidraw } = window.ExcalidrawLib;
        const data = ${JSON.stringify(data)};
        
        ReactDOM.render(
            React.createElement(Excalidraw, {
                initialData: data,
                viewModeEnabled: true,
                zenModeEnabled: false,
                gridModeEnabled: false,
                theme: 'light',
                UIOptions: {
                    canvasActions: {
                        saveToActiveFile: false,
                        loadScene: false,
                        export: false,
                        saveAsImage: false,
                        clearCanvas: false,
                        theme: false,
                        changeViewBackgroundColor: false,
                        saveAsFile: false,
                        loadFile: false,
                        toggleTheme: false,
                        exportToBackend: false,
                        saveToFile: false,
                        loadFromFile: false,
                        changeCanvasBackground: false,
                        exportToImage: false,
                        saveToBackend: false,
                        loadFromBackend: false,
                        changeViewBackgroundColor: false,
                        saveAsImage: false,
                        saveAsFile: false,
                        loadFile: false,
                        loadScene: false,
                        export: false,
                        clearCanvas: false,
                        theme: false,
                        changeViewBackgroundColor: false,
                        saveAsFile: false,
                        loadFile: false,
                        toggleTheme: false,
                        exportToBackend: false,
                        saveToFile: false,
                        loadFromFile: false,
                        changeCanvasBackground: false,
                        exportToImage: false,
                        saveToBackend: false,
                        loadFromBackend: false
                    }
                }
            }),
            document.getElementById('root')
        );
    </script>
</body>
</html>`;
    
    iframe.srcdoc = htmlContent;
    return iframe;
  }
  
  // Render Excalidraw file
  async function renderExcalidrawFile() {
    try {
      // Show loading state
      const overlay = createOverlay();
      document.body.appendChild(overlay);
      
      // Fetch the .excalidraw file
      const response = await fetch(window.location.href);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      
      const data = await response.json();
      const sanitizedData = sanitizeData(data);
      
      // Create and mount viewer
      const viewerContainer = document.getElementById('excalibox-viewer');
      const iframe = createViewerIframe(sanitizedData);
      viewerContainer.appendChild(iframe);
      
      // Ping background script
      chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
        console.log('Extension status:', response);
      });
      
    } catch (error) {
      console.error('Error rendering Excalidraw file:', error);
      
      // Show error message
      const overlay = document.getElementById('excalibox-overlay');
      if (overlay) {
        const viewerContainer = document.getElementById('excalibox-viewer');
        viewerContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center;">
            <div>
              <h3>Error Loading Excalidraw File</h3>
              <p>${error.message}</p>
              <button onclick="document.getElementById('excalibox-overlay').remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
          </div>
        `;
      }
    }
  }
  
  // Keyboard shortcuts
  function handleKeyPress(event) {
    // ESC key to close overlay
    if (event.key === 'Escape') {
      const overlay = document.getElementById('excalibox-overlay');
      if (overlay) {
        removeOverlay();
      }
    }
  }
  
  // Initialize
  function init() {
    if (isExcalidrawFile()) {
      console.log('Excalibox: Detected .excalidraw file');
      renderExcalidrawFile();
    }
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyPress);
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 