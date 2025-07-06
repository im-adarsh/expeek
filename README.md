# 🎨 Excalibox – Excalidraw File Viewer

A Chrome extension that previews `.excalidraw` files directly in your browser with a beautiful overlay viewer.

## ✨ Features

- **Instant Preview**: View `.excalidraw` files with a clean overlay interface
- **Universal Support**: Works on GitHub, GitLab, local files, and public URLs
- **Responsive Design**: Beautiful UI that adapts to any screen size
- **Keyboard Shortcuts**: Press `ESC` to close the viewer
- **No External Dependencies**: Uses official Excalidraw rendering library
- **Secure**: No tracking, analytics, or external requests

## 🚀 Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/excalibox.git
   cd excalibox
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the `excalibox` folder

5. The extension is now installed! 🎉

## 📖 Usage

1. **Navigate to any `.excalidraw` file** (GitHub, GitLab, local file, etc.)
2. **The extension automatically detects** the file and shows an overlay
3. **View your drawing** in a beautiful, full-screen interface
4. **Press `ESC` or click the `×` button** to close the viewer

### Test the Extension

1. Click the Excalibox extension icon in your browser
2. Click "Create Test File" to generate a sample `.excalidraw` file
3. The file will open in a new tab and automatically trigger the viewer

## 🛠️ Development

### Project Structure

```
excalibox/
├── manifest.json              # Extension configuration
├── background/
│   └── service-worker.js      # Background service worker
├── content/
│   ├── content.js             # Content script for file detection
│   └── content.css            # Overlay styles
├── popup/
│   ├── index.html             # Popup UI
│   ├── script.js              # Popup logic
│   └── style.css              # Popup styles
├── assets/
│   └── icons/                 # Extension icons
└── README.md
```

### Key Components

- **`content.js`**: Detects `.excalidraw` files and renders them in an overlay
- **`service-worker.js`**: Handles extension lifecycle and messaging
- **`popup/`**: User interface for extension management and testing

### Building Icons

You'll need to create the icon files in `assets/icons/`:
- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## 🔧 Configuration

The extension uses Manifest V3 and includes:

- **Permissions**: `storage`, `activeTab`
- **Host Permissions**: `*://*/*`, `file:///*`
- **Content Scripts**: Automatically injected on all pages
- **Background Service Worker**: Handles extension lifecycle

## 🎯 Supported File Types

- `.excalidraw` files (standard Excalidraw format)
- Works with any valid Excalidraw JSON structure
- Supports both local and remote files

## 🔒 Security

- **No External Tracking**: The extension doesn't send any data to external servers
- **Content Security Policy**: Strict CSP with minimal `unsafe-inline` usage
- **Data Sanitization**: JSON data is validated before rendering
- **Sandboxed Rendering**: Uses iframe for secure Excalidraw rendering

## 🚀 Planned Features

- [ ] Support for `.excalidraw.json` files
- [ ] Keyboard shortcuts for toggling overlay
- [ ] Export rendered drawings as PNG/SVG
- [ ] Inline rendering on GitHub PR diffs
- [ ] Custom themes and styling options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Excalidraw](https://excalidraw.com/) for the amazing drawing library
- Chrome Extension APIs for the robust extension framework
- The open-source community for inspiration and tools

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/excalibox/issues) page
2. Create a new issue with detailed information
3. Include browser version and steps to reproduce

---

**Made with ❤️ for the Excalidraw community** 