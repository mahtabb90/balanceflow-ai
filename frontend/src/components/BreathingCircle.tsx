import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

interface BreathingCircleProps {
  onLogBreathing: (minutes: number) => void;
}

type ExerciseType = 'box' | 'calm' | 'reset';

interface Phase {
  name: 'Inhale' | 'Hold' | 'Exhale' | 'Rest';
  duration: number; // in seconds
  color: string;
}

  // Exercise Definitions
  const exercises: Record<ExerciseType, { name: string; phases: Phase[]; desc: string }> = {
    box: {
      name: 'Box Breathing (4-4-4-4)',
      desc: 'Clears the mind, promotes inner calm, and improves daily focus.',
      phases: [
        { name: 'Inhale', duration: 4, color: 'var(--color-teal)' },
        { name: 'Hold', duration: 4, color: 'var(--color-lavender)' },
        { name: 'Exhale', duration: 4, color: 'var(--color-teal-light)' },
        { name: 'Hold', duration: 4, color: 'var(--color-lavender-dark)' },
      ],
    },
    calm: {
      name: 'Calm Exhale (4-6)',
      desc: 'Lengthens the exhale to support natural body relaxation and release daily stress.',
      phases: [
        { name: 'Inhale', duration: 4, color: 'var(--color-teal)' },
        { name: 'Exhale', duration: 6, color: 'var(--color-teal-light)' },
      ],
    },
    reset: {
      name: '1-Minute Reset (5-5)',
      desc: 'A quick balancing breath to anchor yourself in the present moment.',
      phases: [
        { name: 'Inhale', duration: 5, color: 'var(--color-teal)' },
        { name: 'Exhale', duration: 5, color: 'var(--color-teal-light)' },
      ],
    },
  };

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ onLogBreathing }) => {
  const [exercise, setExercise] = useState<ExerciseType>('box');
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [showCompleteCelebration, setShowCompleteCelebration] = useState(false);

  const timerRef = useRef<number | null>(null);

  const currentExerciseData = exercises[exercise];
  const currentPhase = currentExerciseData.phases[currentPhaseIndex];

  const resetExercise = useCallback(() => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSecondsLeft(exercises[exercise].phases[0].duration);
    setTotalSeconds(0);
    setCompletedCycles(0);
    setShowCompleteCelebration(false);
  }, [exercise]);

  const selectExercise = (type: ExerciseType) => {
    setExercise(type);
    setCurrentPhaseIndex(0);
    setSecondsLeft(exercises[type].phases[0].duration);
    setTotalSeconds(0);
    setCompletedCycles(0);
    setShowCompleteCelebration(false);
  };

  // Breathing Loop
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const nextIndex = (currentPhaseIndex + 1) % currentExerciseData.phases.length;
            setCurrentPhaseIndex(nextIndex);
            
            // If we wrapped back to 0, increment cycles
            if (nextIndex === 0) {
              setCompletedCycles((c) => c + 1);
            }

            return currentExerciseData.phases[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, currentPhaseIndex, exercise, currentExerciseData.phases]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const logSession = () => {
    const minutesCompleted = Math.max(1, Math.round(totalSeconds / 60));
    onLogBreathing(minutesCompleted);
    setShowCompleteCelebration(true);
    setIsActive(false);
    setTimeout(() => {
      setShowCompleteCelebration(false);
      resetExercise();
    }, 4000);
  };

  // Determine scaling of visual circle based on phase
  const getScaleValue = () => {
    if (!isActive) return 1.0;
    
    const phaseName = currentPhase.name;
    const duration = currentPhase.duration;
    const elapsed = duration - secondsLeft;

    if (phaseName === 'Inhale') {
      // Scale from 0.9 up to 1.45
      return 0.9 + (elapsed / duration) * 0.55;
    } else if (phaseName === 'Hold') {
      // Stay expanded
      return 1.45;
    } else if (phaseName === 'Exhale') {
      // Scale down from 1.45 to 0.9
      return 1.45 - (elapsed / duration) * 0.55;
    } else {
      // Box Hold (empty/rest) - stay small
      return 0.9;
    }
  };

  // Get descriptive prompt depending on state
  const getSubText = () => {
    if (!isActive) return 'Ready when you are';
    return `${secondsLeft}s remaining`;
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      
      {/* Exercise Selectors */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        {(Object.keys(exercises) as ExerciseType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              if (!isActive) selectExercise(type);
            }}
            disabled={isActive}
            className="btn"
            style={{
              fontSize: '0.85rem',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid',
              background: exercise === type ? 'rgba(20, 184, 166, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              borderColor: exercise === type ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.08)',
              color: exercise === type ? 'var(--color-teal-light)' : 'var(--text-secondary)',
              cursor: isActive ? 'not-allowed' : 'pointer',
              opacity: isActive && exercise !== type ? 0.5 : 1,
            }}
          >
            {type === 'box' ? 'Box Breathing' : type === 'calm' ? 'Calm Exhale' : '1-Min Reset'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '400px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
          {currentExerciseData.name}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {currentExerciseData.desc}
        </p>
      </div>

      {showCompleteCelebration ? (
        <div style={{
          height: '240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(52, 211, 153, 0.15)',
            border: '2px solid var(--color-green-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-green-soft)',
            boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)'
          }}>
            <Check size={32} />
          </div>
          <h4 style={{ fontSize: '1.4rem', color: '#fff' }}>Mindful Reset Completed!</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            We've logged {Math.max(1, Math.round(totalSeconds / 60))} minute(s) of mindful breathing.
          </p>
        </div>
      ) : (
        /* Animated Circle Wrapper */
        <div style={{
          position: 'relative',
          width: '280px',
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0'
        }}>
          {/* Outer glow aura */}
          <div style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: isActive 
              ? `radial-gradient(circle, ${currentPhase.color}15 0%, transparent 70%)`
              : 'radial-gradient(circle, rgba(20, 184, 166, 0.05) 0%, transparent 70%)',
            transform: `scale(${getScaleValue() * 1.1})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), background 1s ease',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Inner animated ring */}
          <div style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: `2px solid ${isActive ? currentPhase.color : 'rgba(255, 255, 255, 0.08)'}`,
            transform: `scale(${getScaleValue()})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s ease',
            boxShadow: isActive ? `0 0 30px ${currentPhase.color}40` : 'none',
            zIndex: 2
          }} />

          {/* Center text container */}
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            backgroundColor: 'rgba(11, 18, 30, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: 'var(--font-headings)',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              transition: 'color 0.5s ease',
              color: isActive ? currentPhase.color : '#fff'
            }}>
              {isActive ? currentPhase.name : 'Breath'}
            </span>
            <span style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              marginTop: '4px'
            }}>
              {getSubText()}
            </span>
          </div>
        </div>
      )}

      {/* Breathing Session Stats */}
      {isActive && (
        <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Cycles:</span> {completedCycles}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Active Session:</span> {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px', zIndex: 10 }}>
        {!showCompleteCelebration && (
          <>
            <button
              onClick={toggleActive}
              className="btn btn-primary"
              style={{
                background: isActive 
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-teal-dark) 100%)',
                color: isActive ? 'var(--text-primary)' : '#060a12',
                border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                minWidth: '130px',
                boxShadow: isActive ? 'none' : '0 4px 14px rgba(20, 184, 166, 0.3)'
              }}
            >
              {isActive ? (
                <>
                  <Pause size={16} fill="currentColor" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>{totalSeconds > 0 ? 'Resume' : 'Start'}</span>
                </>
              )}
            </button>

            <button
              onClick={resetExercise}
              className="btn btn-secondary"
              style={{ padding: '10px 14px' }}
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>

            {totalSeconds >= 10 && (
              <button
                onClick={logSession}
                className="btn"
                style={{
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: 'var(--color-green-soft)',
                  fontWeight: 600
                }}
              >
                <Check size={16} style={{ marginRight: '4px' }} />
                <span>Log Session</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Simple step card helper instructions */}
      <div style={{ width: '100%', borderTop: '1px solid var(--panel-border)', paddingTop: '20px', marginTop: '8px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'left' }}>
          Breathing Guide
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px'
        }}>
          {currentExerciseData.phases.map((phase, idx) => (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: currentPhaseIndex === idx && isActive 
                  ? `1px solid ${phase.color}` 
                  : '1px solid var(--panel-border)',
                background: currentPhaseIndex === idx && isActive 
                  ? `${phase.color}08` 
                  : 'rgba(255, 255, 255, 0.01)',
                boxShadow: currentPhaseIndex === idx && isActive ? `0 0 10px ${phase.color}20` : 'none',
                transition: 'var(--transition-smooth)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: phase.color 
                }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                  {phase.name}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Duration: {phase.duration}s
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
