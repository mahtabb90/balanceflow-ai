import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value?: string | number;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'teal' | 'lavender' | 'orange' | 'green' | 'default';
  children?: React.ReactNode;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  children,
  badge,
}) => {
  const getGlowClass = () => {
    switch (variant) {
      case 'teal':
        return 'glass-panel-glow-teal';
      case 'lavender':
        return 'glass-panel-glow-lavender';
      default:
        return 'glass-panel';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'teal':
        return 'var(--color-teal-light)';
      case 'lavender':
        return 'var(--color-lavender-light)';
      case 'orange':
        return 'var(--color-orange-soft)';
      case 'green':
        return 'var(--color-green-soft)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getBadgeClass = () => {
    switch (variant) {
      case 'teal':
        return 'badge-teal';
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
      className={getGlowClass()} 
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: variant === 'teal' 
          ? 'radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, transparent 70%)'
          : variant === 'lavender'
          ? 'radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </h3>
        
        {Icon && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <Icon size={18} style={{ color: getIconColor() }} />
          </div>
        )}
      </div>

      {value !== undefined && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          <span style={{
            fontSize: '2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-headings)',
            color: 'var(--text-primary)',
            lineHeight: '1.2'
          }}>
            {value}
          </span>
          {badge && (
            <span className={`badge ${getBadgeClass()}`} style={{ fontSize: '0.65rem' }}>
              {badge}
            </span>
          )}
        </div>
      )}

      {subtext && (
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}>
          {subtext}
        </p>
      )}

      {children && (
        <div style={{ marginTop: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      )}
    </div>
  );
};
