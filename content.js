function isExcalidrawFile() {
  const url = window.location.href;
  return url.endsWith('.excalidraw');
}

function showExcalidrawPreview() {
  if (!isExcalidrawFile()) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'excalidraw-overlay';

  const iframe = document.createElement('iframe');
  iframe.id = 'excalidraw-iframe';
  iframe.src = chrome.runtime.getURL('viewer.html');

  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  iframe.onload = () => {
    fetch(window.location.href)
      .then(response => response.json())
      .then(fileContent => {
        iframe.contentWindow.postMessage({
          type: 'renderExcalidraw',
          fileContent
        }, '*');
      });
  };

  overlay.addEventListener('click', () => {
    overlay.remove();
  });
}

showExcalidrawPreview();
