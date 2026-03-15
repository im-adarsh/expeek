# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Status:** Not detected

No testing framework is configured in this codebase. There are no Jest, Vitest, Mocha, or other test runner dependencies in `package.json`. No test files (`.test.js`, `.spec.js`) exist in the source tree.

**Build Configuration:**
- Webpack 5.89.0 for bundling
- Babel 7.23.0 for transpilation (preset-react, preset-env for Chrome 100+)
- No test runner configuration

## Test Organization

**Current State:**
- Zero test coverage
- No test fixtures or factories
- No mock setup or test utilities

**Manual Testing Approach:**
The development process relies on manual extension testing:
1. Run `npm run build` to bundle extension
2. Open `chrome://extensions` in Chrome
3. Enable Developer mode
4. Load unpacked: select `dist/` directory
5. Click refresh icon to reload after code changes
6. Test manually in browser tabs with GitHub/GitLab URLs

## Recommended Testing Strategy

Given the architecture (Chrome content scripts), testing would be challenging due to:

1. **Content Script Testing** (`content.js`, `content/content.js`):
   - Needs DOM environment (jsdom or happy-dom)
   - Requires mocking `chrome.runtime` APIs
   - URL detection logic could be unit tested
   - Fetch calls need mocking

2. **Background Worker Testing** (`background.js`):
   - Requires Chrome runtime API mocks
   - `chrome.runtime.onMessage` listener testing
   - `chrome.tabs.update` call verification

3. **Viewer Component Testing** (`viewer.js`):
   - React component in sandboxed context
   - Excalidraw library integration testing
   - Error state rendering verification
   - Loading animation behavior

## Testing Gaps

**Critical untested areas:**

| Area | File | Risk |
|------|------|------|
| URL detection logic | `content.js` | Regex patterns may fail on edge case URLs |
| GitHub blob → raw URL conversion | `content.js` | Missing test for URL transformation accuracy |
| GitLab blob → raw URL conversion | `content.js` | Replace operation not validated |
| HTTP error handling | `viewer.js` | 404, 500, network errors uncaught |
| Excalidraw file format validation | `viewer.js` | Invalid JSON silently fails |
| File fetch retry logic | `content/content.js` | 5-attempt retry behavior untested |
| DOM element creation | `content/content.js` | Overlay creation/removal not validated |
| React state updates | `viewer.js` | Loading state transitions not verified |

## Suggested Testing Patterns

If testing were to be added, these patterns would work well:

**Unit Test (URL Conversion Logic):**
```javascript
// Test pattern for getRawUrl()
describe('getRawUrl', () => {
  test('converts GitHub blob to raw', () => {
    const input = 'https://github.com/user/repo/blob/main/diagram.excalidraw';
    const expected = 'https://raw.githubusercontent.com/user/repo/main/diagram.excalidraw';
    expect(getRawUrl(input)).toBe(expected);
  });

  test('passes GitHub raw URLs through', () => {
    const input = 'https://raw.githubusercontent.com/user/repo/main/diagram.excalidraw';
    expect(getRawUrl(input)).toBe(input);
  });

  test('converts GitLab blob to raw', () => {
    const input = 'https://gitlab.com/user/repo/-/blob/main/diagram.excalidraw';
    const expected = 'https://gitlab.com/user/repo/-/raw/main/diagram.excalidraw';
    expect(getRawUrl(input)).toBe(expected);
  });

  test('returns null for non-excalidraw URLs', () => {
    expect(getRawUrl('https://github.com/user/repo')).toBeNull();
  });
});
```

**Async Error Test (Fetch Handling):**
```javascript
// Test pattern for fetch error scenarios
describe('fetchExcalidrawFile', () => {
  test('throws on HTTP error response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(fetchExcalidrawFile()).rejects.toThrow('HTTP 404');
  });

  test('handles invalid JSON gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token'))
    });

    const result = await fetchExcalidrawFile();
    expect(result).toBeNull();
  });

  test('parses valid excalidraw JSON', async () => {
    const validData = { type: 'excalidraw', elements: [], appState: {} };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validData)
    });

    const result = await fetchExcalidrawFile();
    expect(result).toEqual(validData);
  });
});
```

**DOM Manipulation Test:**
```javascript
// Test pattern for overlay creation
describe('ExcaliboxViewer.createOverlay', () => {
  test('creates overlay with correct structure', () => {
    const viewer = new ExcaliboxViewer();
    viewer.createOverlay();

    const overlay = document.getElementById('excalibox-overlay');
    expect(overlay).toBeInTheDocument();

    const closeBtn = document.getElementById('excalibox-close');
    expect(closeBtn).toBeInTheDocument();

    const viewerDiv = document.getElementById('excalibox-viewer');
    expect(viewerDiv).toBeInTheDocument();
  });

  test('close button removes overlay', () => {
    const viewer = new ExcaliboxViewer();
    viewer.createOverlay();

    const closeBtn = document.getElementById('excalibox-close');
    closeBtn.click();

    expect(document.getElementById('excalibox-overlay')).not.toBeInTheDocument();
  });
});
```

**Chrome API Mocking Pattern:**
```javascript
// Mock chrome.runtime for background worker tests
global.chrome = {
  runtime: {
    onMessage: { addListener: jest.fn() },
    getURL: jest.fn(path => `chrome-extension://abc/${path}`),
  },
  tabs: {
    update: jest.fn(),
  }
};

describe('background worker', () => {
  test('responds to open message', () => {
    const listener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const sender = { tab: { id: 123 } };

    listener({ type: 'open', rawUrl: 'https://example.com/file.excalidraw' }, sender);

    expect(chrome.tabs.update).toHaveBeenCalledWith(123, expect.objectContaining({
      url: expect.stringContaining('file.excalidraw')
    }));
  });
});
```

## Coverage Recommendations

If a testing framework were added:

**Priority 1 (High Value):**
- URL detection and conversion logic (`content.js` `getRawUrl()`)
- File fetch with error handling (`viewer.js`, `content/content.js`)
- Excalidraw JSON validation logic

**Priority 2 (Medium Value):**
- React component state transitions (`viewer.js`)
- DOM overlay creation/destruction
- Chrome message passing

**Priority 3 (Lower Value):**
- Loading animation CSS transitions
- Icon generation script

## Manual Testing Checklist

Without automated tests, manual validation is essential before releases:

- [ ] GitHub blob URL → loads correctly (test with various branch names)
- [ ] GitHub raw URL → loads correctly
- [ ] GitLab blob URL → loads correctly (test with various group/project structures)
- [ ] GitLab raw URL → loads correctly
- [ ] Non-existent file → error message displays
- [ ] Invalid JSON file → error message displays
- [ ] Network timeout → error message displays with back button
- [ ] Close button removes overlay
- [ ] Diagram renders in viewer mode (read-only)
- [ ] Large diagrams load without performance issues
- [ ] Multiple diagram tabs work independently
- [ ] Dark mode on GitHub/GitLab doesn't interfere with viewer

---

*Testing analysis: 2026-03-15*
