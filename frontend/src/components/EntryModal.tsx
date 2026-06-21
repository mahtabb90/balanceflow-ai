import React, { useState } from 'react';
import { OptionGroup } from './OptionGroup';
import { FormSlider } from './FormSlider';
import type { WellnessEntry } from '../types/wellness';
import { X, Save, Clock, Smile, Activity, Compass, Info } from 'lucide-react';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WellnessEntry, 'id' | 'date' | 'day'>) => void;
  prefilledValues: Partial<WellnessEntry> | null;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  prefilledValues,
}) => {
  // Local Form State
  const [type, setType] = useState<'Yoga' | 'Meditation' | 'Breathing'>(prefilledValues?.type || 'Yoga');
  const [title, setTitle] = useState(prefilledValues?.title || '');
  const [duration, setDuration] = useState(prefilledValues?.duration || 15);
  const [intensity, setIntensity] = useState<'Gentle' | 'Moderate' | 'Strong'>(prefilledValues?.intensity || 'Gentle');
  
  const [moodBefore, setMoodBefore] = useState<'Tired' | 'Calm' | 'Happy' | 'Stressed'>(prefilledValues?.moodBefore || 'Calm');
  const [moodAfter, setMoodAfter] = useState<'Tired' | 'Calm' | 'Happy' | 'Stressed'>(prefilledValues?.moodAfter || 'Calm');
  
  const [energyBefore, setEnergyBefore] = useState(prefilledValues?.energyBefore ?? 5);
  const [energyAfter, setEnergyAfter] = useState(prefilledValues?.energyAfter ?? 6);
  
  const [stressBefore, setStressBefore] = useState(prefilledValues?.stressBefore ?? 5);
  const [stressAfter, setStressAfter] = useState(prefilledValues?.stressAfter ?? 3);
  
  const [sleepQuality, setSleepQuality] = useState(prefilledValues?.sleepQuality ?? 7);
  const [reflection, setReflection] = useState(prefilledValues?.reflection || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      type,
      title: title.trim(),
      duration,
      intensity,
      moodBefore,
      moodAfter,
      energyBefore,
      energyAfter,
      stressBefore,
      stressAfter,
      sleepQuality,
      reflection: reflection.trim(),
    });
  };

  const typeOptions: { label: string; value: 'Yoga' | 'Meditation' | 'Breathing'; icon: React.ReactNode }[] = [
    { label: 'Yoga Flow', value: 'Yoga', icon: <Compass size={16} /> },
    { label: 'Meditation', value: 'Meditation', icon: <Smile size={16} /> },
    { label: 'Breathing Reset', value: 'Breathing', icon: <Activity size={16} /> },
  ];

  const intensityOptions: { label: string; value: 'Gentle' | 'Moderate' | 'Strong' }[] = [
    { label: 'Gentle', value: 'Gentle' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Strong', value: 'Strong' },
  ];

  const moodOptions: { label: string; value: 'Tired' | 'Calm' | 'Happy' | 'Stressed' }[] = [
    { label: 'Tired', value: 'Tired' },
    { label: 'Calm', value: 'Calm' },
    { label: 'Happy', value: 'Happy' },
    { label: 'Stressed', value: 'Stressed' },
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6, 10, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="glass-panel" 
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          scrollbarWidth: 'thin'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        <div>
          <span className="badge badge-teal" style={{ marginBottom: '6px' }}>Wellness Log</span>
          <h3 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'var(--font-headings)' }}>
            Log Practice Session
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Record details of your yoga, meditation or breathing to observe recovery rhythms.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Practice Type Selection */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Practice Category
            </label>
            <OptionGroup
              options={typeOptions}
              selectedValue={type}
              onChange={setType}
              name="practice-type"
            />
          </div>

          {/* Title & Duration */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '220px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Practice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Stretch, Calm Breath Reset..."
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Duration (min)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 34px 12px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <Clock size={16} style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          {/* Intensity Selection */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Session Intensity
            </label>
            <OptionGroup
              options={intensityOptions}
              selectedValue={intensity}
              onChange={setIntensity}
              name="practice-intensity"
            />
          </div>

          {/* Mood Before vs After */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Mood Before
              </label>
              <OptionGroup
                options={moodOptions}
                selectedValue={moodBefore}
                onChange={setMoodBefore}
                name="mood-before"
              />
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Mood After
              </label>
              <OptionGroup
                options={moodOptions}
                selectedValue={moodAfter}
                onChange={setMoodAfter}
                name="mood-after"
              />
            </div>
          </div>

          {/* Energy Before & Energy After Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
            <FormSlider
              label="Energy Before"
              value={energyBefore}
              onChange={setEnergyBefore}
              minLabel="Tired"
              maxLabel="High Energy"
              glowColor="teal"
            />
            <FormSlider
              label="Energy After"
              value={energyAfter}
              onChange={setEnergyAfter}
              minLabel="Tired"
              maxLabel="High Energy"
              glowColor="teal"
            />
          </div>

          {/* Stress Before & Stress After Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
            <FormSlider
              label="Stress Before"
              value={stressBefore}
              onChange={setStressBefore}
              minLabel="Calm"
              maxLabel="Tense"
              glowColor="lavender"
            />
            <FormSlider
              label="Stress After"
              value={stressAfter}
              onChange={setStressAfter}
              minLabel="Calm"
              maxLabel="Tense"
              glowColor="lavender"
            />
          </div>

          {/* Sleep Quality Slider */}
          <FormSlider
            label="Sleep Quality (prior night)"
            value={sleepQuality}
            onChange={setSleepQuality}
            minLabel="Poor Recovery"
            maxLabel="Deep Rest"
            glowColor="teal"
          />

          {/* Reflection textarea */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Personal Reflection
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How does your body feel? What thoughts did you observe during session?"
              style={{
                width: '100%',
                height: '80px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Timestamp Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Info size={14} />
            <span>Session timestamp will be recorded as: {new Date().toLocaleString()}</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
            >
              <Save size={16} />
              <span>Save Entry</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
