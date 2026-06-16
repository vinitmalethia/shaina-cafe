import React from 'react';

interface HeaderProps {
  tableNumber: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onOpenProfile: () => void;
  activeTab?: string;
  cartItemsCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tableNumber,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenProfile,
  activeTab,
  cartItemsCount = 0,
  onOpenCart
}) => {
  const isProfileView = activeTab === 'profile' || activeTab === 'rewards';

  if (isProfileView) {
    return (
      <header className="app-header" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Hamburger Menu Icon */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Brand Name */}
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, color: 'var(--color-secondary)', margin: 0 }}>
            Shaina Cafe
          </h1>

          {/* Shopping Bag Icon */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)', position: 'relative', padding: '4px', display: 'flex', alignItems: 'center' }} onClick={onOpenCart}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#c22a2a',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="header-top">
        {/* Table Badge */}
        <div className="table-badge" style={{ cursor: 'pointer' }} onClick={onOpenProfile}>
          <svg className="icon-table" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12V4h16v8M4 12h16M4 12l-2 8M20 12l2 8M8 4v8M16 4v8" />
          </svg>
          <span className="table-text">Table {tableNumber}</span>
        </div>

        {/* Status Indicator */}
        <div className="online-indicator">
          <div className="pulse-dot"></div>
          <span className="indicator-text">Kitchen Online</span>
        </div>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          id="search-input"
          placeholder="Search pizza, coffee, dessert..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button id="clear-search-btn" className="clear-search-btn" onClick={onClearSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};
