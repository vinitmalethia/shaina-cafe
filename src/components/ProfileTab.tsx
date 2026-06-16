import React, { useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface OrderHistoryItem {
  id: string;
  items: Array<{ name: string; quantity: number }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

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

interface ProfileTabProps {
  guestName: string;
  guestTable: number;
  onUpdateGuest: (name: string, table: number) => void;
  googleUser: any | null;
  loyaltyPoints: number;
  ordersHistory: OrderHistoryItem[];
  menuItems: MenuItem[];
  onOpenProductDetails: (item: MenuItem) => void;
  onSignOut: () => void;
  activeOrder: OrderHistoryItem | null;
  onAddToCart: (itemId: string) => void;
  setActiveTab: (tab: 'discover' | 'order' | 'rewards' | 'profile') => void;
  onOpenAdmin: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  guestName,
  guestTable,
  onUpdateGuest,
  googleUser,
  loyaltyPoints,
  ordersHistory,
  menuItems,
  onOpenProductDetails,
  onSignOut,
  activeOrder,
  onAddToCart,
  setActiveTab,
  onOpenAdmin
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(guestName || '');
  const [editTable, setEditTable] = useState(String(guestTable));
  const [editError, setEditError] = useState('');

  // Email login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const ensureUserProfile = async (user: any) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || guestName || 'Loyal Customer',
        email: user.email,
        photoURL: user.photoURL || null,
        points: 0,
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await ensureUserProfile(result.user);
        }
      })
      .catch((error: any) => {
        console.error('Google redirect authentication error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          setAuthError('Google login needs this site added in Firebase authorized domains.');
        } else {
          setAuthError('Google sign-in could not finish. Please try again.');
        }
      });
  }, []);

  // Handle email login & signup
  const handleEmailLogin = async () => {
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Email and password are required.');
      return;
    }
    setLoading(true);

    try {
      // Check if it's the admin credentials
      if (email.trim() === 'vinit@gmail.com' && password.trim() === '1234567890') {
        await signInWithEmailAndPassword(auth, 'vinit@gmail.com', '1234567890');
        setLoading(false);
        onOpenAdmin();
        return;
      }

      // Normal customer login
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      } catch (signInErr: any) {
        // If user not found, sign them up automatically
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-email') {
          userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        } else {
          throw signInErr;
        }
      }

      await ensureUserProfile(userCredential.user);
    } catch (error: any) {
      console.error('Email authentication error:', error);
      if (error.code === 'auth/wrong-password') {
        setAuthError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError('Authentication failed. Check your credentials or internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user);
    } catch (error: any) {
      console.error('Google authentication error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError('Google login needs this site added in Firebase authorized domains.');
      } else if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        setAuthError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct Admin Login Button Handler
  const handleAdminDirectLogin = async () => {
    setAuthError('');
    onOpenAdmin();
  };


  const handleSaveDetails = () => {
    setEditError('');
    const nameVal = editName.trim();
    const tableVal = editTable.trim();

    if (!nameVal) {
      setEditError('Name is required.');
      return;
    }
    if (!tableVal) {
      setEditError('Table number is required.');
      return;
    }
    const tableNum = Number(tableVal);
    if (isNaN(tableNum) || tableNum <= 0) {
      setEditError('Table number must be a positive number.');
      return;
    }

    onUpdateGuest(nameVal, tableNum);
    setIsEditing(false);
  };

  // Determine membership tier based on points
  let memberTier = 'GUEST MEMBER';
  let tierColor = '#8C7B72';
  if (googleUser) {
    if (loyaltyPoints >= 500) {
      memberTier = 'GOLD MEMBER';
      tierColor = '#C89B5B';
    } else if (loyaltyPoints >= 200) {
      memberTier = 'SILVER MEMBER';
      tierColor = '#708090';
    } else {
      memberTier = 'BRONZE MEMBER';
      tierColor = '#CD7F32';
    }
  }

  // Find or create favorite items matching the user request
  const favNames = ['Biscoff Latte', 'Paneer Paprika Pizza', 'Loaded Fries'];
  const favoriteItems = favNames.map(name => {
    const found = menuItems.find(item => item.name.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
    // Fallback object if not in menu yet
    return {
      id: `fav-fallback-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name: name,
      price: name.includes('Pizza') ? 259 : name.includes('Latte') ? 199 : 119,
      image: name.includes('Pizza') ? '/images/menu-items/pizza.jpg' : name.includes('Latte') ? '/images/menu-items/coffee.jpg' : '/images/menu-items/sandwich.jpg',
      category: name.includes('Pizza') ? 'Pizza' : name.includes('Latte') ? 'Hot Coffee' : 'Fries',
      description: 'Frequently ordered item.'
    } as MenuItem;
  });

  // Latest order for Section 2
  const latestOrder = activeOrder || ordersHistory[0];

  return (
    <div className="profile-tab-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '0 8px 30px' }}>
      
      {/* SECTION 1: USER CARD */}
      <div style={{
        background: 'linear-gradient(135deg, #3A302A 0%, #221B18 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circle */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(200, 155, 91, 0.1)',
          pointerEvents: 'none'
        }} />

        {/* Profile Image */}
        <div style={{
          position: 'relative',
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          padding: '2px',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #FFFFFF 100%)',
          flexShrink: 0
        }}>
          <img 
            src={googleUser?.photoURL || '/images/default-avatar.jpg'} 
            alt="Profile Avatar" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #221B18' }}
          />
        </div>

        {/* User details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            {googleUser ? googleUser.displayName : (guestName || 'Guest Customer')}
          </h2>
          
          {googleUser ? (
            <span style={{ fontSize: '11px', color: '#ECE0D1', opacity: 0.85 }}>
              {googleUser.email}
            </span>
          ) : (
            <span style={{ fontSize: '12px', color: '#ECE0D1', opacity: 0.85, fontWeight: 600 }}>
              Table Number: {guestTable}
            </span>
          )}

          <div style={{ display: 'flex', marginTop: '4px' }}>
            <span style={{ 
              fontFamily: 'var(--font-headline)', 
              fontSize: '9px', 
              fontWeight: 800, 
              color: '#FFFFFF', 
              backgroundColor: tierColor,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.8px', 
              textTransform: 'uppercase' 
            }}>
              {memberTier}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: CURRENT ORDER STATUS */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'left'
      }}>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, color: 'var(--color-secondary)', margin: '0 0 14px 0' }}>
          Current Order Status
        </h3>

        {latestOrder ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-secondary-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latest Order ID</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-secondary)', fontFamily: 'var(--font-headline)', marginTop: '2px' }}>
                  #{latestOrder.id.slice(-6).toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-secondary-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Total</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-headline)', marginTop: '2px' }}>
                  ₹{latestOrder.totalAmount.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              backgroundColor: '#FDFCFA', 
              padding: '12px', 
              borderRadius: '10px',
              border: '1px solid #F5ECE1',
              marginTop: '4px'
            }}>
              {/* Pulsing indicator */}
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: latestOrder.status === 'served' ? 'var(--color-tertiary)' : 'var(--color-primary)',
                animation: latestOrder.status !== 'served' ? 'pulse 1.8s infinite' : 'none'
              }} />
              <div style={{ flexGrow: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'capitalize' }}>
                  Status: {latestOrder.status}
                </span>
              </div>
              {latestOrder.status !== 'served' && (
                <button 
                  onClick={() => {
                    const trackBtn = document.querySelector('[aria-label="View Cart"]');
                    if (trackBtn) {
                      // Click active order modal trigger if any
                    }
                    // Trigger tracking overlay by dispatching custom event or clicking active tracking badge
                    const event = new CustomEvent('open-tracker', { detail: latestOrder.id });
                    window.dispatchEvent(event);
                    // Trigger tracking in App state
                    const element = document.getElementById('step-' + latestOrder.status);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-primary)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    color: 'var(--color-primary-dark)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Track Live
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', textAlign: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-secondary-light)' }}>
              No current orders placed from this device.
            </span>
          </div>
        )}
      </div>

      {/* SECTION 3: REWARDS SUMMARY */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'left'
      }}>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, color: 'var(--color-secondary)', margin: '0 0 12px 0' }}>
          Loyalty Rewards
        </h3>

        {googleUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-secondary-light)', fontWeight: 500 }}>Current Balance</span>
              <span style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, color: '#785329' }}>
                {loyaltyPoints} Points
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ height: '8px', backgroundColor: '#EFE8DF', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min((loyaltyPoints / 500) * 100, 100)}%`, 
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', 
                  borderRadius: 'var(--radius-full)' 
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-secondary-light)', fontWeight: 600 }}>
                <span>0 pts</span>
                <span>Progress: {loyaltyPoints} / 500</span>
                <span>500 pts</span>
              </div>
            </div>

            {/* Rewards Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #F5ECE1', paddingTop: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-secondary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reward Preview</span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                <div style={{ flexShrink: 0, padding: '8px 12px', borderRadius: '10px', border: '1px solid #E8DFD3', backgroundColor: loyaltyPoints >= 100 ? 'var(--color-tertiary-light)' : '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎟️</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: loyaltyPoints >= 100 ? 'var(--color-tertiary)' : 'var(--color-secondary)' }}>Discount Coupons</span>
                </div>
                <div style={{ flexShrink: 0, padding: '8px 12px', borderRadius: '10px', border: '1px solid #E8DFD3', backgroundColor: loyaltyPoints >= 150 ? 'var(--color-tertiary-light)' : '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>☕</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: loyaltyPoints >= 150 ? 'var(--color-tertiary)' : 'var(--color-secondary)' }}>Free Coffee</span>
                </div>
                <div style={{ flexShrink: 0, padding: '8px 12px', borderRadius: '10px', border: '1px solid #E8DFD3', backgroundColor: loyaltyPoints >= 250 ? 'var(--color-tertiary-light)' : '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🍟</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: loyaltyPoints >= 250 ? 'var(--color-tertiary)' : 'var(--color-secondary)' }}>Free Fries</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-light)', lineHeight: '1.5', margin: '0 0 4px 0' }}>
              Sign in with your email to earn points, unlock rewards, and save order history.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FDFCFA',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--color-secondary)'
                }}
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FDFCFA',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--color-secondary)'
                }}
              />
            </div>
            {authError && (
              <span style={{ color: 'var(--color-danger)', fontSize: '11px', fontWeight: 600 }}>
                ⚠️ {authError}
              </span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'conic-gradient(from -45deg, #4285F4 0 25%, #34A853 0 50%, #FBBC05 0 75%, #EA4335 0 100%)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 900,
                  lineHeight: 1
                }}>
                  G
                </span>
                Continue with Google
              </button>
              <button
                onClick={handleEmailLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#785329',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(120, 83, 41, 0.1)'
                }}
              >
                {loading ? 'Processing...' : 'Sign In / Sign Up'}
              </button>
              <button
                onClick={handleAdminDirectLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#221B18',
                  color: '#ECE0D1',
                  border: '1px solid #785329',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>🛠️</span> Admin Portal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: ORDER HISTORY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, color: 'var(--color-secondary)', margin: 0, textAlign: 'left' }}>
          Order History
        </h3>

        {ordersHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ordersHistory.map(o => {
              const formattedDate = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const itemsList = o.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
              
              return (
                <div 
                  key={o.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: '#FFFFFF', 
                    padding: '14px 16px', 
                    borderRadius: '16px', 
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Left Date Circle */}
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: '#F5ECE1', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '12px',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#785329', textTransform: 'uppercase' }}>
                      {formattedDate.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#785329', lineHeight: 1 }}>
                      {formattedDate.split(' ')[1]}
                    </span>
                  </div>

                  {/* Center Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, textAlign: 'left', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-secondary)' }}>
                        Order #{o.id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-headline)' }}>
                        ₹{o.totalAmount.toFixed(0)}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-secondary-light)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {itemsList}
                    </span>
                    <div style={{ display: 'flex', marginTop: '4px' }}>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        backgroundColor: o.status === 'served' ? 'var(--color-tertiary-light)' : 'var(--color-primary-light)',
                        color: o.status === 'served' ? 'var(--color-tertiary)' : 'var(--color-primary-dark)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '16px', 
            padding: '24px', 
            border: '1px solid var(--color-border)',
            textAlign: 'center',
            color: 'var(--color-secondary-light)',
            fontSize: '13px'
          }}>
            No order history available.
          </div>
        )}
      </div>

      {/* SECTION 5: FAVORITE ITEMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, color: 'var(--color-secondary)', margin: 0, textAlign: 'left' }}>
          Favorite Items
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto', 
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }} className="no-scrollbar">
          {favoriteItems.map(item => (
            <div 
              key={item.id} 
              style={{ 
                flexShrink: 0,
                width: '130px', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '16px', 
                padding: '12px', 
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Product Picture inside circle */}
              <div 
                onClick={() => onOpenProductDetails(item)}
                style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-primary-light)', marginBottom: '8px', cursor: 'pointer' }}
              >
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <span 
                onClick={() => onOpenProductDetails(item)}
                style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary)', textAlign: 'center', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', lineHeight: '1.2' }}
              >
                {item.name}
              </span>

              <span style={{ color: 'var(--color-primary-dark)', fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-headline)', marginTop: '4px', marginBottom: '8px' }}>
                ₹{item.price}
              </span>

              {/* Quick Re-order Button */}
              <button
                onClick={() => onAddToCart(item.id)}
                style={{
                  width: '100%',
                  backgroundColor: '#785329',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 0',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(120,83,41,0.1)'
                }}
              >
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Re-order
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: PROFILE SETTINGS */}
      <div style={{ 
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        padding: '8px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'left'
      }}>
        {/* Edit Name & Table number */}
        <button 
          onClick={() => setIsEditing(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'none', 
            border: 'none', 
            padding: '14px 16px', 
            width: '100%', 
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'var(--color-secondary)',
            borderBottom: googleUser ? '1px solid var(--color-border)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: 'var(--color-secondary-light)' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              {googleUser ? 'Edit Profile Details' : 'Edit Name & Table'}
            </span>
          </div>
          <div style={{ color: 'var(--color-primary-dark)' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* Logged in options */}
        {googleUser && (
          <>
            {/* View Rewards (Takes to rewards page) */}
            <button 
              onClick={() => setActiveTab('rewards')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'none', 
                border: 'none', 
                padding: '14px 16px', 
                width: '100%', 
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: 'var(--color-secondary)',
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--color-secondary-light)' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
                  </svg>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>View Loyalty Rewards</span>
              </div>
              <div style={{ color: 'var(--color-primary-dark)' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            {/* View Full Order History */}
            <button 
              onClick={() => {
                const element = document.querySelector('h3[style*="Order History"]');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'none', 
                border: 'none', 
                padding: '14px 16px', 
                width: '100%', 
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: 'var(--color-secondary)',
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--color-secondary-light)' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>View Full Order History</span>
              </div>
              <div style={{ color: 'var(--color-primary-dark)' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </>
        )}

        {/* Sign Out / Logout */}
        <button 
          onClick={onSignOut}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'none', 
            border: 'none', 
            padding: '14px 16px', 
            width: '100%', 
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'var(--color-danger)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              {googleUser ? 'Logout Account' : 'Reset Guest Session'}
            </span>
          </div>
        </button>
      </div>

      {/* Editing Details Inline Modal */}
      {isEditing && (
        <div style={{ 
          position: 'fixed',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(58, 48, 42, 0.6)', 
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '20px', 
          zIndex: 11000 
        }}>
          <div style={{ 
            backgroundColor: '#FDFCFA', 
            borderRadius: '24px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '340px', 
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(120, 83, 41, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, color: '#785329', margin: 0, textAlign: 'center' }}>
              Edit Profile Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#785329' }}>Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#785329' }}>Table Number</label>
                <input 
                  type="text" 
                  value={editTable} 
                  onChange={(e) => setEditTable(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>
            </div>

            {editError && <span style={{ color: 'var(--color-danger)', fontSize: '12px', textAlign: 'center' }}>⚠️ {editError}</span>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleSaveDetails}
                style={{ flex: 1, backgroundColor: '#785329', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save
              </button>
              <button 
                onClick={() => {
                  setEditName(guestName || '');
                  setEditTable(String(guestTable));
                  setIsEditing(false);
                }}
                style={{ flex: 1, backgroundColor: 'transparent', color: 'var(--color-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
