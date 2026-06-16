import React, { useState, useEffect } from 'react';

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

interface ProductDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  cartQty: number;
  onUpdateQty: (qty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ item, onClose, cartQty, onUpdateQty }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (item) {
      const raf = requestAnimationFrame(() => {
        setActive(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [item]);

  if (!item) return null;

  const handleClose = () => {
    setActive(false);
    setTimeout(onClose, 400);
  };

  return (
    <div className={`modal-overlay ${active ? 'active' : ''}`} onClick={handleClose} style={{ zIndex: 10000 }}>
      <div className={`modal-content ${active ? 'active' : ''}`} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="close-modal-btn" onClick={handleClose}>&times;</button>
        
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '16px', height: '200px', backgroundColor: 'var(--color-primary-light)' }}>
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="modal-header" style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="modal-title-accent" style={{ marginBottom: '4px' }}>{item.category}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--color-secondary)' }}>{item.name}</h2>
            <span style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary-dark)', whiteSpace: 'nowrap' }}>
              ₹{item.price}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {item.bestSeller && (
            <span style={{ backgroundColor: 'var(--color-tertiary-light)', color: 'var(--color-tertiary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700 }}>
              ★ BEST SELLER
            </span>
          )}
          {item.new && (
            <span style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700 }}>
              ✨ NEW
            </span>
          )}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--color-secondary-light)', lineHeight: '1.5', marginBottom: '24px' }}>
          {item.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-secondary-light)' }}>Quantity</span>
          
          <div className="action-container" style={{ position: 'relative', width: '120px', height: '40px' }}>
            {cartQty === 0 ? (
              <button className="add-btn" style={{ opacity: 1, pointerEvents: 'auto', display: 'flex' }} onClick={() => onUpdateQty(1)}>
                Add to Cart
              </button>
            ) : (
              <div className="quantity-selector" style={{ opacity: 1, pointerEvents: 'auto', display: 'flex', width: '100%' }}>
                <button className="qty-btn" onClick={() => onUpdateQty(cartQty - 1)}>−</button>
                <span className="qty-count">{cartQty}</span>
                <button className="qty-btn" onClick={() => onUpdateQty(cartQty + 1)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
