import React, { useState, useEffect } from 'react';

interface SuccessModalProps {
  onClose: () => void;
  onTrack: () => void;
  orderId: string;
  customerName: string;
  tableNumber: number;
  totalAmount: number;
  itemsCount: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  onClose,
  onTrack,
  orderId,
  customerName,
  tableNumber,
  totalAmount,
  itemsCount
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

  const handleTrack = () => {
    setActive(false);
    setTimeout(onTrack, 400);
  };

  return (
    <div className={`modal-overlay ${active ? 'active' : ''}`} style={{ zIndex: 10000 }}>
      <div className={`modal-content ${active ? 'active' : ''}`} style={{ maxHeight: '90vh', overflowY: 'auto', textAlign: 'center' }}>
        
        <div className="success-animation" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="success-icon-ring">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
        </div>

        <div className="modal-header centered">
          <span className="modal-title-accent">Order Confirmed!</span>
          <h2>Preparing Your Food</h2>
          <p className="success-description">Your order has been sent to the kitchen. You can track it in real time below.</p>
        </div>

        <div className="receipt-summary" style={{ textAlign: 'left', margin: '20px 0' }}>
          <div className="receipt-row">
            <span>Order ID</span>
            <span className="order-id-highlight">#{orderId.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="receipt-row">
            <span>Customer Name</span>
            <span style={{ fontWeight: 600 }}>{customerName}</span>
          </div>
          <div className="receipt-row">
            <span>Table Number</span>
            <span className="table-num-highlight">Table {tableNumber}</span>
          </div>
          <div className="receipt-row">
            <span>Items Ordered</span>
            <span>{itemsCount} item{itemsCount === 1 ? '' : 's'}</span>
          </div>
          <div className="receipt-row total">
            <span>Total Paid</span>
            <span>₹{totalAmount.toFixed(0)}</span>
          </div>
          <div className="receipt-row">
            <span>Est. Waiting Time</span>
            <span className="wait-time-highlight">10-15 mins</span>
          </div>
        </div>

        <div className="modal-actions-success" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="primary-btn wide-btn" onClick={handleTrack}>Track Order Status</button>
          <button className="welcome-secondary-btn success-back-menu-btn" onClick={handleClose} style={{ width: '100%', border: 'none', background: 'none' }}>
            Back to Menu
          </button>
        </div>

      </div>
    </div>
  );
};
