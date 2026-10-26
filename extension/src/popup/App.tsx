import React, { useEffect, useState } from 'react';

export const App: React.FC = () => {
  const [activeContext, setActiveContext] = useState<any>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(false);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      const health = await fetch('http://localhost:3100/api/health');
      if (health.ok) {
        setServerOnline(true);
        const contextRes = await fetch('http://localhost:3100/api/context/active');
        if (contextRes.ok) {
          const data = await contextRes.json();
          setActiveContext(data);
        }
      }
    } catch {
      setServerOnline(false);
    }
  };

  return (
    <div style={{ padding: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <strong style={{ fontSize: '15px' }}>🌉 ContextBridge</strong>
        <span
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: serverOnline ? '#14532d' : '#7f1d1d',
            color: serverOnline ? '#86efac' : '#fca5a5',
          }}
        >
          {serverOnline ? '● Engine Online' : '○ Engine Offline'}
        </span>
      </div>

      {activeContext ? (
        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>ACTIVE GOAL</div>
            <strong style={{ color: '#f8fafc' }}>{activeContext.activeGoal}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '8px', borderRadius: '6px' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>SAVED TOKENS</div>
              <strong style={{ color: '#4ade80' }}>{activeContext.metrics?.savingsPercent || 0}%</strong>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '8px', borderRadius: '6px' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>DECISIONS LOGGED</div>
              <strong style={{ color: '#818cf8' }}>{activeContext.decisions?.length || 0}</strong>
            </div>
          </div>

          <a
            href="http://localhost:3100/api/context/export/markdown"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              backgroundColor: '#6366f1',
              color: 'white',
              textDecoration: 'none',
              padding: '8px',
              borderRadius: '6px',
              fontWeight: 600,
              marginTop: '4px',
            }}
          >
            📥 Download Handoff (.md)
          </a>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          Open ChatGPT, Claude, or <code>mock-chat.html</code> and click the floating bridge pill to distill your conversation!
        </p>
      )}
    </div>
  );
};
