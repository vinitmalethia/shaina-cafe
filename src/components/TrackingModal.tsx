import React, { useState, useEffect } from 'react';

interface TrackingModalProps {
  onClose: () => void;
  order: {
    id: string;
    status: 'received' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
    items: Array<{ name: string; quantity: number }>;
    totalAmount: number;
  } | null;
  onBrowseMenu: () => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ onClose, order, onBrowseMenu }) => {
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

  const handleBrowseMenu = () => {
    setActive(false);
    setTimeout(onBrowseMenu, 400);
  };

  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'served':
      case 'completed':
      case 'cancelled':
        return 3;
      default: return 0;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Received';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'served':
      case 'completed':
        return 'Served';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  const getStatusDesc = (status: string) => {
    switch (status) {
      case 'received': return 'Order received. Awaiting kitchen confirmation...';
      case 'preparing': return 'Chef is preparing your gourmet meal...';
      case 'ready': return '🎉 Order is ready! Bringing it to your table...';
      case 'served':
      case 'completed':
        return '✨ Order served. Enjoy your meal!';
      case 'cancelled': return '❌ This order has been cancelled.';
      default: return 'Awaiting status update...';
    }
  };

  const currentStepIndex = order ? getStatusIndex(order.status) : 0;
  const progressWidth = `${(currentStepIndex / 3) * 100}%`;

  return (
    <div className={`modal-overlay ${active ? 'active' : ''}`} onClick={handleClose} style={{ zIndex: 10000 }}>
      <div className={`modal-content ${active ? 'active' : ''}`} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="close-modal-btn" onClick={handleClose}>&times;</button>
        <div className="modal-header">
          <span className="modal-title-accent">Live Status</span>
          <h2>Track Order</h2>
        </div>

        {order ? (
          <div className="orders-history" id="active-tracker-section" style={{ display: 'block' }}>
            <div className="order-status-card">
              <div className="order-card-header">
                <span>Order <span style={{ fontWeight: 700 }}>#{order.id.substring(0, 8).toUpperCase()}</span></span>
                <span className={`order-status-badge cooking ${order.status}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="order-card-body">
                <p className="order-items-list">
                  {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                </p>
                <div className="prep-timeline" style={{ position: 'relative', margin: '24px 0' }}>
                  <div className="timeline-progress-bar" style={{ width: progressWidth, transition: 'width 0.5s ease' }}></div>
                  
                  {['received', 'preparing', 'ready', 'served'].map((step, idx) => {
                    let stepClass = 'timeline-step';
                    if (idx < currentStepIndex) stepClass += ' completed';
                    else if (idx === currentStepIndex) stepClass += ' active';
                    
                    return (
                      <div key={step} className={stepClass} id={`step-${step}`}>
                        <span className="step-label" style={{ textTransform: 'capitalize' }}>{step}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="order-time-est" style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '13px', marginTop: '12px' }}>
                  {getStatusDesc(order.status)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="orders-empty-state" id="orders-empty-state" style={{ display: 'flex' }}>
            <div className="orders-empty-icon">📋</div>
            <h3>No active orders</h3>
            <p>Place an order to track its progress here in real time.</p>
            <button className="primary-btn wide-btn" onClick={handleBrowseMenu}>Browse Menu</button>
          </div>
        )}
      </div>
    </div>
  );
};
