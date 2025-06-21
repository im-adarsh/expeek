document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const openFileBtn = document.getElementById('openFileBtn');
    const previewCurrentBtn = document.getElementById('previewCurrentBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const recentFiles = document.getElementById('recentFiles');
    const status = document.getElementById('status');

    // Load recent files on startup
    loadRecentFiles();

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Open file button click handler
    openFileBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // Preview current tab button
    previewCurrentBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (currentTab.url.startsWith('file://')) {
                // Check if it's an Excalidraw file
                if (currentTab.url.endsWith('.excalidraw') || currentTab.url.endsWith('.json')) {
                    chrome.tabs.sendMessage(currentTab.id, {
                        action: 'previewFile',
                        url: currentTab.url
                    });
                } else {
                    showStatus('Current tab is not an Excalidraw file', 'error');
                }
            } else {
                showStatus('Please open an Excalidraw file in the current tab', 'error');
            }
        });
    });

    // Clear history button
    clearHistoryBtn.addEventListener('click', function() {
        chrome.storage.local.remove(['recentFiles'], function() {
            loadRecentFiles();
            showStatus('History cleared', 'success');
        });
    });

    function handleFileSelection(file) {
        if (file.name.endsWith('.excalidraw') || file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    const fileData = {
                        name: file.name,
                        content: content,
                        timestamp: Date.now()
                    };

                    // Save to recent files
                    saveToRecentFiles(fileData);

                    // Open preview
                    openPreview(fileData);
                    
                    showStatus('File loaded successfully', 'success');
                } catch (error) {
                    showStatus('Error reading file: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        } else {
            showStatus('Please select a valid Excalidraw file (.excalidraw or .json)', 'error');
        }
    }

    function openPreview(fileData) {
        // Create a new tab with the preview
        chrome.tabs.create({
            url: chrome.runtime.getURL('preview.html')
        }, function(tab) {
            // Wait for the tab to load, then send the data
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'loadFile',
                        fileData: fileData
                    });
                }
            });
        });
    }

    function saveToRecentFiles(fileData) {
        chrome.storage.local.get(['recentFiles'], function(result) {
            let recentFiles = result.recentFiles || [];
            
            // Remove if already exists
            recentFiles = recentFiles.filter(file => file.name !== fileData.name);
            
            // Add to beginning
            recentFiles.unshift(fileData);
            
            // Keep only last 10 files
            recentFiles = recentFiles.slice(0, 10);
            
            chrome.storage.local.set({recentFiles: recentFiles}, function() {
                loadRecentFiles();
            });
        });
    }

    function loadRecentFiles() {
        chrome.storage.local.get(['recentFiles'], function(result) {
            const files = result.recentFiles || [];
            recentFiles.innerHTML = '';
            
            if (files.length === 0) {
                recentFiles.innerHTML = '<div style="text-align: center; opacity: 0.7; font-size: 12px;">No recent files</div>';
                return;
            }
            
            files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'recent-file';
                fileElement.textContent = file.name;
                fileElement.title = file.name;
                
                fileElement.addEventListener('click', function() {
                    openPreview(file);
                });
                
                recentFiles.appendChild(fileElement);
            });
        });
    }

    function showStatus(message, type = 'info') {
        status.textContent = message;
        status.className = `status ${type}`;
        
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status';
        }, 3000);
    }
}); 