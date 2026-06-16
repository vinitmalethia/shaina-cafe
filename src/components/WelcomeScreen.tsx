import React, { useState } from 'react';

interface WelcomeScreenProps {
  onStart: (name: string, tableNumber: number) => void;
  initialName?: string;
  initialTable?: string;
  dismissed?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, initialName = '', initialTable = '', dismissed = false }) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState(initialName);
  const [table, setTable] = useState(initialTable || '7');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedTable = table.trim();

    if (!trimmedName) {
      setError('Customer name is required.');
      return;
    }

    if (!trimmedTable) {
      setError('Table number is required.');
      return;
    }

    const numericTable = Number(trimmedTable);
    if (isNaN(numericTable) || numericTable <= 0) {
      setError('Table number must be a valid positive number.');
      return;
    }

    onStart(trimmedName, numericTable);
  };

  const handleSkipToMenu = () => {
    const numericTable = Number(table.trim()) || 7;
    onStart('', numericTable);
  };

  return (
    <div className={`welcome-screen ${dismissed ? 'dismissed' : ''}`} id="welcome-screen" style={{ zIndex: 9999 }}>
      {/* Top Table Badge */}
      <div className="welcome-table-badge">
        <svg className="icon-table" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 12V4h16v8M4 12h16M4 12l-2 8M20 12l2 8M8 4v8M16 4v8" />
        </svg>
        <span>TABLE {table}</span>
      </div>

      {!showNameInput ? (
        <>
          {/* Main Copy */}
          <div className="welcome-text-container">
            <h1 className="welcome-headline">Welcome to</h1>
            <h2 className="welcome-logo-text">Shaina Cafe</h2>
            <p className="welcome-tagline">
              Experience a moment of calm and indulgence in our sun-drenched boutique space.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="welcome-action-container">
            <button className="welcome-cta-btn" onClick={() => setShowNameInput(true)}>
              <span>Start Ordering</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <button className="welcome-secondary-btn" onClick={handleSkipToMenu}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>View Full Menu</span>
            </button>
          </div>
        </>
      ) : (
        /* Sleek Slide-Up Form Card */
        <div style={{
          backgroundColor: 'rgba(253, 252, 250, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '340px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(120, 83, 41, 0.15)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          margin: 'auto 0',
          animation: 'fade-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', color: '#785329', fontWeight: 800, margin: 0 }}>Almost Ready</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-secondary-light)', marginTop: '6px', lineHeight: '1.4' }}>
              Please enter your name to start ordering from your table.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontFamily: 'var(--font-headline)', fontSize: '13px', fontWeight: 700, color: '#785329' }}>
                Your Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-secondary)',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontFamily: 'var(--font-headline)', fontSize: '13px', fontWeight: 700, color: '#785329' }}>
                Table Number <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="E.g., 12"
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-secondary)',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                }}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600, margin: '2px 0 0 0', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  backgroundColor: '#785329',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(120, 83, 41, 0.2)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Let's Go
              </button>
              <button
                type="button"
                onClick={() => setShowNameInput(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: 'var(--color-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Go Back
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bottom Highlights */}
      <div className="welcome-footer">
        <div className="footer-badge">
          <svg className="footer-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <span>SPECIALTY GRADE</span>
        </div>
        <div className="footer-badge">
          <svg className="footer-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="2" x2="6" y2="4"></line>
            <line x1="10" y1="2" x2="10" y2="4"></line>
            <line x1="14" y1="2" x2="14" y2="4"></line>
          </svg>
          <span>HOUSE ROASTED</span>
        </div>
      </div>
    </div>
  );
};
