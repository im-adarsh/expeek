// Background service worker for Excalibox extension
// Handles lifecycle events and runtime messaging

// Install event - set up extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Excalibox extension installed:', details.reason);
  
  // Initialize extension state
  chrome.storage.local.set({
    isActive: true,
    lastUsed: Date.now()
  });
});

// Activate event - clean up old data if needed
chrome.runtime.onStartup.addListener(() => {
  console.log('Excalibox extension started');
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  switch (request.action) {
    case 'ping':
      sendResponse({ message: 'Extension is active', timestamp: Date.now() });
      break;
      
    case 'getStatus':
      chrome.storage.local.get(['isActive', 'lastUsed'], (result) => {
        sendResponse({
          isActive: result.isActive || true,
          lastUsed: result.lastUsed || Date.now()
        });
      });
      return true; // Keep message channel open for async response
      
    case 'setStatus':
      chrome.storage.local.set({ 
        isActive: request.isActive,
        lastUsed: Date.now()
      });
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle extension icon click (optional)
chrome.action.onClicked.addListener((tab) => {
  // This will only trigger if no popup is defined
  console.log('Extension icon clicked on tab:', tab.id);
}); 