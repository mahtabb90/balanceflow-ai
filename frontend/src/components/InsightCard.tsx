import { Sparkles, Brain, Lightbulb, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  title: string;
  badge?: string;
  type?: 'insight' | 'pattern' | 'recommendation' | 'connection' | 'reflection';
  content: string;
  reflectionPrompt?: string;
  onReflectClick?: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  pattern: Brain,
  recommendation: Lightbulb,
  connection: Activity,
  reflection: Sparkles,
  insight: Sparkles
};

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  badge = 'AI Insight',
  type = 'insight',
  content,
  reflectionPrompt,
  onReflectClick,
}) => {
  const IconComponent = ICON_MAP[type] || Sparkles;

  return (
    <div 
      className="glass-panel-glow-lavender" 
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(167, 139, 250, 0.15)',
        boxSizing: 'border-box'
      }}
    >
      {/* Background lavender glow flare */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 75%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(167, 139, 250, 0.08)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
          }}>
            <IconComponent size={18} style={{ color: 'var(--color-lavender-light)' }} />
          </div>
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            fontFamily: 'var(--font-headings)',
            color: 'var(--text-primary)',
          }}>
            {title}
          </h4>
        </div>

        <span className="badge badge-lavender" style={{ fontSize: '0.65rem' }}>
          {badge}
        </span>
      </div>

      <p style={{
        fontSize: '0.92rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap'
      }}>
        {content}
      </p>

      {reflectionPrompt && (
        <div style={{
          marginTop: '6px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(167, 139, 250, 0.03)',
          border: '1px solid rgba(167, 139, 250, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            color: 'var(--color-lavender-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em' 
          }}>
            Reflective Prompt
          </span>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
            "{reflectionPrompt}"
          </p>
          {onReflectClick && (
            <button 
              onClick={onReflectClick}
              className="btn btn-secondary" 
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '8px',
                alignSelf: 'flex-start',
                marginTop: '4px',
                backgroundColor: 'rgba(167, 139, 250, 0.05)',
                borderColor: 'rgba(167, 139, 250, 0.15)',
              }}
            >
              Log Reflection
            </button>
          )}
        </div>
      )}
    </div>
  );
};
