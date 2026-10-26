import React, { useEffect, useState } from 'react';

export const App: React.FC = () => {
  const [activeContext, setActiveContext] = useState<any>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    setRefreshing(true);
    try {
      const health = await fetch('http://localhost:3100/api/health');
      if (health.ok) {
        setServerOnline(true);
        const contextRes = await fetch('http://localhost:3100/api/context/active');
        if (contextRes.ok) {
          const data = await contextRes.json();
          setActiveContext(data);
        } else {
          setActiveContext(null);
        }
      }
    } catch {
      setServerOnline(false);
      setActiveContext(null);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        width: '320px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            }}
          >
            🌉
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>ContextBridge</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Universal AI Memory Layer</div>
          </div>
        </div>

        <div
          onClick={checkServer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '10.5px',
            padding: '3px 8px',
            borderRadius: '9999px',
            backgroundColor: serverOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: serverOnline ? '#4ade80' : '#f87171',
            border: `1px solid ${serverOnline ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            cursor: 'pointer',
          }}
          title="Click to refresh status"
        >
          <span style={{ fontSize: '7px' }}>{serverOnline ? '●' : '○'}</span>
          <span>{serverOnline ? 'Engine 3100' : 'Offline'}</span>
        </div>
      </div>

      {activeContext ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Active Goal Card */}
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '12px',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#818cf8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                CURRENT OBJECTIVE
              </span>
              <span style={{ color: '#64748b', fontSize: '10px' }}>{activeContext.source}</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f8fafc', lineHeight: 1.4 }}>
              {activeContext.activeGoal}
            </div>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '10px',
                borderRadius: '8px',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' }}>Token Savings</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80', marginTop: '2px' }}>
                {activeContext.metrics?.savingsPercent || 0}%
              </div>
              <div style={{ color: '#64748b', fontSize: '9.5px', marginTop: '2px' }}>
                {activeContext.metrics?.rawTokenEstimate || 0} ➔ {activeContext.metrics?.compressedTokenEstimate || 0}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '10px',
                borderRadius: '8px',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' }}>Decisions Locked</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#a855f7', marginTop: '2px' }}>
                {activeContext.decisions?.length || 0}
              </div>
              <div style={{ color: '#64748b', fontSize: '9.5px', marginTop: '2px' }}>
                {activeContext.rejectedPaths?.length || 0} rejected paths
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <a
              href="http://localhost:3100/api/context/export/markdown"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: 'white',
                textDecoration: 'none',
                padding: '9px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              }}
            >
              <span>📥</span> Download Handoff (.md)
            </a>

            <div
              style={{
                fontSize: '10px',
                color: '#64748b',
                textAlign: 'center',
                marginTop: '4px',
              }}
            >
              Terminal agents connect via MCP: <code>localhost:3100</code>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px dashed rgba(255,255,255,0.1)',
            padding: '18px 14px',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>No Active Context Yet</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '12px' }}>
            Open ChatGPT, Claude, or the local test fixture and click the floating <strong>ContextBridge pill</strong> to capture memory.
          </div>
          <a
            href="http://localhost:3100/mock-chat.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              fontSize: '11px',
              color: '#818cf8',
              textDecoration: 'none',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            Open Mock Chat Test Fixture ➔
          </a>
        </div>
      )}
    </div>
  );
};
