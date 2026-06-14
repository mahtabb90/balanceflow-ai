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

export const PracticeDetailModal: React.FC<PracticeDetailModalProps> = ({
  isOpen,
  onClose,
  practice,
  onCompleteAndLog,
}) => {
  if (!isOpen || !practice) return null;

  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(practice.duration * 60);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  
  // Breathing animation states
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);

  const timerRef = useRef<number | null>(null);
  const breathTimerRef = useRef<number | null>(null);

  // Reset states when modal reopens or practice changes
  useEffect(() => {
    setViewMode('detail');
    setIsActive(false);
    setTimeLeft(practice.duration * 60);
    setTotalElapsed(0);
    setBreathPhase('Inhale');
    setBreathSeconds(4);
  }, [practice, isOpen]);

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

  const handleSessionFinished = () => {
    setIsActive(false);
    setViewMode('complete');
  };

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
            <div style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  onClick={() => onCompleteAndLog(practice)}
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(52, 211, 153, 0.08)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    color: 'var(--color-green-soft)'
                  }}
                >
                  <Check size={16} style={{ marginRight: '6px' }} />
                  <span>Complete & Log Session</span>
                </button>

                <button 
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '10px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)'
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
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', textAlign: 'center' }}>
            {/* Header section */}
            <div>
              <span className={`badge ${
                practice.type === 'Yoga' ? 'badge-teal' : practice.type === 'Meditation' ? 'badge-lavender' : 'badge-orange'
              }`} style={{ marginBottom: '8px' }}>
                Guided {practice.type}
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headings)' }}>
                {practice.title}
              </h3>
            </div>

            {/* Visual breathing guide aura */}
            <div style={{
              position: 'relative',
              width: '240px',
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '10px 0'
            }}>
              {/* Pulsing glow circles */}
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '180px',
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
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: `2px solid ${getPhaseColor()}`,
                transform: `scale(${getBreathScale()})`,
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s ease',
                boxShadow: isActive ? `0 0 25px ${getPhaseColor()}30` : 'none',
                zIndex: 2
              }} />

              {/* Center timer / countdown display */}
              <div style={{
                width: '110px',
                height: '110px',
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
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-headings)',
                  color: '#fff',
                  letterSpacing: '0.02em'
                }}>
                  {formatTime(timeLeft)}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '2px'
                }}>
                  Remaining
                </span>
              </div>
            </div>

            {/* Breathing Phase Description Text */}
            <div style={{ minHeight: '65px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ 
                fontSize: '1.15rem', 
                fontWeight: 600, 
                color: getPhaseColor(),
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                transition: 'color 0.5s ease',
                display: 'block',
                marginBottom: '4px'
              }}>
                {isActive ? breathPhase : 'Paused'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '300px', display: 'block', margin: '0 auto' }}>
                {breathPhase === 'Inhale' && 'Slowly fill your lungs with fresh energy...'}
                {breathPhase === 'Hold' && 'Feel the quiet stillness within...'}
                {breathPhase === 'Exhale' && 'Gently release all body tension...'}
                {breathPhase === 'Rest' && 'Settle and prepare for the next breath...'}
              </span>
            </div>

            {/* Visual sound wave representation */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '16px', width: '80px' }}>
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

              {/* Fast Forward (Demo Mode) Button */}
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
                title="Fast Forward for Testing"
              >
                <FastForward size={14} />
                <span>Demo Fast-Forward</span>
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button 
                onClick={toggleTimer}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'var(--color-teal)',
                  color: isActive ? '#fff' : '#060a12',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}
              >
                {isActive ? <Pause size={16} style={{ marginRight: '6px' }} /> : <Play size={16} fill="currentColor" style={{ marginRight: '6px' }} />}
                <span>{isActive ? 'Pause' : 'Resume'}</span>
              </button>

              <button 
                onClick={handleSessionFinished}
                className="btn"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: 'var(--color-green-soft)'
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
                marginTop: '-8px'
              }}
            >
              <ArrowLeft size={12} />
              <span>Back to Practice Details</span>
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

            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headings)' }}>
              Practice Completed!
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: '1.5' }}>
              Wonderful job completing your **{practice.title}**! Taking this time encourages calm balance and resets body tension.
            </p>

            <div style={{ 
              margin: '10px 0', 
              padding: '10px 20px', 
              borderRadius: '20px', 
              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              <span>Logged: <strong>{practice.duration} min</strong> of {practice.type}</span>
            </div>

            <button 
              onClick={() => onCompleteAndLog(practice)}
              className="btn btn-primary"
              style={{
                width: '100%',
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
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                marginTop: '4px'
              }}
            >
              Close without Logging
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
