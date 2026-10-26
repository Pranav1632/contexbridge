import React from 'react';
import ReactDOM from 'react-dom/client';
import { Pill } from './Pill';

function initContentScript() {
  // Avoid duplicate injection
  if (document.getElementById('contextbridge-root')) return;

  const mountPoint = document.createElement('div');
  mountPoint.id = 'contextbridge-root';
  document.body.appendChild(mountPoint);

  const root = ReactDOM.createRoot(mountPoint);
  root.render(<Pill />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
