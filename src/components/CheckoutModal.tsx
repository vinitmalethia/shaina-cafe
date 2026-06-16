import React, { useState, useEffect } from 'react';

interface CheckoutModalProps {
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
  customerName: string;
  tableNumber: number;
  specialInstructions: string;
  totalToPay: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  onSubmit,
  customerName,
  tableNumber,
  specialInstructions,
  totalToPay
}) => {
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    onSubmit(name.trim(), phone.trim());
  };

  return (
    <div className={`modal-overlay ${active ? 'active' : ''}`} onClick={handleClose} style={{ zIndex: 10000 }}>
      <div className={`modal-content ${active ? 'active' : ''}`} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="close-modal-btn" onClick={handleClose}>&times;</button>
        <div className="modal-header">
          <span className="modal-title-accent">Complete Order</span>
          <h2>Checkout Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form-fields">
          <div className="form-group">
            <label htmlFor="checkout-name" className="input-label required-label">Customer Name</label>
            <input
              type="text"
              id="checkout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-phone" className="input-label">Phone Number (Optional)</label>
            <input
              type="tel"
              id="checkout-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone for updates"
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-table" className="input-label">Table Number</label>
            <input
              type="text"
              id="checkout-table"
              value={`Table ${tableNumber}`}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-notes" className="input-label">Special Instructions</label>
            <textarea
              id="checkout-notes"
              value={specialInstructions}
              readOnly
              rows={2}
              className="readonly-input"
              placeholder="No instructions provided"
            />
          </div>

          <div className="receipt-summary">
            <div className="receipt-row total">
              <span>Total to Pay</span>
              <span>₹{totalToPay.toFixed(0)}</span>
            </div>
            <p className="pay-at-counter-note">ℹ️ Pay at counter after your meal.</p>
          </div>

          <button type="submit" disabled={loading || !name.trim()} className="primary-btn wide-btn" id="place-order-btn">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};
