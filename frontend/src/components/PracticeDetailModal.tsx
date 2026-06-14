import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Clock, 
  Check, 
  Pause, 
  ArrowLeft, 
  Compass, 
  Heart,
  Volume2,
  VolumeX,
  FastForward
} from 'lucide-react';
import type { Practice } from './PracticeCard';

interface PracticeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  practice: Practice | null;
  onCompleteAndLog: (practice: Practice) => void;
}

type ViewMode = 'detail' | 'active' | 'complete';
type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

const STEPS_BY_TYPE: Record<'Yoga' | 'Meditation' | 'Breathing', { name: string; instruction: string }[]> = {
  Yoga: [
    { name: 'Prepare your space', instruction: 'Find a quiet, clear area to move. Stand or sit comfortably.' },
    { name: 'Move gently', instruction: 'Start slowly warming up your body. Flow through gentle neck circles and shoulder rolls.' },
    { name: 'Breathe with awareness', instruction: 'Coordinate your movements with steady breathing. Inhale as you lift, exhale as you fold.' },
    { name: 'Slow down', instruction: 'Gently lower your body. Allow your muscles to relax and let your breath settle into a natural pace.' },
    { name: 'Reflect', instruction: 'Come to a still position. Rest silently and notice the physical release and stability.' }
  ],
  Meditation: [
    { name: 'Sit comfortably', instruction: 'Find an easy seated posture. Keep your spine tall yet relaxed.' },
    { name: 'Notice your breath', instruction: 'Shift your focus to the inflow and outflow of your breath. Feel the natural rise and fall of your chest.' },
    { name: 'Relax your shoulders', instruction: 'Let go of any physical tightness in your upper body. Soften your jaw.' },
    { name: 'Return gently', instruction: 'If your mind wanders, gently guide your focus back to the sensation of breathing.' },
    { name: 'Reflect', instruction: 'Allow your awareness to expand. Take a quiet moment to observe your state of mind.' }
  ],
  Breathing: [
    { name: 'Inhale slowly', instruction: 'Draw breath deep into your belly through your nose, letting your lungs expand gently (4 seconds).' },
    { name: 'Hold softly', instruction: 'Pause at the top of your breath. Settle into the calm space of stillness (4 seconds).' },
    { name: 'Exhale gently', instruction: 'Release the breath slowly through your mouth, letting go of tension (4 seconds).' },
    { name: 'Repeat', instruction: 'Establish a steady, comforting rhythm. Flow smoothly from one breath cycle to the next.' },
    { name: 'Notice calm', instruction: 'Let your breath return to its normal rhythm. Feel the steady centering effect.' }
  ]
};

export const PracticeDetailModal: React.FC<PracticeDetailModalProps> = ({
  isOpen,
  onClose,
  practice,
  onCompleteAndLog,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(practice ? practice.duration * 60 : 0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  
  // Breathing animation states
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);

  const timerRef = useRef<number | null>(null);
  const breathTimerRef = useRef<number | null>(null);

  const handleSessionFinished = () => {
    setIsActive(false);
    setViewMode('complete');
  };

  // Main countdown timer effect
  useEffect(() => {
    if (isActive && viewMode === 'active') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionFinished();
            return 0;
          }
          return prev - 1;
        });
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, viewMode]);

  // Breathing pattern simulation (Box breathing 4-4-4-4 rhythm for yoga/meditation/breathing)
  useEffect(() => {
    if (isActive && viewMode === 'active') {
      breathTimerRef.current = window.setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            // Transition phase
            setBreathPhase((current) => {
              switch (current) {
                case 'Inhale': return 'Hold';
                case 'Hold': return 'Exhale';
                case 'Exhale': return 'Rest';
                case 'Rest': return 'Inhale';
                default: return 'Inhale';
              }
            });
            return 4; // 4 seconds per phase
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    }

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isActive, viewMode]);

  if (!isOpen || !practice) return null;

  const startSession = () => {
    setViewMode('active');
    setIsActive(true);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const fastForward = () => {
    // Fast forward to last 5 seconds to test completion mechanics
    setTimeLeft(5);
    setTotalElapsed(practice.duration * 60 - 5);
  };

  // Convert seconds to MM:SS format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Safe default benefits if not provided
  const defaultBenefits = {
    Yoga: ['Encourages gentle body movement', 'May support calm focus', 'Eases muscle tension and stiffness'],
    Meditation: ['Helps you slow down and unplug', 'Supports quiet self-reflection', 'Eases busy mind chatter'],
    Breathing: ['Provides an instant mental pause', 'Restores natural breathing rhythm', 'Soothes body stress reactions']
  };

  const benefits = practice.benefits || defaultBenefits[practice.type] || ['Supports general wellness and calm'];

  // Safe default descriptions
  const getWarmGreeting = (type: string) => {
    switch (type) {
      case 'Yoga': return 'Prepare your body for a gentle flow. Find a quiet spot, roll out a mat if you have one, and move at your own pace.';
      case 'Meditation': return 'Find a comfortable seated position. Keep your spine straight but relaxed, let your eyes close, and quiet your thoughts.';
      case 'Breathing': return 'Sit tall and release your shoulders. Follow the simple expansion rings to restore a steady, natural rhythm.';
      default: return 'Take a mindful pause. Release any pressure, sit back, and explore this supportive practice.';
    }
  };

  // Get color for breathing phase
  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'Inhale': return 'var(--color-teal)';
      case 'Hold': return 'var(--color-lavender)';
      case 'Exhale': return 'var(--color-teal-light)';
      case 'Rest': return 'rgba(255, 255, 255, 0.2)';
    }
  };

  // Scale of breathing circle depending on phase
  const getBreathScale = () => {
    if (!isActive) return 1.0;
    const elapsed = 4 - breathSeconds;
    if (breathPhase === 'Inhale') {
      return 0.95 + (elapsed / 4) * 0.45; // scale from 0.95 to 1.4
    } else if (breathPhase === 'Hold') {
      return 1.4;
    } else if (breathPhase === 'Exhale') {
      return 1.4 - (elapsed / 4) * 0.45; // scale back down
    } else {
      return 0.95;
    }
  };

  const handleBackToDetail = () => {
    setIsActive(false);
    setViewMode('detail');
  };

  const currentSteps = practice ? (STEPS_BY_TYPE[practice.type] || STEPS_BY_TYPE['Yoga']) : [];
  const currentStepIdx = practice ? Math.min(4, Math.floor((totalElapsed / (practice.duration * 60)) * 5)) : 0;
  const currentStep = currentSteps[currentStepIdx] || { name: '', instruction: '' };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(4, 6, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          backgroundColor: '#0c111e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: 0
        }}
      >
        {/* Header styling depending on mode */}
        {viewMode === 'detail' && (
          <>
            {/* Visual gradient header */}
            <div 
              className={practice.gradientClass}
              style={{
                height: '160px',
                width: '100%',
                flexShrink: 0,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                boxSizing: 'border-box',
                borderTopLeftRadius: '19px',
                borderTopRightRadius: '19px',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 30%, #0c111e 100%)',
                zIndex: 1
              }} />

              {/* Close Button */}
              <button 
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(6, 10, 18, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'var(--transition-fast)'
                }}
                className="close-button-hover"
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
                <span className={`badge ${
                  practice.type === 'Yoga' ? 'badge-teal' : practice.type === 'Meditation' ? 'badge-lavender' : 'badge-orange'
                }`}>
                  {practice.type}
                </span>
                <span className="badge" style={{ backgroundColor: 'rgba(6, 10, 18, 0.5)', color: 'var(--color-beige-accent)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {practice.level}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-beige-accent)', fontSize: '0.85rem', fontWeight: 600, zIndex: 2 }}>
                <Clock size={16} style={{ color: 'var(--color-teal-light)' }} />
                <span>{practice.duration} Min Session</span>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '36px 24px 24px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-headings)' }}>
                  {practice.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                  {getWarmGreeting(practice.type)}
                </p>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {practice.description}
                </p>
              </div>

              {/* Goal panel */}
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(20, 184, 166, 0.03)', 
                border: '1px solid rgba(20, 184, 166, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Compass size={18} style={{ color: 'var(--color-teal-light)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <strong>Focus Goal:</strong> {practice.goal}
                </span>
              </div>

              {/* Benefits Section */}
              <div>
                <h4 style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--color-lavender-light)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  marginBottom: '10px' 
                }}>
                  Practice Benefits
                </h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                  {benefits.map((benefit, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <Heart size={12} fill="rgba(167, 139, 250, 0.25)" style={{ color: 'var(--color-lavender-light)', flexShrink: 0 }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Session Preview */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <h4 style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--color-lavender-light)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  marginBottom: '12px' 
                }}>
                  Session Preview
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(20, 184, 166, 0.15)',
                      border: '1px solid var(--color-teal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: 'var(--color-teal-light)',
                      fontWeight: 700,
                      marginTop: '2px',
                      flexShrink: 0
                    }}>1</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Prepare</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Find a comfortable seated posture and quiet your thoughts (1-2 Min).</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(167, 139, 250, 0.15)',
                      border: '1px solid var(--color-lavender)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: 'var(--color-lavender-light)',
                      fontWeight: 700,
                      marginTop: '2px',
                      flexShrink: 0
                    }}>2</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Move / Breathe</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Follow the visual guides and pacing rings to release body tension.</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(245, 245, 220, 0.15)',
                      border: '1px solid var(--color-beige-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: 'var(--color-beige-muted)',
                      fontWeight: 700,
                      marginTop: '2px',
                      flexShrink: 0
                    }}>3</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Reflect</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Observe wellness patterns and log your personal reflection notes.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={startSession}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-teal-dark) 100%)',
                    boxShadow: '0 4px 14px rgba(20, 184, 166, 0.2)'
                  }}
                >
                  <Play size={16} fill="currentColor" style={{ marginRight: '6px' }} />
                  <span>Begin Guided Session</span>
                </button>

                <button 
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Back to Library
                </button>
              </div>
            </div>
          </>
        )}

        {/* Guided Session View */}
        {viewMode === 'active' && (
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            
            {/* Header section */}
            <div>
              <span className={`badge ${
                practice.type === 'Yoga' ? 'badge-teal' : practice.type === 'Meditation' ? 'badge-lavender' : 'badge-orange'
              }`} style={{ marginBottom: '8px' }}>
                Guided {practice.type} ({practice.duration} min)
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headings)', margin: 0 }}>
                {practice.title}
              </h3>
            </div>

            {/* Progress Indicator (5 horizontal lines) */}
            <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '360px', marginTop: '4px' }}>
              {[0, 1, 2, 3, 4].map((idx) => {
                const isCompleted = idx < currentStepIdx;
                const isActiveStep = idx === currentStepIdx;
                return (
                  <div 
                    key={idx}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: isCompleted 
                        ? 'var(--color-teal)' 
                        : isActiveStep 
                          ? 'var(--color-lavender-light)' 
                          : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isActiveStep ? '0 0 8px var(--color-lavender-light)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })}
            </div>

            {/* Current Step description */}
            <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', maxWidth: '400px' }}>
              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                color: 'var(--color-teal-light)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em' 
              }}>
                Step {currentStepIdx + 1} of 5: {currentStep.name}
              </span>
              <p style={{ 
                fontSize: '0.92rem', 
                color: 'var(--text-secondary)', 
                lineHeight: '1.45',
                margin: 0
              }}>
                {currentStep.instruction}
              </p>
            </div>

            {/* Visual breathing guide aura / countdown */}
            <div style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '5px 0'
            }}>
              {/* Pulsing glow circles */}
              <div style={{
                position: 'absolute',
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${getPhaseColor()}18 0%, transparent 70%)`,
                transform: `scale(${getBreathScale() * 1.15})`,
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), background 1s ease',
                pointerEvents: 'none',
                zIndex: 1
              }} />

              {/* Pulsing ring outline */}
              <div style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: `2px solid ${getPhaseColor()}`,
                transform: `scale(${getBreathScale()})`,
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s ease',
                boxShadow: isActive ? `0 0 25px ${getPhaseColor()}30` : 'none',
                zIndex: 2
              }} />

              {/* Center timer / countdown display */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(6, 10, 18, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                boxShadow: 'var(--shadow-md)'
              }}>
                <span style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-headings)',
                  color: '#fff',
                  letterSpacing: '0.02em'
                }}>
                  {formatTime(timeLeft)}
                </span>
                <span style={{
                  fontSize: '0.55rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '1px'
                }}>
                  Remaining
                </span>
              </div>
            </div>

            {/* Demo Fast Forward Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', width: '100%' }}>
              <button 
                onClick={() => setSoundOn(!soundOn)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={soundOn ? 'Mute Guide' : 'Unmute Guide'}
              >
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              
              {/* Sound wave bars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '14px', width: '60px' }}>
                {[6, 14, 10, 16, 8, 12, 10, 6].map((_, idx) => (
                  <div 
                    key={idx}
                    style={{
                      width: '3px',
                      height: isActive && soundOn ? '100%' : '4px',
                      backgroundColor: 'var(--color-teal-light)',
                      borderRadius: '2px',
                      opacity: soundOn ? (isActive ? 0.8 : 0.4) : 0.15,
                      transform: isActive && soundOn ? `scaleY(${0.3 + Math.sin(totalElapsed * 1.5 + idx) * 0.7})` : 'none',
                      transformOrigin: 'center',
                      transition: 'height 0.3s ease, transform 0.1s ease'
                    }}
                  />
                ))}
              </div>

              <button 
                onClick={fastForward}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                title="Fast Forward to last 5s for testing"
              >
                <FastForward size={14} />
                <span>Demo Fast-Forward</span>
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '360px', marginTop: '8px' }}>
              <button 
                onClick={toggleTimer}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.04)' : 'rgba(20, 184, 166, 0.1)',
                  color: isActive ? '#fff' : 'var(--color-teal-light)',
                  borderColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(20, 184, 166, 0.2)'
                }}
              >
                {isActive ? <Pause size={16} style={{ marginRight: '6px' }} /> : <Play size={16} fill="currentColor" style={{ marginRight: '6px' }} />}
                <span>{isActive ? 'Pause' : 'Resume'}</span>
              </button>

              <button 
                onClick={handleSessionFinished}
                className="btn btn-primary"
                style={{
                  flex: 1.5,
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-teal-dark) 100%)',
                  boxShadow: '0 4px 14px rgba(20, 184, 166, 0.2)'
                }}
              >
                <Check size={16} style={{ marginRight: '6px' }} />
                <span>Finish Session</span>
              </button>
            </div>

            <button 
              onClick={handleBackToDetail}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px'
              }}
            >
              <ArrowLeft size={12} />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Complete / Celebration View */}
        {viewMode === 'complete' && (
          <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              border: '2px solid var(--color-green-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-green-soft)',
              boxShadow: '0 0 20px rgba(52, 211, 153, 0.25)',
              marginBottom: '10px'
            }}>
              <Check size={32} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headings)', margin: 0 }}>
              Great job — your session is complete.
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: '1.5', margin: 0 }}>
              Take a moment to notice how you feel.
            </p>

            {/* Session Summary Card */}
            <div style={{ 
              width: '100%',
              maxWidth: '360px',
              margin: '12px 0', 
              padding: '16px', 
              borderRadius: '16px', 
              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Session Summary
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                {practice.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>Type: <strong>{practice.type}</strong></span>
                <span>Duration: <strong>{practice.duration} min</strong></span>
              </div>
            </div>

            <button 
              onClick={() => onCompleteAndLog(practice)}
              className="btn btn-primary"
              style={{
                width: '100%',
                maxWidth: '360px',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-teal-dark) 100%)',
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.3)'
              }}
            >
              <span>Complete & Log Session</span>
            </button>

            <button 
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                width: '100%',
                maxWidth: '360px',
                justifyContent: 'center',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Back to Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
