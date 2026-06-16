import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartModalProps {
  onClose: () => void;
  cart: { [itemId: string]: number };
  menuItems: MenuItem[];
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  notes: string;
  onChangeNotes: (notes: string) => void;
  onCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  onClose,
  cart,
  menuItems,
  onUpdateQty,
  onRemoveItem,
  notes,
  onChangeNotes,
  onCheckout
}) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setActive(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setActive(false);
    setTimeout(onClose, 400);
  };

  const cartItemIds = Object.keys(cart);
  let subtotal = 0;
  
  const cartItems = cartItemIds.map(id => {
    const qty = cart[id];
    const item = menuItems.find(i => i.id === id);
    if (item) {
      subtotal += item.price * qty;
    }
    return { item, qty };
  }).filter(c => c.item !== undefined) as Array<{ item: MenuItem; qty: number }>;

  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  return (
    <div className={`modal-overlay ${active ? 'active' : ''}`} onClick={handleClose} style={{ zIndex: 10000 }}>
      <div className={`modal-content ${active ? 'active' : ''}`} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="close-modal-btn" onClick={handleClose}>&times;</button>
        <div className="modal-header">
          <span className="modal-title-accent">Shaina Cafe</span>
          <h2>Your Cart</h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state" id="cart-empty-state" style={{ display: 'flex' }}>
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse our menu and add your favorite items to start ordering.</p>
            <button className="primary-btn wide-btn" onClick={handleClose}>Back to Menu</button>
          </div>
        ) : (
          <div id="cart-summary-section" style={{ display: 'block' }}>
            {/* Cart Items List */}
            <div className="cart-items-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cartItems.map(({ item, qty }) => (
                <div key={item.id} className="cart-item-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info" style={{ flexGrow: 1 }}>
                    <h4 className="cart-item-name" style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</h4>
                    <span className="cart-item-price">₹{item.price}</span>
                  </div>
                  <div className="cart-item-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="cart-item-qty-container">
                      <button className="cart-qty-btn cart-minus" onClick={() => onUpdateQty(item.id, -1)}>−</button>
                      <span className="cart-qty-val">{qty}</span>
                      <button className="cart-qty-btn cart-plus" onClick={() => onUpdateQty(item.id, 1)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => onRemoveItem(item.id)} aria-label="Remove item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions */}
            <div className="cart-notes-wrapper" style={{ marginBottom: '20px' }}>
              <label htmlFor="cart-notes" className="input-label">Order Notes / Special Requests</label>
              <textarea
                id="cart-notes"
                placeholder="E.g., No onions, extra cheese, allergies, etc..."
                value={notes}
                onChange={(e) => onChangeNotes(e.target.value)}
                rows={2}
              ></textarea>
            </div>

            {/* Prices Receipt Summary */}
            <div className="receipt-summary">
              <div className="receipt-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="receipt-row">
                <span>GST (5%)</span>
                <span>₹{gst.toFixed(0)}</span>
              </div>
              <div className="receipt-row total">
                <span>Total Amount</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <div className="tax-notice">*GST is calculated automatically as per government norms</div>
            </div>

            <button className="primary-btn wide-btn" onClick={onCheckout}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};
