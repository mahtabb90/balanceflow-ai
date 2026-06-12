import { Play, Clock, Sparkles } from 'lucide-react';

export interface Practice {
  id: string;
  title: string;
  type: 'Yoga' | 'Meditation' | 'Breathing';
  duration: number; // in minutes
  level: 'Beginner' | 'Intermediate' | 'All Levels';
  goal: string;
  description: string;
  gradientClass: string;
}

interface PracticeCardProps {
  practice: Practice;
  onStart: (practice: Practice) => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ practice, onStart }) => {
  const getBadgeColorClass = (type: string) => {
    switch (type) {
      case 'Yoga':
        return 'badge-teal';
      case 'Meditation':
        return 'badge-lavender';
      case 'Breathing':
        return 'badge-orange';
      default:
        return 'badge-teal';
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '450px',
        height: 'auto',
        border: '1px solid var(--panel-border)',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Visual Header using gradients */}
      <div 
        className={practice.gradientClass} 
        style={{
          height: '130px',
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          boxSizing: 'border-box',
          borderTopLeftRadius: 'var(--border-radius-md)',
          borderTopRightRadius: 'var(--border-radius-md)',
          overflow: 'hidden'
        }}
      >
        {/* Glow overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(6, 10, 18, 0.8) 100%)',
          zIndex: 1
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <span className={`badge ${getBadgeColorClass(practice.type)}`}>
            {practice.type}
          </span>
          <span className="badge" style={{ backgroundColor: 'rgba(6, 10, 18, 0.6)', color: 'var(--color-beige-accent)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {practice.level}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-beige-accent)', fontSize: '0.8rem', fontWeight: 600, zIndex: 2 }}>
          <Clock size={14} style={{ color: 'var(--color-teal-light)' }} />
          <span>{practice.duration} min</span>
        </div>
      </div>

      {/* Content Body */}
      <div style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '16px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{
            fontSize: '1.25rem',
            fontFamily: 'var(--font-headings)',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: '1.3'
          }}>
            {practice.title}
          </h4>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.45'
          }}>
            {practice.description}
          </p>
        </div>

        {/* Goal Indicator */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '10px 14px', 
          borderRadius: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <Sparkles size={14} style={{ color: 'var(--color-lavender-light)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Goal: {practice.goal}
          </span>
        </div>

        {/* Start Button */}
        <button 
          onClick={() => onStart(practice)}
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.88rem',
            padding: '12px',
            borderRadius: '12px',
            gap: '8px',
            fontWeight: 600,
          }}
        >
          <Play size={14} fill="currentColor" />
          <span>Start Practice</span>
        </button>
      </div>
    </div>
  );
};
