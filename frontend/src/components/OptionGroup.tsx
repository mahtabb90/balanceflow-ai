import React from 'react';

interface OptionGroupProps<T extends string | number> {
  options: { label: string; value: T; icon?: React.ReactNode }[];
  selectedValue: T;
  onChange: (value: T) => void;
  name: string;
}

export function OptionGroup<T extends string | number>({
  options,
  selectedValue,
  onChange,
  name,
}: OptionGroupProps<T>) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
      {options.map((option) => {
        const isChecked = selectedValue === option.value;
        return (
          <label 
            key={String(option.value)} 
            className="checkin-option"
            style={{ 
              flex: '1 1 calc(25% - 8px)',
              minWidth: '80px',
              cursor: 'pointer'
            }}
          >
            <input
              type="radio"
              name={name}
              checked={isChecked}
              onChange={() => onChange(option.value)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: 0,
                height: 0,
              }}
            />
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 6px',
                background: isChecked ? 'rgba(20, 184, 166, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: isChecked ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.08)',
                color: isChecked ? 'var(--color-teal-light)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '12px',
                transition: 'var(--transition-smooth)',
                fontSize: '0.85rem',
                fontWeight: 500,
                textAlign: 'center',
                boxShadow: isChecked ? 'var(--shadow-glow-teal)' : 'none'
              }}
              className="option-pill"
            >
              {option.icon && option.icon}
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
