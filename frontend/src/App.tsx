import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StatCard } from './components/StatCard';
import { PracticeCard } from './components/PracticeCard';
import type { Practice } from './components/PracticeCard';
import { ChartCard } from './components/ChartCard';
import { InsightCard } from './components/InsightCard';
import { BreathingCircle } from './components/BreathingCircle';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import { 
  Flame, 
  Clock, 
  Activity,
  Plus,
  Send,
  MessageSquare,
  Smile,
  Info,
  X
} from 'lucide-react';

interface DayLog {
  day: string;
  minutes: number;
  stressBefore: number;
  stressAfter: number;
  mood: number; // 1-5 scale (1: Low, 5: High)
  energy: number; // 1-10 scale
  sleep: number; // hours
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('today');
  
  // Weekly History logs
  const [logs, setLogs] = useState<DayLog[]>([
    { day: 'Mon', minutes: 15, stressBefore: 6, stressAfter: 4, mood: 3, energy: 6, sleep: 7.0 },
    { day: 'Tue', minutes: 20, stressBefore: 7, stressAfter: 3, mood: 4, energy: 7, sleep: 6.5 },
    { day: 'Wed', minutes: 10, stressBefore: 5, stressAfter: 3, mood: 3, energy: 5, sleep: 7.5 },
    { day: 'Thu', minutes: 25, stressBefore: 8, stressAfter: 4, mood: 4, energy: 8, sleep: 8.0 },
    { day: 'Fri', minutes: 12, stressBefore: 6, stressAfter: 3, mood: 5, energy: 7, sleep: 7.2 },
    { day: 'Sat', minutes: 30, stressBefore: 4, stressAfter: 2, mood: 5, energy: 9, sleep: 8.5 },
    { day: 'Sun', minutes: 0, stressBefore: 5, stressAfter: 5, mood: 3, energy: 6, sleep: 7.8 }, // Today
  ]);

  // General counters
  const [streak, setStreak] = useState<number>(6);
  const [yogaSessionsCount, setYogaSessionsCount] = useState<number>(5);
  const [meditationSessionsCount, setMeditationSessionsCount] = useState<number>(2);
  const [breathingSessionsCount, setBreathingSessionsCount] = useState<number>(1);
  
  // Custom user reflections
  const [reflections, setReflections] = useState<string[]>([
    "Felt a bit rushed in the morning, but the breathing reset helped me center before meetings.",
    "Evening stretch helped release tension in my lower back after sitting all day."
  ]);
  const [newReflectionText, setNewReflectionText] = useState<string>('');

  // Daily check-in inputs (state holds values before user clicks "Save Today's Check-in")
  const [checkinMood, setCheckinMood] = useState<number>(3); // 1-5 scale (mapped from text)
  const [checkinMoodText, setCheckinMoodText] = useState<string>('Calm');
  const [checkinEnergy, setCheckinEnergy] = useState<number>(6);
  const [checkinStress, setCheckinStress] = useState<number>(5);
  const [checkinSleep, setCheckinSleep] = useState<number>(7.5);
  const [showCheckinSuccess, setShowCheckinSuccess] = useState<boolean>(false);

  // Custom log practice inputs
  const [customPracticeMinutes, setCustomPracticeMinutes] = useState<number>(15);
  const [customPracticeType, setCustomPracticeType] = useState<string>('Yoga');
  const [showCustomLogModal, setShowCustomLogModal] = useState<boolean>(false);
  const [showCustomLogSuccess, setShowCustomLogSuccess] = useState<boolean>(false);

  // Active Practice Simulation Modal
  const [activeSimulationPractice, setActiveSimulationPractice] = useState<Practice | null>(null);
  const [simulationCountdown, setSimulationCountdown] = useState<number>(10);
  const [isSimulatingComplete, setIsSimulatingComplete] = useState<boolean>(false);

  // List of practices for Practice Library
  const practices: Practice[] = [
    {
      id: 'p1',
      title: 'Morning Yoga Flow',
      type: 'Yoga',
      duration: 15,
      level: 'Beginner',
      goal: 'Gentle morning energy and posture balance',
      description: 'A slow-paced sequence targeting shoulder release and soft lunges to awaken the muscles and warm up the body with kind, mindful movements.',
      gradientClass: 'grad-yoga-1'
    },
    {
      id: 'p2',
      title: 'Stress Relief Yoga',
      type: 'Yoga',
      duration: 20,
      level: 'Intermediate',
      goal: 'Release physical tightness in hips and low back',
      description: 'Focuses on deep hip openers and extended forward folds. Designed to release body tension, clear physical tightness, and invite a deep sense of calm.',
      gradientClass: 'grad-yoga-2'
    },
    {
      id: 'p3',
      title: 'Evening Stretch',
      type: 'Yoga',
      duration: 10,
      level: 'Beginner',
      goal: 'Relax muscles and prepare for sound sleep',
      description: 'Gentle seated stretching, shoulder openers, and child’s pose to help you quiet your thoughts, release postural fatigue, and prepare for a restful sleep.',
      gradientClass: 'grad-yoga-3'
    },
    {
      id: 'p4',
      title: 'Sleep Meditation',
      type: 'Meditation',
      duration: 15,
      level: 'Beginner',
      goal: 'Quiet the mind and transition to peaceful rest',
      description: 'A soft body-scan meditation focusing on slow breath awareness to release day-to-day mind chatter, settle physical tension, and ease into deep rest.',
      gradientClass: 'grad-yoga-4'
    },
    {
      id: 'p5',
      title: '5-Minute Breathing Reset',
      type: 'Breathing',
      duration: 5,
      level: 'All Levels',
      goal: 'Find instant center and mental clarity',
      description: 'A simple, rhythmic equal breathing exercise to clear your mind, renew focus, and establish an instant sense of calm balance during busy hours.',
      gradientClass: 'grad-yoga-5'
    },
    {
      id: 'p6',
      title: 'Neck & Shoulder Release',
      type: 'Yoga',
      duration: 12,
      level: 'Beginner',
      goal: 'Ease muscle tightness from sitting at desk',
      description: 'Gentle stretches targeting neck muscles and shoulder rotations. The perfect quick desk reset to soothe posture fatigue and physical tension.',
      gradientClass: 'grad-yoga-6'
    }
  ];

  // Sync Check-in mood text to numeric scale
  const handleMoodSelect = (moodName: string, numValue: number) => {
    setCheckinMoodText(moodName);
    setCheckinMood(numValue);
  };

  // Submit check-in
  const handleSaveCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    setLogs(prevLogs => {
      const updated = [...prevLogs];
      // Update Sunday (index 6) which represents today
      updated[6] = {
        ...updated[6],
        mood: checkinMood,
        energy: checkinEnergy,
        stressBefore: checkinStress,
        // Let's assume after checking in, the user feels slightly better
        stressAfter: Math.max(1, checkinStress - 2),
        sleep: checkinSleep
      };
      return updated;
    });

    setShowCheckinSuccess(true);
    setTimeout(() => setShowCheckinSuccess(false), 3000);
  };

  // Submit custom practice minutes
  const handleSaveCustomPractice = (e: React.FormEvent) => {
    e.preventDefault();
    setLogs(prevLogs => {
      const updated = [...prevLogs];
      updated[6].minutes += customPracticeMinutes;
      return updated;
    });

    if (customPracticeType === 'Yoga') {
      setYogaSessionsCount(c => c + 1);
    } else if (customPracticeType === 'Meditation') {
      setMeditationSessionsCount(c => c + 1);
    }

    setStreak(s => s === 5 ? 6 : s); // Small streak incentive logic
    setShowCustomLogSuccess(true);
    setTimeout(() => {
      setShowCustomLogSuccess(false);
      setShowCustomLogModal(false);
    }, 2000);
  };

  // Simulate Practice completions
  const handleStartPractice = (practice: Practice) => {
    setActiveSimulationPractice(practice);
    setSimulationCountdown(8);
    setIsSimulatingComplete(false);
  };

  // Countdown timer for practice simulation
  useEffect(() => {
    let interval: number;
    if (activeSimulationPractice && simulationCountdown > 0) {
      interval = window.setInterval(() => {
        setSimulationCountdown(c => c - 1);
      }, 1000);
    } else if (activeSimulationPractice && simulationCountdown === 0) {
      setIsSimulatingComplete(true);
    }
    return () => clearInterval(interval);
  }, [activeSimulationPractice, simulationCountdown]);

  const handleFinishSimulation = () => {
    if (activeSimulationPractice) {
      // Add minutes to today
      setLogs(prevLogs => {
        const updated = [...prevLogs];
        updated[6].minutes += activeSimulationPractice.duration;
        // Assume stress drops after completion
        updated[6].stressAfter = Math.max(1, updated[6].stressBefore - 3);
        return updated;
      });

      // Increment counters
      if (activeSimulationPractice.type === 'Yoga') {
        setYogaSessionsCount(c => c + 1);
      } else if (activeSimulationPractice.type === 'Meditation') {
        setMeditationSessionsCount(c => c + 1);
      } else if (activeSimulationPractice.type === 'Breathing') {
        setBreathingSessionsCount(c => c + 1);
      }

      setStreak(s => s + 1);
    }
    setActiveSimulationPractice(null);
  };

  // Handle logging breath from BreathingCircle component
  const handleLogBreathing = (minutes: number) => {
    setLogs(prevLogs => {
      const updated = [...prevLogs];
      updated[6].minutes += minutes;
      updated[6].stressAfter = Math.max(1, updated[6].stressBefore - 2);
      return updated;
    });
    setBreathingSessionsCount(c => c + 1);
    setStreak(s => s + 1);
  };

  // Submit Reflection text
  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReflectionText.trim()) {
      setReflections(prev => [newReflectionText.trim(), ...prev]);
      setNewReflectionText('');
    }
  };

  // Calculations for dashboard and reports
  const totalPracticeMinutes = logs.reduce((sum, item) => sum + item.minutes, 0);
  
  // Calculate average stress reduction percentage
  const totalStressBefore = logs.reduce((sum, item) => sum + item.stressBefore, 0);
  const totalStressAfter = logs.reduce((sum, item) => sum + item.stressAfter, 0);
  const avgStressReductionPercent = Math.round(((totalStressBefore - totalStressAfter) / totalStressBefore) * 100);

  // Yoga impact score (mock calculation: ratio of practice to stress reduction)
  const yogaImpactScore = Math.min(100, Math.round((totalPracticeMinutes * 0.4) + (avgStressReductionPercent * 0.8)));

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <div className="page-container">
        
        {/* ========================================================= */}
        {/* TODAY PAGE                                                */}
        {/* ========================================================= */}
        {currentTab === 'today' && (
          <div>
            {/* Hero Section */}
            <div className="glass-panel" style={{
              padding: '32px',
              borderRadius: 'var(--border-radius-lg)',
              background: 'linear-gradient(135deg, rgba(14, 32, 37, 0.75) 0%, rgba(13, 15, 34, 0.75) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '24px',
              textAlign: 'left',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {/* Glow spots */}
              <div style={{ position: 'absolute', top: '-50px', right: '10%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 75%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-50px', left: '5%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 75%)', pointerEvents: 'none' }} />

              <div style={{ maxWidth: '640px', position: 'relative', zIndex: 10 }}>
                <span className="badge badge-teal" style={{ marginBottom: '12px' }}>
                  Daily Focus
                </span>
                <h2 style={{
                  fontSize: '2.2rem',
                  fontFamily: 'var(--font-headings)',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '10px',
                  lineHeight: '1.2'
                }}>
                  Welcome back
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  fontWeight: 400
                }}>
                  “Small mindful steps can create meaningful balance over time.”
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowCustomLogModal(true)} className="btn btn-primary">
                    <Plus size={16} />
                    <span>Log Practice</span>
                  </button>
                  <button onClick={() => setCurrentTab('breathing')} className="btn btn-secondary">
                    <span>Start Breathing</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Row */}
            <div className="app-grid app-grid-2" style={{ alignItems: 'stretch' }}>
              {/* Daily Recommendation Card */}
              <div className="glass-panel-glow-teal" style={{
                padding: '24px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(20, 184, 166, 0.15)'
              }}>
                <div>
                  <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <span className="badge badge-teal">Today’s Flow</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gentle Reset</span>
                  </div>

                  {/* Sunset & Breathing Wave Visual Graphic Box */}
                  <div style={{
                    height: '110px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(167, 139, 250, 0.2) 100%)',
                    marginBottom: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {/* Glowing Sun Orb */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(251, 146, 60, 0.45) 0%, transparent 75%)',
                      filter: 'blur(4px)'
                    }} />
                    {/* Soft landscape horizon curved border */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '-20px',
                      right: '-20px',
                      height: '30px',
                      borderRadius: '50% 50% 0 0',
                      backgroundColor: 'rgba(6, 10, 18, 0.65)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }} />
                    {/* Concentric ripples */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      border: '1px dashed rgba(20, 184, 166, 0.15)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontFamily: 'var(--font-headings)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)'
                    }}>
                      Mindful Breath & Flow
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
                    12 min Gentle Yoga Reset
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Based on your recent logs showing mild body tension, we recommend this gentle session. It focuses on releasing shoulder tightness and inviting a calm balance.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      <span>12 Min</span>
                    </div>
                    <div>
                      <span>Level: Beginner</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleStartPractice({
                    id: 'rec1',
                    title: '12 min Gentle Yoga Reset',
                    type: 'Yoga',
                    duration: 12,
                    level: 'Beginner',
                    goal: 'Release physical tension',
                    description: 'Based on posture balance suggestion.',
                    gradientClass: 'grad-yoga-1'
                  })}
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start Today’s Flow
                </button>
              </div>

              {/* Quick Check-in cards */}
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px', fontFamily: 'var(--font-headings)' }}>How are you feeling?</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mindful logs help identify your unique recovery rhythms.</p>
                </div>
                
                <form onSubmit={handleSaveCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Mood check-in */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      How is your mood?
                    </label>
                    <div className="checkin-group">
                      {[
                        { text: 'Tired', val: 2 },
                        { text: 'Calm', val: 4 },
                        { text: 'Happy', val: 5 },
                        { text: 'Stressed', val: 2 }
                      ].map((item) => (
                        <label key={item.text} className="checkin-option">
                          <input 
                            type="radio" 
                            name="mood" 
                            checked={checkinMoodText === item.text}
                            onChange={() => handleMoodSelect(item.text, item.val)} 
                          />
                          <span>
                            <Smile size={18} style={{ color: checkinMoodText === item.text ? 'inherit' : 'var(--text-muted)' }} />
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Energy check-in */}
                  <div>
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Energy Level
                      </label>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-teal-light)', fontWeight: 600 }}>
                        {checkinEnergy}/10
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={checkinEnergy}
                      onChange={(e) => setCheckinEnergy(Number(e.target.value))}
                      style={{ 
                        width: '100%', 
                        accentColor: 'var(--color-teal)',
                        background: 'rgba(255,255,255,0.06)',
                        height: '6px',
                        borderRadius: '3px',
                        outline: 'none'
                      }} 
                    />
                  </div>

                  {/* Stress check-in */}
                  <div>
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Current Stress
                      </label>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-lavender-light)', fontWeight: 600 }}>
                        {checkinStress}/10
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={checkinStress}
                      onChange={(e) => setCheckinStress(Number(e.target.value))}
                      style={{ 
                        width: '100%', 
                        accentColor: 'var(--color-lavender)',
                        background: 'rgba(255,255,255,0.06)',
                        height: '6px',
                        borderRadius: '3px',
                        outline: 'none'
                      }} 
                    />
                  </div>

                  {/* Sleep check-in */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Sleep Duration
                    </label>
                    <div className="checkin-group">
                      {[6.0, 7.0, 7.5, 8.0, 8.5].map((hours) => (
                        <label key={hours} className="checkin-option">
                          <input 
                            type="radio" 
                            name="sleep" 
                            checked={checkinSleep === hours}
                            onChange={() => setCheckinSleep(hours)} 
                          />
                          <span>{hours}h</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-secondary" 
                    style={{ 
                      marginTop: '8px', 
                      backgroundColor: 'rgba(20, 184, 166, 0.08)',
                      borderColor: 'rgba(20, 184, 166, 0.2)',
                      color: 'var(--color-teal-light)',
                      fontWeight: 600,
                      justifyContent: 'center'
                    }}
                  >
                    Save Today's Check-in
                  </button>

                  {showCheckinSuccess && (
                    <div style={{ 
                      backgroundColor: 'rgba(52, 211, 153, 0.1)', 
                      border: '1px solid rgba(52, 211, 153, 0.2)', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      color: 'var(--color-green-soft)',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      marginTop: '8px'
                    }}>
                      Check-in logged successfully! Dashboard values updated.
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Quick reflection inputs bottom */}
            <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MessageSquare size={18} style={{ color: 'var(--color-lavender-light)' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Quick Reflection</h3>
              </div>
              <form onSubmit={handleSaveReflection} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={newReflectionText}
                  onChange={(e) => setNewReflectionText(e.target.value)}
                  placeholder="Record how your body or mind feels right now..." 
                  style={{
                    flex: 1,
                    minWidth: '260px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                  className="reflection-input"
                />
                <button type="submit" className="btn btn-secondary" style={{ display: 'flex', gap: '6px' }}>
                  <Send size={14} />
                  <span>Log</span>
                </button>
              </form>

              {/* Reflection Log List */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reflections.slice(0, 3).map((ref, idx) => (
                  <div key={idx} style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)', 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    borderLeft: '2px solid var(--color-lavender-light)'
                  }}>
                    "{ref}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PRACTICE LIBRARY PAGE                                     */}
        {/* ========================================================= */}
        {currentTab === 'library' && (
          <div>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <span className="badge badge-teal" style={{ marginBottom: '8px' }}>Practice Library</span>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>Explore Mindful Sessions</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Select a guided self-care sequence. Complete to log activity stats immediately to your dashboard.
              </p>
            </div>

            <div className="app-grid app-grid-3" style={{ paddingBottom: '80px' }}>
              {practices.map((practice) => (
                <PracticeCard 
                  key={practice.id} 
                  practice={practice} 
                  onStart={handleStartPractice} 
                />
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DASHBOARD PAGE                                            */}
        {/* ========================================================= */}
        {currentTab === 'dashboard' && (
          <div>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <span className="badge badge-teal" style={{ marginBottom: '8px' }}>Your Progress</span>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>Your Wellness Insights</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Review weekly trends, practice impact ratings, and wellness patterns.
              </p>
            </div>

            {/* Quick Stat Cards Row */}
            <div className="app-grid app-grid-3" style={{ marginBottom: '24px' }}>
              <StatCard 
                title="Consistency Streak" 
                value={`${streak} Days`}
                subtext="Keep going! A consistent daily rhythm supports steady, calm balance and recovery."
                icon={Flame}
                variant="teal"
                badge="Today Active"
              />
              
              <StatCard 
                title="Yoga Impact Score" 
                value={`${yogaImpactScore}/100`}
                subtext="A gentle reflection of your practice consistency and reported stress patterns."
                icon={Activity}
                variant="lavender"
                badge="Calculated"
              />

              <StatCard 
                title="Total Mindful Practice" 
                value={`${totalPracticeMinutes} Min`}
                subtext="Total minutes logged from yoga flows, breath guides, and seated meditations."
                icon={Clock}
                variant="default"
              />
            </div>

            {/* Charts Grid */}
            <div className="app-grid app-grid-2">
              
              {/* Practice Minutes */}
              <ChartCard title="Weekly Practice minutes" description="Total minutes logged daily from all activities." badge="Activity Volume">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={logs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="minutes" fill="var(--color-teal)" radius={[4, 4, 0, 0]} name="Minutes" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Stress Before vs After */}
              <ChartCard title="Body Tension Impact" description="Reported body tension before vs after practice sessions." badge="Stress Reduction" badgeType="orange">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stressBefore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-orange-soft)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--color-orange-soft)" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="stressAfter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-teal)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--color-teal)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 10]} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="stressBefore" stroke="var(--color-orange-soft)" fillOpacity={1} fill="url(#stressBefore)" name="Before Practice" strokeWidth={2} />
                    <Area type="monotone" dataKey="stressAfter" stroke="var(--color-teal)" fillOpacity={1} fill="url(#stressAfter)" name="After Practice" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Mood and Energy Trend */}
              <ChartCard title="Mood & Energy Trend" description="Comparison showing self-reported daily mood vs energy." badge="Correlation Scale" badgeType="lavender">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={logs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="mood" stroke="var(--color-lavender-light)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Mood Rating (1-5)" />
                    <Line type="monotone" dataKey="energy" stroke="var(--color-blue-soft)" strokeWidth={2} strokeDasharray="5 5" name="Energy Level (1-10)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Sleep Quality Trend */}
              <ChartCard title="Sleep Duration Trends" description="Reported hours of rest per night." badge="Sleep Hours" badgeType="green">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={logs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sleep" stroke="var(--color-green-soft)" strokeWidth={3} dot={{ r: 4 }} name="Hours Slept" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* WEEKLY REPORT PAGE                                        */}
        {/* ========================================================= */}
        {currentTab === 'report' && (
          <div>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <span className="badge badge-teal" style={{ marginBottom: '8px' }}>Your Progress</span>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>Your Weekly Balance Overview</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                A personal reflection of your wellness and consistency patterns over the past week.
              </p>
            </div>

            {/* Quick Metrics Summary Layout */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total practice</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-teal-light)', fontFamily: 'var(--font-headings)' }}>
                    {totalPracticeMinutes} Min
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across all sessions</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Yoga Sessions</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headings)' }}>
                    {yogaSessionsCount}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Physical flows</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mindful Seated</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headings)' }}>
                    {meditationSessionsCount}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Meditation sequences</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Breathing Resets</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headings)' }}>
                    {breathingSessionsCount}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rhythmic breath logs</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tension Released</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-orange-soft)', fontFamily: 'var(--font-headings)' }}>
                    {avgStressReductionPercent}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tension release rhythm</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Favorite Mindful Flow</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-lavender-light)', fontFamily: 'var(--font-headings)', marginTop: '8px' }}>
                    Stress Relief Yoga
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Deepest tension release</span>
                </div>

              </div>
            </div>

            {/* AI Summary and Goal Details */}
            <div className="app-grid app-grid-2">
              <InsightCard 
                title="AI Weekly Summary" 
                badge="AI Synthesis"
                type="pattern"
                content="Your data suggests a positive link between evening stretching and sleep quality. You may notice your body tension is consistently lower on days you start with a Morning Yoga Flow. A gentle goal could be to maintain your current consistency streak with short 5-minute sessions on busier weekdays."
                reflectionPrompt="How do you feel on mornings when you make time for a short flow compared to mornings when you don't?"
                onReflectClick={() => {
                  setCurrentTab('today');
                  setTimeout(() => {
                    const el = document.querySelector('.reflection-input');
                    if (el) (el as HTMLInputElement).focus();
                  }, 150);
                }}
              />

              <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Gentle Next Week Goal</h3>
                    <span className="badge badge-teal">Adaptive Goal</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-teal-light)',
                        flexShrink: 0,
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>1</div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>Maintain a 10-Minute Daily Minimum</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Consistency builds calm balance. Even short stretching blocks have high cumulative benefits.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-lavender-light)',
                        flexShrink: 0,
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>2</div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>Add Midday Breathing Resets</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Try 2 short breathing guides during afternoon dips to gently release daily tension.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentTab('library')}
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
                >
                  Browse Suitable Practices
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BREATHING PAGE                                            */}
        {/* ========================================================= */}
        {currentTab === 'breathing' && (
          <div>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <span className="badge badge-orange" style={{ marginBottom: '8px' }}>Guided Breathing</span>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>Mindful Respiration</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Engage in rhythmic breathing cycles. Deep, slow, paced breath signals the brain to release body tension.
              </p>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <BreathingCircle onLogBreathing={handleLogBreathing} />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* AI INSIGHTS PAGE                                          */}
        {/* ========================================================= */}
        {currentTab === 'insights' && (
          <div>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <span className="badge badge-lavender" style={{ marginBottom: '8px' }}>AI Companion</span>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>Behavioral Insights & Reflection</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Analysis of logs to assist your personal self-reflection. These summaries highlight wellness patterns in your logged entries.
              </p>
            </div>

            <div className="app-grid app-grid-2">
              <InsightCard 
                title="Pattern Summary" 
                badge="Trend Analysis"
                type="pattern"
                content="Your data suggests a strong link between your gentle movement sessions and sleep duration. In weeks with over 60 practice minutes, sleep hours improved by an average of 45 minutes."
              />

              <InsightCard 
                title="Gentle Recommendation" 
                badge="Micro-Action"
                type="recommendation"
                content="You may notice a slight drop in mid-afternoon energy levels. A gentle goal could be trying a 5-Minute Breathing Reset at 2:00 PM on weekdays to renew focus."
              />

              <InsightCard 
                title="Stress Trend Insight" 
                badge="Stress Patterns"
                type="connection"
                content="Based on your check-ins, calm balance is most pronounced (+32% relaxed state) immediately following the Stress Relief Yoga practice. Gentle yoga seems to be a highly effective way to release physical tension."
              />

              <InsightCard 
                title="Sleep & Energy Connection" 
                badge="Recovery Rhythm"
                type="connection"
                content="Your weekly sleep tracking is linked with higher morning energy. Days following 7.5+ hours of sleep show a 15% increase in your reported peak daily energy."
              />

              <InsightCard 
                title="Reflection Summary" 
                badge="Mindful Themes"
                type="reflection"
                content="Your logged reflections highlight the theme: 'finding quiet in the evening'. Aligning practices with this mood (like Evening Stretch or Sleep Meditation) might support your goal of slowing down before bed."
                reflectionPrompt="What does 'finding quiet' mean to you in the context of your daily routine?"
                onReflectClick={() => {
                  setCurrentTab('today');
                  setTimeout(() => {
                    const el = document.querySelector('.reflection-input');
                    if (el) (el as HTMLInputElement).focus();
                  }, 150);
                }}
              />

              <div className="glass-panel" style={{
                padding: '24px',
                border: '1px dashed rgba(167, 139, 250, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(167, 139, 250, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-lavender-light)'
                }}>
                  <Info size={20} />
                </div>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>About AI Insights</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                  These reflection cues are shared to help you observe trends in your logged entries. They do not constitute therapeutic or medical advice.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* PRACTICE SIMULATION OVERLAY MODAL                         */}
      {/* ========================================================= */}
      {activeSimulationPractice && (
        <div style={{
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
        }}>
          <div className="glass-panel" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span className="badge badge-teal">{activeSimulationPractice.type} Session</span>
            
            <h3 style={{ fontSize: '1.6rem', color: '#fff', fontFamily: 'var(--font-headings)' }}>
              {activeSimulationPractice.title}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {activeSimulationPractice.description}
            </p>

            {isSimulatingComplete ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                animation: 'fadeIn 0.4s ease-out',
                margin: '10px 0'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  border: '2px solid var(--color-green-soft)',
                  color: 'var(--color-green-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Flame size={28} />
                </div>
                <h4 style={{ fontSize: '1.2rem', color: '#fff' }}>Session Completed!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Ready to log {activeSimulationPractice.duration} practice minutes.
                </p>
              </div>
            ) : (
              <div style={{ margin: '15px 0' }}>
                {/* Simulated session activity visual */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '3px solid var(--color-teal)',
                  borderTopColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-headings)',
                  color: 'var(--color-teal-light)',
                  animation: 'spin 2s linear infinite'
                }}>
                  <span style={{ animation: 'reverse-spin 2s linear infinite' }}>{simulationCountdown}s</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                  Simulating active physical or mindful focus...
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
              <button 
                onClick={() => setActiveSimulationPractice(null)} 
                className="btn btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleFinishSimulation} 
                disabled={!isSimulatingComplete}
                className="btn btn-primary" 
                style={{ 
                  flex: 2, 
                  justifyContent: 'center',
                  opacity: isSimulatingComplete ? 1 : 0.5,
                  cursor: isSimulatingComplete ? 'pointer' : 'not-allowed'
                }}
              >
                <span>Log to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LOG CUSTOM PRACTICE MODAL                                 */}
      {/* ========================================================= */}
      {showCustomLogModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(6, 10, 18, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            textAlign: 'left',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowCustomLogModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '6px', fontFamily: 'var(--font-headings)' }}>
              Log Completed Practice
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Manually add practice volume completed offline.
            </p>

            <form onSubmit={handleSaveCustomPractice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Practice Category
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Yoga', 'Meditation', 'Breathing'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCustomPracticeType(type)}
                      className="btn"
                      style={{
                        flex: 1,
                        fontSize: '0.85rem',
                        padding: '8px',
                        borderRadius: '10px',
                        border: '1px solid',
                        background: customPracticeType === type ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255,255,255,0.02)',
                        borderColor: customPracticeType === type ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)',
                        color: customPracticeType === type ? 'var(--color-teal-light)' : 'var(--text-secondary)'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Duration (Minutes)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[5, 10, 15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCustomPracticeMinutes(mins)}
                      className="btn"
                      style={{
                        flex: 1,
                        fontSize: '0.82rem',
                        padding: '6px 0',
                        borderRadius: '8px',
                        border: '1px solid',
                        background: customPracticeMinutes === mins ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255,255,255,0.02)',
                        borderColor: customPracticeMinutes === mins ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)',
                        color: customPracticeMinutes === mins ? 'var(--color-teal-light)' : 'var(--text-secondary)'
                      }}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                Log Session
              </button>

              {showCustomLogSuccess && (
                <div style={{ 
                  backgroundColor: 'rgba(52, 211, 153, 0.1)', 
                  border: '1px solid rgba(52, 211, 153, 0.2)', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  color: 'var(--color-green-soft)',
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}>
                  Session logged! Streak and dashboard updated.
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* CSS Helper Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </Layout>
  );
}
