import React from 'react';

interface FormSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  glowColor?: 'teal' | 'lavender';
}

export const FormSlider: React.FC<FormSliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  minLabel = 'Low',
  maxLabel = 'High',
  glowColor = 'teal',
}) => {
  const activeColor = glowColor === 'lavender' ? 'var(--color-lavender)' : 'var(--color-teal)';
  const activeLightColor = glowColor === 'lavender' ? 'var(--color-lavender-light)' : 'var(--color-teal-light)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div className="flex-between" style={{ width: '100%' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </label>
        <span 
          style={{ 
            fontSize: '0.9rem', 
            color: activeLightColor, 
            fontWeight: 700,
            fontFamily: 'var(--font-headings)',
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: glowColor === 'lavender' ? 'var(--shadow-glow-lavender)' : 'var(--shadow-glow-teal)'
          }}
        >
          {value}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: activeColor,
          background: 'rgba(255, 255, 255, 0.06)',
          height: '6px',
          borderRadius: '3px',
          outline: 'none',
          cursor: 'pointer',
          transition: 'var(--transition-fast)'
        }}
      />

      <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};
