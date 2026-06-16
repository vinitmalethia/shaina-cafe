import React from 'react';

interface DiscoverGridProps {
  onSelectGroup: (group: 'Coffee' | 'Pastries' | 'Brunch' | 'Tea') => void;
}

export const DiscoverGrid: React.FC<DiscoverGridProps> = ({ onSelectGroup }) => {
  return (
    <div className="categories-landing-view" id="categories-landing-view">
      <h2 className="categories-view-title">Categories</h2>
      
      <div className="categories-2x2-grid">
        {/* Card 1: Coffee */}
        <button className="category-grid-card" onClick={() => onSelectGroup('Coffee')}>
          <div className="card-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="card-svg-icon">
              <path d="M17 8h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1m-11-7h12v7a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V7z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <span className="card-label">Coffee</span>
        </button>
        
        {/* Card 2: Pastries */}
        <button className="category-grid-card" onClick={() => onSelectGroup('Pastries')}>
          <div className="card-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" className="card-svg-icon">
              <path d="M3 14C3 9 7 5 12 5s9 4 9 9" />
              <path d="M2.5 13c3 0 4-2 7.5-2s4.5 2 7.5 2" />
              <path d="M6 10c2-1.5 3.5-1.5 5.5-1.5" />
              <path d="M18 10c-2-1.5-3.5-1.5-5.5-1.5" />
              <path d="M2 13v1.5a1.5 1.5 0 0 0 1.5 1.5h17a1.5 1.5 0 0 0 1.5-1.5V13" />
            </svg>
          </div>
          <span className="card-label">Pastries</span>
        </button>
        
        {/* Card 3: Brunch */}
        <button className="category-grid-card" onClick={() => onSelectGroup('Brunch')}>
          <div className="card-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" className="card-svg-icon">
              <rect x="2" y="13" width="12" height="6" rx="1.5" />
              <path d="M4 13V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
              <line x1="8" y1="13" x2="8" y2="7" />
              <path d="M18 5v9" />
              <path d="M16 5h4" />
              <path d="M16 14h4" />
              <path d="M16 9.5h4" />
              <line x1="19" y1="14" x2="19" y2="19" />
            </svg>
          </div>
          <span className="card-label">Brunch</span>
        </button>
        
        {/* Card 4: Tea */}
        <button className="category-grid-card" onClick={() => onSelectGroup('Tea')}>
          <div className="card-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" className="card-svg-icon">
              <path d="M17 9h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1m-13-7h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9z" />
              <path d="M1 21h18" />
              <path d="M12 9c-1-2-1.5-3-1.5-4.5V3.5A1.5 1.5 0 0 1 12 2" />
              <rect x="11" y="2" width="2" height="3" rx="0.5" />
            </svg>
          </div>
          <span className="card-label">Tea</span>
        </button>
      </div>
    </div>
  );
};
