import React from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  badge?: string;
  badgeType?: 'teal' | 'lavender' | 'orange' | 'green';
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  badge,
  badgeType = 'teal',
  children,
}) => {
  const getBadgeClass = () => {
    switch (badgeType) {
      case 'lavender':
        return 'badge-lavender';
      case 'orange':
        return 'badge-orange';
      case 'green':
        return 'badge-green';
      default:
        return 'badge-teal';
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            fontFamily: 'var(--font-headings)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: '4px'
          }}>
            {title}
          </h3>
          {description && (
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              {description}
            </p>
          )}
        </div>

        {badge && (
          <span className={`badge ${getBadgeClass()}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ 
        width: '100%', 
        height: '240px', 
        position: 'relative',
        marginTop: '8px'
      }}>
        {children}
      </div>
    </div>
  );
};
