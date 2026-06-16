import React from 'react';

interface RewardItem {
  id: string;
  name: string;
  pointsRequired: number;
  icon: string;
}

const AVAILABLE_REWARDS: RewardItem[] = [
  { id: 'reward-10-off', name: '10% Discount Coupon', pointsRequired: 100, icon: '🎟️' },
  { id: 'reward-coffee', name: 'Free Specialty Coffee', pointsRequired: 150, icon: '☕' },
  { id: 'reward-fries', name: 'Free Loaded Fries', pointsRequired: 250, icon: '🍟' },
  { id: 'reward-pizza', name: 'Free Margherita Pizza', pointsRequired: 400, icon: '🍕' }
];

interface RewardsTabProps {
  googleUser: any | null;
  loyaltyPoints: number;
  onRedeemReward: (points: number, rewardName: string) => void;
  onLogin: () => void;
  rewardsList?: RewardItem[];
}

export const RewardsTab: React.FC<RewardsTabProps> = ({
  googleUser,
  loyaltyPoints,
  onRedeemReward,
  onLogin,
  rewardsList
}) => {
  if (!googleUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px 20px', gap: '20px', minHeight: '60vh' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: '#F5ECE1', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#785329',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '22px', fontWeight: 800, color: 'var(--color-secondary)' }}>
            Rewards Locked
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-light)', lineHeight: '1.5', maxWidth: '300px' }}>
            Sign in with Google to earn points, unlock exclusive café rewards, and track your loyalty progress.
          </p>
        </div>

        <button 
          onClick={onLogin}
          style={{ 
            width: '100%', 
            maxWidth: '280px',
            backgroundColor: '#785329', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: 'var(--radius-md)', 
            padding: '14px', 
            fontFamily: 'var(--font-headline)', 
            fontSize: '14px', 
            fontWeight: 700, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            boxShadow: '0 4px 12px rgba(120, 83, 41, 0.15)'
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.706 0 3.277.61 4.5 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.24-4.11 10.24-10.24 0-.621-.082-1.216-.2-1.785H12.24z"/>
          </svg>
          Sign In with Google
        </button>
      </div>
    );
  }

  // Group rewards into Unlocked and Locked
  const rewardsCatalog = rewardsList && rewardsList.length > 0 ? rewardsList : AVAILABLE_REWARDS;
  const unlockedRewards = rewardsCatalog.filter(r => loyaltyPoints >= r.pointsRequired);
  const lockedRewards = rewardsCatalog.filter(r => loyaltyPoints < r.pointsRequired);

  // Next milestone points threshold
  const milestonePoints = 500;
  const progressPercent = Math.min((loyaltyPoints / milestonePoints) * 100, 100);

  const renderRewardCard = (reward: RewardItem, isUnlocked: boolean) => (
    <div 
      key={reward.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '14px 16px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Icon Circle */}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        backgroundColor: isUnlocked ? 'var(--color-tertiary-light)' : '#F5ECE1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        marginRight: '12px'
      }}>
        {reward.icon}
      </div>

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, textAlign: 'left' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-secondary)' }}>
          {reward.name}
        </span>
        <span style={{ fontSize: '12px', color: isUnlocked ? 'var(--color-tertiary)' : 'var(--color-secondary-light)', fontWeight: 600, marginTop: '2px' }}>
          {reward.pointsRequired} Points Required
        </span>
      </div>

      {/* Redeem Button */}
      <button
        onClick={() => onRedeemReward(reward.pointsRequired, reward.name)}
        disabled={!isUnlocked}
        style={{
          backgroundColor: isUnlocked ? '#785329' : '#E8E2D9',
          color: isUnlocked ? '#FFFFFF' : '#A6978C',
          border: 'none',
          borderRadius: '20px',
          padding: '8px 16px',
          fontFamily: 'var(--font-headline)',
          fontSize: '12px',
          fontWeight: 700,
          cursor: isUnlocked ? 'pointer' : 'not-allowed',
          boxShadow: isUnlocked ? '0 2px 6px rgba(120,83,41,0.15)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {isUnlocked ? 'Redeem' : 'Locked'}
      </button>
    </div>
  );

  return (
    <div className="rewards-tab-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '0 8px 20px' }}>
      
      {/* Loyalty Progress Tracker */}
      <div className="rewards-progress-card" style={{ padding: '24px', borderRadius: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontFamily: 'var(--font-headline)', fontSize: '14px', fontWeight: 700, color: 'var(--color-secondary-light)' }}>
            Your Balance
          </span>
          <span style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, color: '#785329' }}>
            {loyaltyPoints} Points
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress-track" style={{ height: '10px', backgroundColor: '#efe8df', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '14px' }}>
          <div className="progress-bar" style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', borderRadius: 'var(--radius-full)' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-secondary-light)', fontWeight: 500 }}>
          <span>0 pts</span>
          <span style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
            {progressPercent >= 100 ? "Milestone Reached! 🎉" : `${milestonePoints - loyaltyPoints} pts to max level`}
          </span>
          <span>{milestonePoints} pts</span>
        </div>
      </div>

      {/* Unlocked Rewards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, color: 'var(--color-secondary)', margin: 0, textAlign: 'left' }}>
          Unlocked Rewards
        </h3>
        {unlockedRewards.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {unlockedRewards.map(r => renderRewardCard(r, true))}
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: '16px', border: '1px dashed var(--color-border)', color: 'var(--color-secondary-light)', fontSize: '12px', textAlign: 'center' }}>
            Earn more points to unlock your first reward! ☕
          </div>
        )}
      </div>

      {/* Locked Rewards */}
      {lockedRewards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, color: 'var(--color-secondary)', margin: 0, textAlign: 'left' }}>
            Locked Rewards
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lockedRewards.map(r => renderRewardCard(r, false))}
          </div>
        </div>
      )}

    </div>
  );
};
