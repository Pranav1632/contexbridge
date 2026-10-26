import React from 'react';
import ReactDOM from 'react-dom/client';
import { Pill } from './Pill';

function initContentScript() {
  try {
    if (document.getElementById('contextbridge-root')) return;

    console.log('[ContextBridge] Injecting ambient in-page pill...');
    const mountPoint = document.createElement('div');
    mountPoint.id = 'contextbridge-root';
    mountPoint.style.position = 'fixed';
    mountPoint.style.zIndex = '2147483647'; // Maximum possible z-index
    mountPoint.style.bottom = '24px';
    mountPoint.style.right = '24px';
    mountPoint.style.pointerEvents = 'auto';

    document.documentElement.appendChild(mountPoint);

    const root = ReactDOM.createRoot(mountPoint);
    root.render(<Pill />);
    console.log('[ContextBridge] In-page pill successfully mounted!');
  } catch (err) {
    console.error('[ContextBridge] Mount error:', err);
  }
}

// In case page scripts modify body late, run immediately & also retry
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}

// Fallback interval check for single-page apps (SPA route changes)
setTimeout(initContentScript, 1000);
setTimeout(initContentScript, 2500);
