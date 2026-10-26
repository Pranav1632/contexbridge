import React, { useState, useEffect } from 'react';
import { scrapeCurrentChat } from './scraper';

export const Pill: React.FC = () => {
  const [turnCount, setTurnCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>('');

  useEffect(() => {
    // Initial count
    const turns = scrapeCurrentChat();
    setTurnCount(turns.length);

    // Watch for new chat turns added to the DOM
    const observer = new MutationObserver(() => {
      const updated = scrapeCurrentChat();
      setTurnCount(updated.length);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleBridge = async (overrideTurns?: any[]) => {
    setLoading(true);
    setStatus('Distilling...');
    try {
      const turns = overrideTurns || scrapeCurrentChat();
      if (turns.length === 0) {
        setStatus('No turns found! Use paste fallback.');
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
        setStatus(`Bridged! (${data.bundle.metrics.savingsPercent}% saved)`);
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus('Server error');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('Server offline (:3100)');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    const manualTurns = [
      { role: 'user', content: 'Manual pasted conversation context' },
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
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '8px 14px',
          borderRadius: '9999px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          border: '1px solid #334155',
          fontSize: '13px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🌉</span>
          <strong style={{ fontWeight: 600 }}>ContextBridge</strong>
          <span
            style={{
              backgroundColor: '#1e293b',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              color: '#94a3b8',
              border: '1px solid #334155',
            }}
          >
            {turnCount} turns
          </span>
        </div>

        <button
          onClick={() => handleBridge()}
          disabled={loading}
          style={{
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
        >
          {loading ? '⏳' : '⚡'} Send to IDE (MCP)
        </button>

        <button
          onClick={() => setShowModal(true)}
          title="Paste/Drop text fallback"
          style={{
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            border: '1px solid #334155',
            padding: '4px 8px',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          📋 Fallback
        </button>

        {status && (
          <span
            style={{
              fontSize: '11px',
              color: status.includes('Bridged') ? '#4ade80' : '#f87171',
              fontWeight: 500,
            }}
          >
            {status}
          </span>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '520px',
              width: '90%',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong>📋 Emergency Paste / Drop Context</strong>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
              If DOM scraping ever hiccups on stage, paste chat or markdown notes here to distill instantly:
            </p>
            <textarea
              rows={8}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste conversation or project requirements here..."
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px',
                color: '#f8fafc',
                fontSize: '13px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                marginBottom: '12px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                style={{
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
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
