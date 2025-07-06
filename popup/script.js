// Popup script for Excalibox extension
// Handles UI interactions and test file creation

(function() {
  'use strict';
  
  // DOM elements
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = statusIndicator.querySelector('.status-text');
  const statusDot = statusIndicator.querySelector('.status-dot');
  const currentPageInfo = document.getElementById('current-page-info');
  const createTestBtn = document.getElementById('create-test-btn');
  const openExcalidrawBtn = document.getElementById('open-excalidraw-btn');
  const githubLink = document.getElementById('github-link');
  
  // Sample Excalidraw data for test file
  const sampleExcalidrawData = {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: [
      {
        type: "rectangle",
        version: 1,
        id: "rect-1",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        x: 100,
        y: 100,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        width: 200,
        height: 100,
        angle: 0,
        seed: 123456789,
        groupIds: [],
        strokeSharpness: "sharp",
        boundElementIds: null,
        updated: 1234567890,
        link: null,
        locked: false
      },
      {
        type: "text",
        version: 1,
        id: "text-1",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        x: 150,
        y: 130,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        width: 100,
        height: 25,
        angle: 0,
        seed: 987654321,
        groupIds: [],
        strokeSharpness: "sharp",
        boundElementIds: null,
        updated: 1234567890,
        link: null,
        locked: false,
        fontSize: 20,
        fontFamily: 1,
        text: "Hello Excalibox!",
        baseline: 18,
        textAlign: "center",
        verticalAlign: "top"
      }
    ],
    appState: {
      viewBackgroundColor: "#ffffff",
      gridSize: null,
      zoom: { value: 1, translation: { x: 0, y: 0 } },
      scrollX: 0,
      scrollY: 0,
      theme: "light"
    },
    files: {}
  };
  
  // Initialize popup
  async function init() {
    await checkExtensionStatus();
    await checkCurrentPage();
    setupEventListeners();
  }
  
  // Check extension status
  async function checkExtensionStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      updateStatusIndicator(response.isActive);
    } catch (error) {
      console.error('Error checking extension status:', error);
      updateStatusIndicator(false);
    }
  }
  
  // Check current page for .excalidraw files
  async function checkCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab.url;
      
      if (url && (url.endsWith('.excalidraw') || url.includes('.excalidraw?'))) {
        updateCurrentPageInfo('Excalidraw file detected', 'success');
      } else {
        updateCurrentPageInfo('No .excalidraw file detected', 'neutral');
      }
    } catch (error) {
      console.error('Error checking current page:', error);
      updateCurrentPageInfo('Unable to check current page', 'error');
    }
  }
  
  // Update status indicator
  function updateStatusIndicator(isActive) {
    if (isActive) {
      statusText.textContent = 'Active';
      statusDot.className = 'status-dot active';
    } else {
      statusText.textContent = 'Inactive';
      statusDot.className = 'status-dot inactive';
    }
  }
  
  // Update current page info
  function updateCurrentPageInfo(message, type = 'neutral') {
    const pageStatus = currentPageInfo.querySelector('.page-status');
    pageStatus.textContent = message;
    pageStatus.className = `page-status ${type}`;
  }
  
  // Create test .excalidraw file
  async function createTestFile() {
    try {
      // Create blob with sample data
      const blob = new Blob([JSON.stringify(sampleExcalidrawData, null, 2)], {
        type: 'application/json'
      });
      
      // Create object URL
      const url = URL.createObjectURL(blob);
      
      // Open in new tab
      await chrome.tabs.create({ url });
      
      // Show success notification
      showNotification('Test file created and opened!', 'success');
      
    } catch (error) {
      console.error('Error creating test file:', error);
      showNotification('Failed to create test file', 'error');
    }
  }
  
  // Open Excalidraw website
  async function openExcalidraw() {
    try {
      await chrome.tabs.create({ url: 'https://excalidraw.com' });
    } catch (error) {
      console.error('Error opening Excalidraw:', error);
      showNotification('Failed to open Excalidraw', 'error');
    }
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to popup
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Create test file button
    createTestBtn.addEventListener('click', createTestFile);
    
    // Open Excalidraw button
    openExcalidrawBtn.addEventListener('click', openExcalidraw);
    
    // GitHub link
    githubLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/your-username/excalibox' });
    });
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 