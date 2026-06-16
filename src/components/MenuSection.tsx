import React from 'react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  bestSeller?: boolean;
  new?: boolean;
  featured?: boolean;
}

interface MenuSectionProps {
  currentGroup: string | null;
  activeCategory: string;
  searchQuery: string;
  menuItems: MenuItem[];
  cart: { [itemId: string]: number };
  onBack: () => void;
  onSelectCategory: (category: string) => void;
  onUpdateCartQty: (itemId: string, delta: number) => void;
  onOpenProductDetails: (item: MenuItem) => void;
  isLoading?: boolean;
}

const CATEGORY_GROUPS = {
  Coffee: ['Hot Coffee', 'Cold Coffee'],
  Pastries: ['Desserts', 'Ice Cream'],
  Brunch: ['Pizza', 'Sandwiches', 'Pasta', 'South Indian', 'Dosa', 'Chinese', 'Noodles', 'Wraps', 'Garlic Bread', 'Fries', 'Nachos', 'Salads'],
  Tea: ['Tea', 'Bubble Tea', 'Smoothies', 'Shakes', 'Mocktails']
};

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'All': '✨',
  'South Indian': '🍲',
  'Dosa': '🥞',
  'Chinese': '🥢',
  'Noodles': '🍜',
  'Pasta': '🍝',
  'Sandwiches': '🥪',
  'Wraps': '🌯',
  'Garlic Bread': '🍞',
  'Fries': '🍟',
  'Nachos': '🌮',
  'Salads': '🥗',
  'Pizza': '🍕',
  'Hot Coffee': '☕',
  'Cold Coffee': '🥤',
  'Tea': '🍵',
  'Bubble Tea': '🧋',
  'Smoothies': '🥤',
  'Shakes': '🥛',
  'Mocktails': '🍹',
  'Desserts': '🍰',
  'Ice Cream': '🍨'
};

export const MenuSection: React.FC<MenuSectionProps> = ({
  currentGroup,
  activeCategory,
  searchQuery,
  menuItems,
  cart,
  onBack,
  onSelectCategory,
  onUpdateCartQty,
  onOpenProductDetails,
  isLoading = false
}) => {
  // Determine categories to show in the chips bar
  let chips: string[] = [];
  if (currentGroup && CATEGORY_GROUPS[currentGroup as keyof typeof CATEGORY_GROUPS]) {
    chips = ['All', ...CATEGORY_GROUPS[currentGroup as keyof typeof CATEGORY_GROUPS]];
  } else {
    // Show all categories if no group selected
    chips = ['All', ...Object.keys(CATEGORY_EMOJIS).filter(c => c !== 'All')];
  }

  // Filter items
  let filtered = menuItems;
  if (currentGroup && activeCategory === 'All') {
    const allowed = CATEGORY_GROUPS[currentGroup as keyof typeof CATEGORY_GROUPS];
    filtered = filtered.filter(item => allowed.includes(item.category));
  } else if (activeCategory !== 'All') {
    filtered = filtered.filter(item => item.category === activeCategory);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }

  // Get active display title
  let displayTitle = 'Our Menu';
  if (activeCategory === 'All') {
    if (currentGroup) displayTitle = currentGroup;
  } else {
    displayTitle = activeCategory;
  }

  if (isLoading) {
    return (
      <div className="menu-items-view" id="menu-items-view">
        {/* Back Button & Title Wrapper */}
        <div className="section-title-wrapper">
          <div className="title-with-back-btn">
            <button className="back-to-categories-btn" id="back-to-categories-btn" aria-label="Back to categories" onClick={onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h2 className="section-title" id="current-category-title">{displayTitle}</h2>
          </div>
          <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: 'var(--radius-full)' }}></div>
        </div>

        {/* Horizontal Category chips bar */}
        <section className="category-section" id="horizontal-category-section">
          <div className="category-list" id="category-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ width: '90px', height: '38px', borderRadius: 'var(--radius-full)', flexShrink: 0 }}></div>
            ))}
          </div>
        </section>

        <div className="menu-grid" id="menu-grid" style={{ display: 'flex' }}>
          {[1, 2].map(i => (
            <div key={i} className="menu-item-card" style={{ opacity: 1, transform: 'none', minHeight: '300px' }}>
              <div className="skeleton" style={{ width: '100%', height: '190px' }}></div>
              <div className="item-details" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div className="skeleton" style={{ width: '60%', height: '20px', borderRadius: '4px' }}></div>
                  <div className="skeleton" style={{ width: '20%', height: '20px', borderRadius: '4px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: '14px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '80%', height: '14px', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="menu-items-view" id="menu-items-view">
      {/* Back Button & Title Wrapper */}
      <div className="section-title-wrapper">
        <div className="title-with-back-btn">
          <button className="back-to-categories-btn" id="back-to-categories-btn" aria-label="Back to categories" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h2 className="section-title" id="current-category-title">{displayTitle}</h2>
        </div>
        <span className="item-count-badge" id="category-item-count">{filtered.length} item{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {/* Horizontal Category chips bar */}
      <section className="category-section" id="horizontal-category-section">
        <div className="category-list" id="category-list">
          {chips.map(category => {
            const isActive = activeCategory === category;
            const emoji = CATEGORY_EMOJIS[category] || '🍽️';
            
            let label = category;
            if (category === 'All' && currentGroup) {
              label = `All ${currentGroup}`;
            }

            return (
              <button
                key={category}
                className={`category-chip ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(category)}
              >
                <span className="category-icon">{emoji}</span> {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Items list grid */}
      {filtered.length === 0 ? (
        <div className="empty-state" id="empty-state" style={{ display: 'flex' }}>
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No items found</h3>
          <p>Try searching for another keyword or select a different category.</p>
        </div>
      ) : (
        <div className="menu-grid" id="menu-grid" style={{ display: 'flex' }}>
          {filtered.map((item, idx) => {
            const inCartQty = cart[item.id] || 0;
            return (
              <div
                key={item.id}
                className="menu-item-card"
                style={{
                  '--stagger-index': Math.min(idx, 8)
                } as React.CSSProperties}
              >
                {/* Image & Badges */}
                <div className="item-img-container" onClick={() => onOpenProductDetails(item)} style={{ cursor: 'pointer' }}>
                  <img src={item.image} alt={item.name} className="item-image" />
                  {item.bestSeller && (
                    <div className="best-seller-badge">
                      <span className="best-seller-star">★</span> BEST SELLER
                    </div>
                  )}
                  {item.new && (
                    <div className="best-seller-badge" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' }}>
                      ✨ NEW
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="item-details">
                  <div className="item-name-row" onClick={() => onOpenProductDetails(item)} style={{ cursor: 'pointer' }}>
                    <h3 className="item-name">{item.name}</h3>
                    <span className="item-price">₹{item.price}</span>
                  </div>
                  <p className="item-description" onClick={() => onOpenProductDetails(item)} style={{ cursor: 'pointer' }}>
                    {item.description}
                  </p>

                  {/* Quantity Actions */}
                  <div className="item-action-row">
                    <div className="action-container" style={{ position: 'relative' }}>
                      {inCartQty === 0 ? (
                        <button
                          className="add-btn"
                          style={{ opacity: 1, pointerEvents: 'auto', display: 'flex' }}
                          onClick={() => onUpdateCartQty(item.id, 1)}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <div
                          className="quantity-selector"
                          style={{ opacity: 1, pointerEvents: 'auto', display: 'flex', width: '100%' }}
                        >
                          <button className="qty-btn" onClick={() => onUpdateCartQty(item.id, -1)}>−</button>
                          <span className="qty-count">{inCartQty}</span>
                          <button className="qty-btn" onClick={() => onUpdateCartQty(item.id, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
