import React, { useState, useEffect } from 'react';
import { scrapeCurrentChat } from './scraper';

export const Pill: React.FC = () => {
  const [turnCount, setTurnCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>('');
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    const turns = scrapeCurrentChat();
    setTurnCount(turns.length);

    const observer = new MutationObserver(() => {
      const updated = scrapeCurrentChat();
      setTurnCount(updated.length);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleBridge = async (overrideTurns?: any[]) => {
    setLoading(true);
    setStatus('Distilling context...');
    setStatusType('info');
    try {
      const turns = overrideTurns || scrapeCurrentChat();
      if (turns.length === 0) {
        setStatus('No turns detected. Paste text in fallback!');
        setStatusType('error');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:3100/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: window.location.hostname,
          messages: turns,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus(`✓ Synced to MCP (${data.bundle.metrics.savingsPercent}% saved)`);
        setStatusType('success');
        setTimeout(() => setStatus(null), 4500);
      } else {
        setStatus('Server error');
        setStatusType('error');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('Server offline (:3100)');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    const manualTurns = [
      { role: 'user', content: 'Manual conversation context' },
      { role: 'assistant', content: manualText.trim() },
    ];
    handleBridge(manualTurns);
    setShowModal(false);
    setManualText('');
  };

  return (
    <>
      <div
        id="contextbridge-pill"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
          color: '#f8fafc',
          padding: minimized ? '6px 12px' : '8px 14px',
          borderRadius: '9999px',
          boxShadow: '0 20px 30px -5px rgba(0,0,0,0.7), 0 0 0 1px rgba(99, 102, 241, 0.4)',
          backdropFilter: 'blur(20px)',
          fontSize: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          transition: 'all 0.25s ease',
          pointerEvents: 'auto',
        }}
      >
        {/* Brand identity */}
        <div
          onClick={() => setMinimized(!minimized)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
          title={minimized ? 'Click to expand' : 'Click to minimize'}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            }}
          >
            🌉
          </div>
          <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>ContextBridge</span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#94a3b8',
              padding: '1px 7px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: 500,
            }}
          >
            {turnCount}t
          </span>
        </div>

        {!minimized && (
          <>
            <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

            {/* Hero Action: Send to IDE */}
            <button
              onClick={() => handleBridge()}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: '#ffffff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '11.5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
                transition: 'transform 0.15s, opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              {loading ? '⚡ Syncing...' : '⚡ Send to IDE (MCP)'}
            </button>

            {/* Quick Export link */}
            <a
              href="http://localhost:3100/api/context/export/markdown"
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#cbd5e1',
                textDecoration: 'none',
                padding: '4px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Download clean Markdown handoff"
            >
              📥 .md
            </a>

            {/* Fallback button */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '2px 4px',
              }}
              title="Manual Paste Fallback"
            >
              📋
            </button>
          </>
        )}

        {status && (
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor:
                statusType === 'success'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : statusType === 'error'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(99, 102, 241, 0.15)',
              color:
                statusType === 'success'
                  ? '#4ade80'
                  : statusType === 'error'
                  ? '#f87171'
                  : '#a5b4fc',
              border: `1px solid ${
                statusType === 'success'
                  ? 'rgba(34, 197, 94, 0.3)'
                  : statusType === 'error'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(99, 102, 241, 0.3)'
              }`,
            }}
          >
            {status}
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '540px',
              width: '90%',
              color: '#f8fafc',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📋</span>
                <strong style={{ fontSize: '15px' }}>Manual Context Ingestion</strong>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '9999px',
                  width: '26px',
                  height: '26px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px' }}>
              If live DOM scraping is unavailable on stage, paste your chat transcript, requirements, or code notes below. ContextBridge will compress and structure it for MCP agents immediately.
            </p>
            <textarea
              rows={8}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste conversation or architecture notes..."
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px',
                color: '#f8fafc',
                fontSize: '13px',
                fontFamily: 'ui-monospace, Menlo, Monaco, monospace',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                }}
              >
                Distill & Bridge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
