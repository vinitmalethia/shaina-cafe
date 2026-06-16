import React, { useState, useEffect, useCallback, useRef } from 'react';

// Order Status type definition (matching App.tsx)
type OrderStatus = 'received' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  userId?: string | null;
}

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'tables' | 'reports' | 'settings'>('orders');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [dashboardToasts, setDashboardToasts] = useState<Array<{ id: string; message: string }>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notifiedOrderIdsRef = useRef<Set<string>>(new Set());
  const [soundReady, setSoundReady] = useState(false);

  const getAudioContext = useCallback(() => {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return null;

    const audioContext = audioContextRef.current || new AudioContextCtor();
    audioContextRef.current = audioContext;
    return audioContext;
  }, []);

  const playChime = useCallback((audioContext: AudioContext) => {
    const now = audioContext.currentTime;
    const notes = [
      { frequency: 880, start: 0, duration: 0.16 },
      { frequency: 1174.66, start: 0.18, duration: 0.24 },
      { frequency: 1567.98, start: 0.46, duration: 0.18 }
    ];

    notes.forEach(({ frequency, start, duration }) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.28, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + duration + 0.02);
    });
  }, []);

  const unlockOrderSound = useCallback(async (playPreview = false) => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;

      await audioContext.resume?.();
      const ready = audioContext.state === 'running';
      setSoundReady(ready);

      if (ready && playPreview) {
        playChime(audioContext);
      }
    } catch (error) {
      setSoundReady(false);
      console.warn('Order alert sound could not be enabled:', error);
    }
  }, [getAudioContext, playChime]);

  const playNewOrderSound = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;

      await audioContext.resume?.();
      if (audioContext.state !== 'running') {
        setSoundReady(false);
        return;
      }

      setSoundReady(true);
      playChime(audioContext);
    } catch (error) {
      console.warn('New order sound could not play:', error);
    }
  }, [getAudioContext, playChime]);

  useEffect(() => {
    const unlock = () => {
      void unlockOrderSound(false);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [unlockOrderSound]);

  // Trigger toast notifications and highlight animations for brand new orders
  useEffect(() => {
    if (orders.length === 0) return;
    
    // Check if there are orders placed within the last 15 seconds that are 'received'
    const now = new Date().getTime();
    const recentNewOrders = orders.filter(o => {
      const orderTime = new Date(o.createdAt).getTime();
      return o.status === 'received' && (now - orderTime) < 15000;
    });

    recentNewOrders.forEach(o => {
      if (!notifiedOrderIdsRef.current.has(o.id)) {
        notifiedOrderIdsRef.current.add(o.id);
        setNewOrderIds(prev => [...prev, o.id]);
        void playNewOrderSound();
        
        // Add toast
        const toastId = Math.random().toString(36).substring(2, 9);
        setDashboardToasts(prev => [
          ...prev, 
          { id: toastId, message: `🔔 New Order placed from Table ${o.tableNumber} (₹${o.totalAmount.toFixed(0)})` }
        ]);

        // Auto remove toast
        setTimeout(() => {
          setDashboardToasts(prev => prev.filter(t => t.id !== toastId));
        }, 5000);

        // Remove new highlight after 8 seconds
        setTimeout(() => {
          setNewOrderIds(prev => prev.filter(id => id !== o.id));
        }, 8000);
      }
    });
  }, [orders, playNewOrderSound]);

  // Statistics calculations
  const totalRevenueToday = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrdersCount = orders.filter(o => 
    o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const newOrdersCount = orders.filter(o => o.status === 'received').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const readyOrdersCount = orders.filter(o => o.status === 'ready').length;
  const completedOrdersCount = orders.filter(o => o.status === 'served' || o.status === 'completed').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  // Filter and search logic
  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'completed') {
        if (o.status !== 'served' && o.status !== 'completed') return false;
      } else {
        if (o.status !== statusFilter) return false;
      }
    }

    // 2. Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(query);
      const matchName = o.customerName.toLowerCase().includes(query);
      const matchTable = `table ${o.tableNumber}`.includes(query) || String(o.tableNumber) === query;
      const matchItem = o.items.some(item => item.name.toLowerCase().includes(query));
      return matchId || matchName || matchTable || matchItem;
    }

    return true;
  });

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return { bg: '#FEF3C7', color: '#D97706', label: 'New' };
      case 'preparing':
        return { bg: '#DBEAFE', color: '#2563EB', label: 'Preparing' };
      case 'ready':
        return { bg: '#D1FAE5', color: '#059669', label: 'Ready' };
      case 'served':
      case 'completed':
        return { bg: '#E2E8F0', color: '#475569', label: 'Completed' };
      case 'cancelled':
        return { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' };
      default:
        return { bg: '#F3F4F6', color: '#9CA3AF', label: status };
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const orderDate = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - orderDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
      
      return orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#FDFCFA', // Warm Cream background
      fontFamily: 'var(--font-body)',
      color: 'var(--color-secondary)'
    }}>
      
      {/* Sidebar Navigation - Fixed Desktop */}
      <aside style={{
        width: '260px',
        backgroundColor: '#2D1F17', // Deep dark espresso background
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease',
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: 'var(--shadow-lg)',
      }} className="admin-sidebar">
        
        {/* Sidebar Brand Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#C89B5B', // Warm gold accent
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-headline)',
            fontWeight: 900,
            fontSize: '18px',
            color: '#2D1F17'
          }}>
            S
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '18px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '0.5px'
            }}>
              Shaina Cafe
            </h1>
            <span style={{ fontSize: '11px', color: '#C89B5B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Admin Portal
            </span>
          </div>
        </div>

        {/* Sidebar Menu Links */}
        <nav style={{
          padding: '24px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexGrow: 1
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'orders', label: 'Orders', icon: '📋', badge: activeOrdersCount },
            { id: 'menu', label: 'Menu', icon: '🍽️' },
            { id: 'tables', label: 'Tables', icon: '🪑' },
            { id: 'reports', label: 'Reports', icon: '📈' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-full)', // Fully rounded pill shape
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(200, 155, 91, 0.15)' : 'transparent',
                  color: isActive ? '#C89B5B' : '#E8DFD3',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                className="sidebar-link"
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{ flexGrow: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#C89B5B',
                    color: '#2D1F17',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Signout */}
        <div style={{
          padding: '20px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={onSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'transparent',
              color: '#FEE2E2',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{
        flexGrow: 1,
        paddingLeft: '260px', // Offset sidebar
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }} className="admin-main-container">
        
        {/* Top Header Bar */}
        <header style={{
          height: '70px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }} className="admin-top-bar">
          
          {/* Left: Mobile Sidebar Hamburger Toggle & Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-secondary)',
                padding: '4px'
              }}
              className="sidebar-toggle-btn"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-secondary)',
              margin: 0
            }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>

          {/* Center/Right: Search, Notification Bell, User Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* Search Box in Header */}
            {activeTab === 'orders' && (
              <div style={{ position: 'relative', width: '260px' }} className="header-search-container">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#8C7B72" strokeWidth="2.5" style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search table, items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: '#F5ECE1',
                    border: 'none',
                    outline: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 16px 8px 36px',
                    fontSize: '13px',
                    width: '100%',
                    color: 'var(--color-secondary)',
                    transition: 'all 0.3s ease'
                  }}
                  className="header-search-input"
                />
              </div>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => void unlockOrderSound(true)}
              title={soundReady ? 'Order sound is enabled' : 'Tap to enable order sound'}
              aria-label={soundReady ? 'Order sound enabled' : 'Enable order sound'}
              style={{
                position: 'relative',
                cursor: 'pointer',
                border: soundReady ? '1px solid rgba(5, 150, 105, 0.35)' : '1px solid rgba(200, 155, 91, 0.35)',
                backgroundColor: soundReady ? '#D1FAE5' : '#F5ECE1',
                color: soundReady ? '#047857' : 'var(--color-secondary)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                outline: 'none'
              }}
            >
              <span style={{ fontSize: '19px', lineHeight: 1 }}>🔔</span>
              {newOrdersCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#C22A2A',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 900,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                }}>
                  {newOrdersCount}
                </span>
              )}
            </button>

            {/* Admin Profile Details */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: '20px'
            }} className="admin-profile-header">
              <img
                src="/images/default-avatar.jpg"
                alt="Admin Avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--color-primary)'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/a/default-user=s80';
                }}
              />
              <div style={{ textAlign: 'left' }} className="admin-profile-names">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-secondary)' }}>Vinit Cafe Admin</div>
                <div style={{ fontSize: '10px', color: '#8C7B72', fontWeight: 650 }}>Owner & Manager</div>
              </div>
            </div>

          </div>
        </header>

        {/* Content Wrapper */}
        <main style={{
          padding: '32px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }} className="admin-content-main">

          {activeTab !== 'orders' ? (
            /* Placeholder view for other tabs */
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '48px' }}>🛠️</span>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', margin: '16px 0 8px 0' }}>Under Construction</h3>
              <p style={{ color: '#8C7B72', fontSize: '14px', maxWidth: '380px', margin: '0 auto' }}>
                The "{activeTab}" panel is currently a mockup. Please click the **Orders** tab to manage the active table orders database in real-time.
              </p>
            </div>
          ) : (
            /* ACTIVE TAB: ORDERS */
            <>
              {/* Stat Summary Cards Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px'
              }} className="stats-row">
                
                {/* Stat 1: Active Orders */}
                <div style={{
                  background: 'linear-gradient(135deg, #2D1F17 0%, #3D2817 100%)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-md)',
                  color: '#FFFFFF',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#C89B5B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Orders</span>
                    <span style={{ fontSize: '20px' }}>📋</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>
                    {activeOrdersCount}
                  </div>
                  <div style={{ fontSize: '11px', color: '#E8DFD3', marginTop: '6px', opacity: 0.85 }}>
                    {newOrdersCount} new order{newOrdersCount === 1 ? '' : 's'} waiting acceptance
                  </div>
                </div>

                {/* Stat 2: Revenue Today */}
                <div style={{
                  background: 'linear-gradient(135deg, #2D1F17 0%, #3D2817 100%)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-md)',
                  color: '#FFFFFF',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#C89B5B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue Today</span>
                    <span style={{ fontSize: '20px' }}>💰</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>
                    ₹{totalRevenueToday.toFixed(0)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#E8DFD3', marginTop: '6px', opacity: 0.85 }}>
                    Excluding cancelled orders
                  </div>
                </div>

                {/* Stat 3: Avg Prep Time */}
                <div style={{
                  background: 'linear-gradient(135deg, #2D1F17 0%, #3D2817 100%)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-md)',
                  color: '#FFFFFF',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#C89B5B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Prep Time</span>
                    <span style={{ fontSize: '20px' }}>⏱️</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>
                    12 Mins
                  </div>
                  <div style={{ fontSize: '11px', color: '#E8DFD3', marginTop: '6px', opacity: 0.85 }}>
                    Live kitchen standard
                  </div>
                </div>

                {/* Stat 4: Live Orders status */}
                <div style={{
                  background: 'linear-gradient(135deg, #2D1F17 0%, #3D2817 100%)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-md)',
                  color: '#FFFFFF',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#C89B5B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Orders</span>
                    <div className="online-indicator">
                      <div className="pulse-dot" style={{ backgroundColor: '#C89B5B' }}></div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>
                    {preparingOrdersCount + readyOrdersCount}
                  </div>
                  <div style={{ fontSize: '11px', color: '#E8DFD3', marginTop: '6px', opacity: 0.85 }}>
                    {preparingOrdersCount} preparing • {readyOrdersCount} ready for table
                  </div>
                </div>

              </div>

              {/* Status Filter Tab Pills */}
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }} className="no-scrollbar filter-pills-row">
                {[
                  { id: 'All', label: 'All Orders', count: orders.length },
                  { id: 'received', label: 'New', count: newOrdersCount },
                  { id: 'preparing', label: 'Preparing', count: preparingOrdersCount },
                  { id: 'ready', label: 'Ready', count: readyOrdersCount },
                  { id: 'served', label: 'Completed', count: completedOrdersCount },
                  { id: 'cancelled', label: 'Cancelled', count: cancelledOrdersCount }
                ].map(tab => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      style={{
                        flexShrink: 0,
                        backgroundColor: isActive ? '#C89B5B' : '#FFFFFF',
                        border: isActive ? '1px solid #C89B5B' : '1px solid var(--color-border)',
                        color: isActive ? '#2D1F17' : 'var(--color-secondary)',
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-full)',
                        fontFamily: 'var(--font-headline)',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        backgroundColor: isActive ? 'rgba(45, 31, 23, 0.15)' : '#F5ECE1',
                        color: isActive ? '#2D1F17' : '#8C7B72',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '1.5px 6px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Data Table / List Component */}
              {filteredOrders.length === 0 ? (
                /* Empty state */
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '80px 20px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>🍽️</div>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, color: 'var(--color-secondary)', margin: '0 0 6px 0' }}>
                    No orders found
                  </h3>
                  <p style={{ color: '#8C7B72', fontSize: '13px', maxWidth: '340px', margin: '0 auto', lineHeight: '1.5' }}>
                    No orders match your filter criteria. New table orders will appear here automatically.
                  </p>
                </div>
              ) : (
                /* Orders grid / table */
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }} className="table-responsive-wrapper">
                  
                  {/* Table Layout - Hidden on mobile screens */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '13.5px'
                  }} className="desktop-orders-table">
                    
                    <thead style={{
                      backgroundColor: '#F5ECE1',
                      borderBottom: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 800,
                      color: 'var(--color-secondary-light)'
                    }}>
                      <tr>
                        <th style={{ padding: '16px 20px' }}>Order ID</th>
                        <th style={{ padding: '16px 20px' }}>Time</th>
                        <th style={{ padding: '16px 20px' }}>Customer & Table</th>
                        <th style={{ padding: '16px 20px' }}>Type</th>
                        <th style={{ padding: '16px 20px' }}>Items</th>
                        <th style={{ padding: '16px 20px', textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ padding: '16px 20px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredOrders.map(order => {
                        const badge = getStatusBadgeStyle(order.status);
                        const isNew = newOrderIds.includes(order.id);
                        const itemsSummary = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');

                        return (
                          <tr
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              borderBottom: '1px solid var(--color-border)',
                              cursor: 'pointer',
                              backgroundColor: isNew ? 'rgba(200, 155, 91, 0.08)' : '#FFFFFF',
                              animation: isNew ? 'pulse-highlight 2s infinite' : 'none',
                              transition: 'background-color 0.15s ease'
                            }}
                            className="table-order-row"
                          >
                            {/* ID */}
                            <td style={{ padding: '16px 20px', fontWeight: 800, fontFamily: 'var(--font-headline)' }}>
                              #{order.id.slice(-6).toUpperCase()}
                            </td>
                            
                            {/* Time */}
                            <td style={{ padding: '16px 20px', color: 'var(--color-secondary-light)' }}>
                              {getRelativeTime(order.createdAt)}
                            </td>

                            {/* Customer & Table */}
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ fontWeight: 700 }}>Table {order.tableNumber}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-secondary-light)' }}>
                                  {order.customerName || 'Anonymous'}
                                </span>
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  backgroundColor: order.userId ? '#C89B5B' : '#EAE6E1',
                                  color: order.userId ? '#2D1F17' : '#8C7B72',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  textTransform: 'uppercase'
                                }}>
                                  {order.userId ? 'Member' : 'Guest'}
                                </span>
                              </div>
                            </td>

                            {/* Order Type */}
                            <td style={{ padding: '16px 20px', color: 'var(--color-secondary-light)', fontWeight: 600 }}>
                              {order.customerPhone ? 'Dine In (SMS)' : 'Dine In'}
                            </td>

                            {/* Items list with tooltip */}
                            <td style={{
                              padding: '16px 20px',
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={itemsSummary}>
                              {itemsSummary}
                            </td>

                            {/* Price Total */}
                            <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-headline)' }}>
                              ₹{order.totalAmount.toFixed(0)}
                            </td>

                            {/* Status Badge */}
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                backgroundColor: badge.bg,
                                color: badge.color,
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'capitalize'
                              }}>
                                {badge.label}
                              </span>
                            </td>

                            {/* Quick Action buttons */}
                            <td style={{ padding: '16px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                {order.status === 'received' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                    style={{
                                      backgroundColor: '#2D1F17', // Espresso action
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: 'var(--radius-full)',
                                      padding: '6px 14px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      boxShadow: 'var(--shadow-sm)'
                                    }}
                                  >
                                    Accept
                                  </button>
                                )}
                                {order.status === 'preparing' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                                    style={{
                                      backgroundColor: '#C89B5B', // Gold action
                                      color: '#2D1F17',
                                      border: 'none',
                                      borderRadius: 'var(--radius-full)',
                                      padding: '6px 14px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      boxShadow: 'var(--shadow-sm)'
                                    }}
                                  >
                                    Mark Ready
                                  </button>
                                )}
                                {order.status === 'ready' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                                    style={{
                                      backgroundColor: '#6B8E62', // Sage Green action
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: 'var(--radius-full)',
                                      padding: '6px 14px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      boxShadow: 'var(--shadow-sm)'
                                    }}
                                  >
                                    Complete
                                  </button>
                                )}
                                {order.status !== 'served' && order.status !== 'completed' && order.status !== 'cancelled' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                                    style={{
                                      backgroundColor: 'transparent',
                                      color: '#DC2626',
                                      border: '1px solid #FCA5A5',
                                      borderRadius: 'var(--radius-full)',
                                      padding: '5px 12px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>

                  </table>

                  {/* Mobile Layout: Render as cards on small screens */}
                  <div className="mobile-cards-grid" style={{ display: 'none', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                    {filteredOrders.map(order => {
                      const badge = getStatusBadgeStyle(order.status);
                      const isNew = newOrderIds.includes(order.id);
                      
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            border: isNew ? '2px solid #C89B5B' : '1px solid var(--color-border)',
                            padding: '16px',
                            boxShadow: 'var(--shadow-sm)',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontFamily: 'var(--font-headline)', fontSize: '15px' }}>
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{
                              backgroundColor: badge.bg,
                              color: badge.color,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '10px',
                              fontWeight: 800,
                              textTransform: 'capitalize'
                            }}>
                              {badge.label}
                            </span>
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>Table {order.tableNumber}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-secondary-light)', marginTop: '2px' }}>
                              {order.customerName || 'Guest'} • {getRelativeTime(order.createdAt)}
                            </div>
                          </div>

                          <div style={{
                            borderTop: '1px solid var(--color-border)',
                            borderBottom: '1px solid var(--color-border)',
                            padding: '8px 0',
                            fontSize: '12.5px',
                            color: 'var(--color-secondary-light)'
                          }}>
                            {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-headline)' }}>
                              ₹{order.totalAmount.toFixed(0)}
                            </span>
                            
                            <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                              {order.status === 'received' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                  style={{
                                    backgroundColor: '#2D1F17',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '5px 12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Accept
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                                  style={{
                                    backgroundColor: '#C89B5B',
                                    color: '#2D1F17',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '5px 12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Ready
                                </button>
                              )}
                              {order.status === 'ready' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                                  style={{
                                    backgroundColor: '#6B8E62',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '5px 12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Slide-In Details Panel Overlay */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(45, 31, 23, 0.4)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fade-in 0.25s ease'
        }} onClick={() => setSelectedOrder(null)}>
          
          <div style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#FDFCFA',
            height: '100%',
            boxShadow: '-10px 0 30px rgba(45, 31, 23, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slide-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
            borderLeft: '1px solid var(--color-border)'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF'
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  Order Details
                </h3>
                <span style={{ fontSize: '12px', color: '#8C7B72', fontWeight: 650, marginTop: '2px', display: 'inline-block' }}>
                  #{selectedOrder.id.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: '#F5ECE1',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'var(--color-secondary)'
                }}
              >
                ×
              </button>
            </div>

            {/* Content Body */}
            <div style={{
              padding: '24px',
              flexGrow: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'left'
            }} className="no-scrollbar">
              
              {/* Customer summary */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#8C7B72', fontWeight: 600 }}>Table</span>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>Table {selectedOrder.tableNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#8C7B72', fontWeight: 600 }}>Customer</span>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedOrder.customerName || 'Guest'}</span>
                </div>
                {selectedOrder.customerPhone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#8C7B72', fontWeight: 600 }}>Phone</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedOrder.customerPhone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#8C7B72', fontWeight: 600 }}>Membership</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: selectedOrder.userId ? '#C89B5B' : '#EAE6E1',
                    color: selectedOrder.userId ? '#2D1F17' : '#8C7B72',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}>
                    {selectedOrder.userId ? 'MEMBER PROFILE' : 'GUEST SESSION'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#8C7B72', fontWeight: 600 }}>Placed At</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-secondary-light)' }}>
                    {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Status Update Control Section */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h4 style={{ margin: 0, fontSize: '12px', color: '#8C7B72', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Manage Order Status
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FDFCFA',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusBadgeStyle(selectedOrder.status).color
                  }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'capitalize' }}>
                    Current Status: {selectedOrder.status}
                  </span>
                </div>
                
                {/* Actions Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, 'preparing');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'preparing' } : null);
                    }}
                    disabled={selectedOrder.status !== 'received'}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: selectedOrder.status === 'received' ? '#2D1F17' : '#F5ECE1',
                      color: selectedOrder.status === 'received' ? '#FFFFFF' : '#8C7B72',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: selectedOrder.status === 'received' ? 'pointer' : 'default',
                      opacity: selectedOrder.status === 'received' ? 1 : 0.6
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, 'ready');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'ready' } : null);
                    }}
                    disabled={selectedOrder.status !== 'preparing'}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: selectedOrder.status === 'preparing' ? '#C89B5B' : '#F5ECE1',
                      color: selectedOrder.status === 'preparing' ? '#2D1F17' : '#8C7B72',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: selectedOrder.status === 'preparing' ? 'pointer' : 'default',
                      opacity: selectedOrder.status === 'preparing' ? 1 : 0.6
                    }}
                  >
                    Mark Ready
                  </button>
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, 'completed');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'completed' } : null);
                    }}
                    disabled={selectedOrder.status !== 'ready'}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: selectedOrder.status === 'ready' ? '#6B8E62' : '#F5ECE1',
                      color: selectedOrder.status === 'ready' ? '#FFFFFF' : '#8C7B72',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: selectedOrder.status === 'ready' ? 'pointer' : 'default',
                      opacity: selectedOrder.status === 'ready' ? 1 : 0.6
                    }}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, 'cancelled');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
                    }}
                    disabled={selectedOrder.status === 'served' || selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid #FCA5A5',
                      backgroundColor: 'transparent',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: (selectedOrder.status !== 'served' && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled') ? 'pointer' : 'default',
                      opacity: (selectedOrder.status !== 'served' && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled') ? 1 : 0.4
                    }}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '12px', color: '#8C7B72', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Order Items ({selectedOrder.items.reduce((acc, curr) => acc + curr.quantity, 0)})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrder.items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{item.name}</span>
                        <span style={{ fontSize: '11px', color: '#8C7B72', marginTop: '2px' }}>
                          ₹{item.price} each
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--color-secondary-light)' }}>
                          Qty: {item.quantity}
                        </span>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, fontFamily: 'var(--font-headline)' }}>
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '12px', color: '#8C7B72', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Notes / Special Instructions
                </h4>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  color: selectedOrder.notes ? 'var(--color-secondary)' : '#8C7B72',
                  lineHeight: '1.4',
                  fontStyle: selectedOrder.notes ? 'normal' : 'italic'
                }}>
                  {selectedOrder.notes || 'No special instructions provided.'}
                </div>
              </div>

            </div>

            {/* Receipt Cost details Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--color-secondary-light)' }}>
                <span>Subtotal</span>
                <span>₹{(selectedOrder.totalAmount / 1.05).toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--color-secondary-light)' }}>
                <span>GST (5%)</span>
                <span>₹{(selectedOrder.totalAmount - (selectedOrder.totalAmount / 1.05)).toFixed(0)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-secondary)',
                fontFamily: 'var(--font-headline)',
                marginTop: '4px',
                paddingTop: '8px',
                borderTop: '1px solid #F5ECE1'
              }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--color-primary-dark)' }}>₹{selectedOrder.totalAmount.toFixed(0)}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Floating Dashboard Realtime Toasts Wrapper */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000
      }}>
        {dashboardToasts.map(toast => (
          <div
            key={toast.id}
            style={{
              backgroundColor: '#2D1F17',
              color: '#FFFFFF',
              padding: '14px 20px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1.5px solid #C89B5B',
              animation: 'fade-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <span>✨</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
};
