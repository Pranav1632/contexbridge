// Chrome Extension Background Service Worker
// Relays fetch requests from content scripts to bypass page CSP restrictions (e.g. on claude.ai)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CAPTURE_CONVERSATION') {
    fetch('http://localhost:3100/api/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload),
    })
      .then(async (res) => {
        const data = await res.json();
        sendResponse({ success: res.ok, data });
      })
      .catch((err) => {
        console.error('[ContextBridge Background] Relay fetch error:', err);
        sendResponse({ success: false, error: err.message || 'Server offline' });
      });

    return true; // Keep message channel open for async response
  }
});
