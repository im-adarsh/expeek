// Content script for Excalibox
console.log('Excalibox content script loaded!');

const EXCALIDRAW_CDN = 'https://unpkg.com/@excalidraw/excalidraw@0.15.3/dist/excalidraw.production.min.js';
const EXCALIDRAW_CSS_CDN = 'https://unpkg.com/@excalidraw/excalidraw@0.15.3/dist/excalidraw.min.css';

class ExcaliboxViewer {
  constructor() {
    this.overlay = null;
    this.viewer = null;
    this.excalidrawInstance = null;
    this.initAttempts = 0;
    this.maxAttempts = 5;
  }

  async init() {
    console.log('ExcaliboxViewer initializing...');
    console.log('Current URL:', window.location.href);
    
    // Initialize immediately and then set up retries
    this.tryInitialize();
    
    // Set up multiple retry attempts
    for (let i = 1; i <= this.maxAttempts; i++) {
      setTimeout(() => this.tryInitialize(), i * 1000);
    }
  }

  async tryInitialize() {
    try {
      console.log(`Initialization attempt ${this.initAttempts + 1}...`);
      
      if (this.initAttempts >= this.maxAttempts) {
        console.log('Max initialization attempts reached');
        return;
      }
      
      this.initAttempts++;

      if (!this.isExcalidrawFile()) {
        console.log('Not an Excalidraw file (yet)');
        return;
      }

      console.log('Excalidraw file detected!');
      
      // Check if we already have an overlay
      if (document.getElementById('excalibox-overlay')) {
        console.log('Overlay already exists');
        return;
      }

      await this.loadExcalidrawLibraries();
      console.log('Libraries loaded');

      const fileContent = await this.fetchExcalidrawFile();
      if (!fileContent) {
        throw new Error('Failed to fetch or parse Excalidraw file');
      }
      console.log('File content fetched successfully');

      this.createOverlay();
      console.log('Overlay created');

      await this.renderExcalidraw(fileContent);
      console.log('Excalidraw rendered successfully');
      
      // Clear retry attempts if successful
      this.initAttempts = this.maxAttempts;
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  isExcalidrawFile() {
    const url = window.location.href.toLowerCase();
    const isGithubRaw = url.includes('raw.githubusercontent.com');
    const hasExcalidrawExtension = url.includes('.excalidraw');
    
    console.log('URL check:', { isGithubRaw, hasExcalidrawExtension });

    // Always return true for GitHub raw URLs with .excalidraw
    if (isGithubRaw && hasExcalidrawExtension) {
      return true;
    }

    // Check the page content
    const pageContent = document.body?.textContent || '';
    const isExcalidrawContent = pageContent.includes('"type":"excalidraw"') || 
                               pageContent.includes('"source":"excalidraw"');
    
    console.log('Content check:', { isExcalidrawContent });
    
    return isExcalidrawContent;
  }

  async loadExcalidrawLibraries() {
    if (window.Excalidraw) return; // Already loaded

    // Load CSS
    if (!document.querySelector(`link[href="${EXCALIDRAW_CSS_CDN}"]`)) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = EXCALIDRAW_CSS_CDN;
      document.head.appendChild(style);
    }

    // Load JS
    if (!document.querySelector(`script[src="${EXCALIDRAW_CDN}"]`)) {
      const script = document.createElement('script');
      script.src = EXCALIDRAW_CDN;
      document.head.appendChild(script);
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    // Wait for Excalidraw to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async fetchExcalidrawFile() {
    try {
      const headers = new Headers();
      if (window.location.href.includes('raw.githubusercontent.com')) {
        headers.append('Accept', 'application/json, text/plain, */*');
      }

      console.log('Fetching Excalidraw file...');
      const response = await fetch(window.location.href, { 
        headers,
        credentials: 'same-origin',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Received response, parsing JSON...');
      
      try {
        const data = JSON.parse(text);
        if (data && (data.type === 'excalidraw' || data.source === 'excalidraw' || data.elements)) {
          console.log('Valid Excalidraw file detected');
          return data;
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        // If the content looks like an Excalidraw file but failed to parse,
        // try to clean it up and parse again
        if (text.includes('"type":"excalidraw"') || text.includes('"source":"excalidraw"')) {
          const cleaned = text.trim().replace(/^\s+|\s+$/g, '');
          return JSON.parse(cleaned);
        }
      }
      
      console.error('Not a valid Excalidraw file');
      return null;
    } catch (error) {
      console.error('Failed to fetch Excalidraw file:', error);
      return null;
    }
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'excalibox-overlay';
    
    const closeButton = document.createElement('button');
    closeButton.id = 'excalibox-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.overlay.remove();
    
    this.viewer = document.createElement('div');
    this.viewer.id = 'excalibox-viewer';
    
    this.overlay.appendChild(closeButton);
    this.overlay.appendChild(this.viewer);
    document.body.appendChild(this.overlay);
  }

  async renderExcalidraw(fileContent) {
    const viewerDiv = document.getElementById('excalibox-viewer');
    if (!viewerDiv) return;

    const options = {
      mode: "viewer",
      viewModeEnabled: true,
      zenModeEnabled: false,
      gridModeEnabled: false,
      theme: "light",
      initialData: fileContent
    };

    try {
      // Clear any existing content
      viewerDiv.innerHTML = '';
      // Add loading indicator
      viewerDiv.textContent = 'Loading Excalidraw...';
      
      if (!window.Excalidraw) {
        throw new Error('Excalidraw library not loaded');
      }

      await window.Excalidraw.renderToDOM(viewerDiv, options);
    } catch (error) {
      console.error('Failed to render Excalidraw:', error);
      viewerDiv.textContent = 'Failed to load Excalidraw. Please check console for errors.';
    }
  }
}

// Initialize viewer immediately and also on DOM content loaded
const initViewer = () => {
  console.log('Initializing ExcaliboxViewer...');
  const viewer = new ExcaliboxViewer();
  viewer.init();
};

// Try to initialize immediately
initViewer();

// Also initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initViewer);

// And also try after a small delay
setTimeout(initViewer, 1000);
