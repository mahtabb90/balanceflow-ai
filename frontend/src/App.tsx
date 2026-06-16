import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StatCard } from './components/StatCard';
import { PracticeCard } from './components/PracticeCard';
import circleLogo from './assets/balanceflow-circle-logo.png';
import wellnessYogaFlow from './assets/wellness_yoga_flow.png';
import balanceSpaceGlow from './assets/balance_space_glow.png';
import type { Practice } from './components/PracticeCard';
import { ChartCard } from './components/ChartCard';
import { InsightCard } from './components/InsightCard';
import { getAIInsights, getWellnessMetrics } from './services/aiInsightService';
import { BreathingCircle } from './components/BreathingCircle';
import { EntryModal } from './components/EntryModal';
import { PracticeDetailModal } from './components/PracticeDetailModal';
import type { WellnessEntry } from './types/wellness';
import { getEntries, createEntry, deleteAllEntries, formatEntryDate } from './services/apiService';
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
  Trash2,
  RefreshCw
} from 'lucide-react';

const INITIAL_ENTRIES: WellnessEntry[] = [
  {
    id: 'e1',
    date: '2026-06-08',
    day: 'Mon',
    type: 'Yoga',
    title: 'Morning Yoga Flow',
    duration: 15,
    intensity: 'Gentle',
    moodBefore: 'Tired',
    moodAfter: 'Calm',
    energyBefore: 5,
    energyAfter: 7,
    stressBefore: 6,
    stressAfter: 4,
    sleepQuality: 7,
    reflection: 'Felt a bit stiff at first, but shoulder openers were very refreshing.'
  },
  {
    id: 'e2',
    date: '2026-06-09',
    day: 'Tue',
    type: 'Yoga',
    title: 'Stress Relief Yoga',
    duration: 20,
    intensity: 'Moderate',
    moodBefore: 'Stressed',
    moodAfter: 'Calm',
    energyBefore: 4,
    energyAfter: 7,
    stressBefore: 7,
    stressAfter: 3,
    sleepQuality: 6,
    reflection: 'Really released muscle tightness in lower back.'
  },
  {
    id: 'e3',
    date: '2026-06-10',
    day: 'Wed',
    type: 'Breathing',
    title: '5-Minute Breathing Reset',
    duration: 5,
    intensity: 'Gentle',
    moodBefore: 'Tired',
    moodAfter: 'Calm',
    energyBefore: 5,
    energyAfter: 6,
    stressBefore: 5,
    stressAfter: 3,
    sleepQuality: 8,
    reflection: 'Quick break during work did wonders for focus.'
  },
  {
    id: 'e4',
    date: '2026-06-11',
    day: 'Thu',
    type: 'Yoga',
    title: 'Morning Yoga Flow',
    duration: 15,
    intensity: 'Gentle',
    moodBefore: 'Tired',
    moodAfter: 'Happy',
    energyBefore: 6,
    energyAfter: 8,
    stressBefore: 6,
    stressAfter: 4,
    sleepQuality: 8,
    reflection: 'Grateful for some morning movements.'
  },
  {
    id: 'e5',
    date: '2026-06-11',
    day: 'Thu',
    type: 'Meditation',
    title: 'Sleep Meditation',
    duration: 15,
    intensity: 'Gentle',
    moodBefore: 'Calm',
    moodAfter: 'Calm',
    energyBefore: 4,
    energyAfter: 3,
    stressBefore: 4,
    stressAfter: 2,
    sleepQuality: 8,
    reflection: 'Unwound nicely before turning off the lights.'
  },
  {
    id: 'e6',
    date: '2026-06-12',
    day: 'Fri',
    type: 'Yoga',
    title: 'Neck & Shoulder Release',
    duration: 12,
    intensity: 'Gentle',
    moodBefore: 'Stressed',
    moodAfter: 'Calm',
    energyBefore: 6,
    energyAfter: 7,
    stressBefore: 6,
    stressAfter: 3,
    sleepQuality: 7,
    reflection: 'Neck tightness cleared after computer work.'
  },
  {
    id: 'e7',
    date: '2026-06-13',
    day: 'Sat',
    type: 'Yoga',
    title: 'Morning Yoga Flow',
    duration: 15,
    intensity: 'Moderate',
    moodBefore: 'Calm',
    moodAfter: 'Happy',
    energyBefore: 7,
    energyAfter: 9,
    stressBefore: 4,
    stressAfter: 2,
    sleepQuality: 9,
    reflection: 'Strong flow, felt energizing and active.'
  },
  {
    id: 'e8',
    date: '2026-06-13',
    day: 'Sat',
    type: 'Meditation',
    title: 'Sleep Meditation',
    duration: 15,
    intensity: 'Gentle',
    moodBefore: 'Tired',
    moodAfter: 'Calm',
    energyBefore: 4,
    energyAfter: 3,
    stressBefore: 4,
    stressAfter: 2,
    sleepQuality: 9,
    reflection: 'Deep rest, quietly reflections.'
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('today');
  
  // Entries Database State
  const [entries, setEntries] = useState<WellnessEntry[]>(INITIAL_ENTRIES);
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);

  // Load entries on mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await getEntries();
        setEntries(data);
        setIsBackendOffline(false);
      } catch (error) {
        console.error("Failed to fetch entries from backend, falling back to local demo data:", error);
        setIsBackendOffline(true);
      }
    };
    fetchEntries();
  }, []);

  // Quick reflection text box input
  const [newReflectionText, setNewReflectionText] = useState<string>('');

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledValues, setPrefilledValues] = useState<Partial<WellnessEntry> | null>(null);

  // Practice Detail Modal State
  const [selectedPracticeForDetail, setSelectedPracticeForDetail] = useState<Practice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenPracticeDetail = (practice: Practice) => {
    setSelectedPracticeForDetail(practice);
    setIsDetailModalOpen(true);
  };

  const handleCompletePracticeAndLog = (practice: Practice) => {
    setIsDetailModalOpen(false);
    handleOpenEntryModal({
      type: practice.type,
      title: practice.title,
      duration: practice.duration,
      intensity: 'Gentle',
      stressBefore: 6,
      stressAfter: 3,
      energyBefore: 5,
      energyAfter: 7,
      moodBefore: 'Calm',
      moodAfter: 'Happy',
      sleepQuality: 8
    });
  };

  // Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Toast Trigger Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Open entry modal wrapper
  const handleOpenEntryModal = (prefills: Partial<WellnessEntry> | null = null) => {
    setPrefilledValues(prefills);
    setIsModalOpen(true);
  };

  // Save wellness entry log
  const handleSaveEntry = async (newLog: Omit<WellnessEntry, 'id' | 'date' | 'day'>) => {
    setIsModalOpen(false);
    try {
      const savedEntry = await createEntry(newLog);
      setEntries(prev => [...prev, savedEntry]);
      setIsBackendOffline(false);
      triggerToast("Session logged. Your dashboard has been updated.");
    } catch (error) {
      console.error("Failed to save entry to backend, falling back to local storage:", error);
      setIsBackendOffline(true);
      
      // Fallback behavior
      const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const fallbackEntry: WellnessEntry = {
        ...newLog,
        id: 'e_' + Math.random().toString(36).substr(2, 9),
        date: now.toISOString().split('T')[0],
        day: daysShort[now.getDay()],
      };
      setEntries(prev => [...prev, fallbackEntry]);
      triggerToast("Backend connection unavailable. Session saved locally.");
    }
    
    // Automatically direct to Dashboard to see updates
    setCurrentTab('dashboard');
  };

  // Log breath completion from BreathingCircle
  const handleLogBreathing = (minutes: number) => {
    handleOpenEntryModal({
      type: 'Breathing',
      title: 'Guided Breathing Reset',
      duration: minutes,
      intensity: 'Gentle',
      stressBefore: 6,
      stressAfter: 3,
      energyBefore: 5,
      energyAfter: 6,
      moodBefore: 'Stressed',
      moodAfter: 'Calm',
      sleepQuality: 8
    });
  };

  // Submit quick reflection from Today page text area
  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReflectionText.trim()) {
      const logData: Omit<WellnessEntry, 'id' | 'date' | 'day'> = {
        type: 'Meditation',
        title: 'Mindful Reflection',
        duration: 5,
        intensity: 'Gentle',
        moodBefore: 'Calm',
        moodAfter: 'Calm',
        energyBefore: 5,
        energyAfter: 6,
        stressBefore: 3,
        stressAfter: 3,
        sleepQuality: 7,
        reflection: newReflectionText.trim()
      };

      setNewReflectionText('');

      try {
        const savedEntry = await createEntry(logData);
        setEntries(prev => [...prev, savedEntry]);
        setIsBackendOffline(false);
        triggerToast("Reflection logged. Entry added to your history.");
      } catch (error) {
        console.error("Failed to save reflection to backend, falling back to local storage:", error);
        setIsBackendOffline(true);
        
        // Fallback behavior
        const now = new Date();
        const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const fallbackEntry: WellnessEntry = {
          ...logData,
          id: 'e_' + Math.random().toString(36).substr(2, 9),
          date: now.toISOString().split('T')[0],
          day: daysShort[now.getDay()],
        };
        setEntries(prev => [...prev, fallbackEntry]);
        triggerToast("Backend connection unavailable. Reflection saved locally.");
      }
    }
  };

  // Clear database logs (to test empty states)
  const handleClearLogs = async () => {
    try {
      await deleteAllEntries();
      setEntries([]);
      setIsBackendOffline(false);
      triggerToast("All history cleared. Viewing empty states.");
    } catch (error) {
      console.error("Failed to clear entries on backend:", error);
      setIsBackendOffline(true);
      
      // Fallback
      setEntries([]);
      triggerToast("Backend connection unavailable. Cleared local view.");
    }
  };

  // Reset to seed demo database
  const handleLoadDemoData = async () => {
    try {
      try {
        await deleteAllEntries();
      } catch {
        // Ignore pre-clear error
      }
      
      const seededEntries: WellnessEntry[] = [];
      for (const initial of INITIAL_ENTRIES) {
        const saved = await createEntry(initial);
        seededEntries.push(saved);
      }
      setEntries(seededEntries);
      setIsBackendOffline(false);
      triggerToast("Demo data reloaded on backend successfully.");
    } catch (error) {
      console.error("Failed to load demo data on backend, falling back to local memory:", error);
      setIsBackendOffline(true);
      setEntries(INITIAL_ENTRIES);
      triggerToast("Backend connection unavailable. Demo data reloaded locally.");
    }
  };

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
      gradientClass: 'grad-yoga-1',
      benefits: ['Encourages gentle body movement', 'May support calm focus', 'Soothes morning shoulder stiffness']
    },
    {
      id: 'p2',
      title: 'Stress Relief Yoga',
      type: 'Yoga',
      duration: 20,
      level: 'Intermediate',
      goal: 'Release physical tightness in hips and low back',
      description: 'Focuses on deep hip openers and extended forward folds. Designed to release body tension, clear physical tightness, and invite a deep sense of calm.',
      gradientClass: 'grad-yoga-2',
      benefits: ['Helps you slow down and breathe', 'Soothes muscle tightness in back', 'Invites a deep sense of calm balance']
    },
    {
      id: 'p3',
      title: 'Evening Stretch',
      type: 'Yoga',
      duration: 10,
      level: 'Beginner',
      goal: 'Relax muscles and prepare for sound sleep',
      description: 'Gentle seated stretching, shoulder openers, and child’s pose to help you quiet your thoughts, release postural fatigue, and prepare for a restful sleep.',
      gradientClass: 'grad-yoga-3',
      benefits: ['Quietens postural fatigue', 'Prepares physical body for deep rest', 'Eases transition to sleep']
    },
    {
      id: 'p4',
      title: 'Sleep Meditation',
      type: 'Meditation',
      duration: 15,
      level: 'Beginner',
      goal: 'Quiet the mind and transition to peaceful rest',
      description: 'A soft body-scan meditation focusing on slow breath awareness to release day-to-day mind chatter, settle physical tension, and ease into deep rest.',
      gradientClass: 'grad-yoga-4',
      benefits: ['Eases active daily mind chatter', 'Encourages peaceful self-reflection', 'Releases muscle tension safely']
    },
    {
      id: 'p5',
      title: '5-Minute Breathing Reset',
      type: 'Breathing',
      duration: 5,
      level: 'All Levels',
      goal: 'Find instant center and mental clarity',
      description: 'A simple, rhythmic equal breathing exercise to clear your mind, renew focus, and establish an instant sense of calm balance during busy hours.',
      gradientClass: 'grad-yoga-5',
      benefits: ['Provides an instant mental pause', 'Encourages calm centered focus', 'Helps balance recovery rhythms']
    },
    {
      id: 'p6',
      title: 'Neck & Shoulder Release',
      type: 'Yoga',
      duration: 12,
      level: 'Beginner',
      goal: 'Ease muscle tightness from sitting at desk',
      description: 'Gentle stretches targeting neck muscles and shoulder rotations. The perfect quick desk reset to soothe posture fatigue and physical tension.',
      gradientClass: 'grad-yoga-6',
      benefits: ['Eases upper body posture fatigue', 'Helps release tension from sitting', 'Supports desk recovery rhythm']
    }
  ];

  // Dynamic calculations from database
  const {
    totalPracticeMinutes,
    streak,
    yogaImpactScore,
    yogaSessionsCount,
    meditationSessionsCount,
    breathingSessionsCount,
    avgStressReductionPercent,
    bestPracticeType
  } = getWellnessMetrics(entries);

  // Aggregate entries for Recharts Compatibility
  const getAggregatedLogs = (): {
    day: string;
    minutes: number;
    stressBefore: number;
    stressAfter: number;
    mood: number;
    energy: number;
    sleep: number;
  }[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    interface DaySummary {
      minutes: number;
      stressBeforeSum: number;
      stressAfterSum: number;
      stressCount: number;
      moodSum: number;
      moodCount: number;
      energySum: number;
      energyCount: number;
      sleepSum: number;
      sleepCount: number;
    }

    const summaries = days.reduce((acc, d) => {
      acc[d] = {
        minutes: 0,
        stressBeforeSum: 0,
        stressAfterSum: 0,
        stressCount: 0,
        moodSum: 0,
        moodCount: 0,
        energySum: 0,
        energyCount: 0,
        sleepSum: 0,
        sleepCount: 0,
      };
      return acc;
    }, {} as Record<string, DaySummary>);

    entries.forEach(entry => {
      const d = entry.day;
      if (!summaries[d]) return;

      summaries[d].minutes += entry.duration;
      
      summaries[d].stressBeforeSum += entry.stressBefore;
      summaries[d].stressAfterSum += entry.stressAfter;
      summaries[d].stressCount++;

      summaries[d].energySum += entry.energyAfter;
      summaries[d].energyCount++;

      summaries[d].sleepSum += entry.sleepQuality;
      summaries[d].sleepCount++;

      let moodValue = 3;
      if (entry.moodAfter === 'Happy') moodValue = 5;
      else if (entry.moodAfter === 'Calm') moodValue = 4;
      else if (entry.moodAfter === 'Tired') moodValue = 2;
      else if (entry.moodAfter === 'Stressed') moodValue = 2;

      summaries[d].moodSum += moodValue;
      summaries[d].moodCount++;
    });

    return days.map(day => {
      const s = summaries[day];
      return {
        day,
        minutes: s.minutes,
        stressBefore: s.stressCount > 0 ? Math.round((s.stressBeforeSum / s.stressCount) * 10) / 10 : 0,
        stressAfter: s.stressCount > 0 ? Math.round((s.stressAfterSum / s.stressCount) * 10) / 10 : 0,
        mood: s.moodCount > 0 ? Math.round((s.moodSum / s.moodCount) * 10) / 10 : 0,
        energy: s.energyCount > 0 ? Math.round((s.energySum / s.energyCount) * 10) / 10 : 0,
        sleep: s.sleepCount > 0 ? Math.round((s.sleepSum / s.sleepCount) * 10) / 10 : 0,
      };
    });
  };

  const chartData = getAggregatedLogs();

  // Extract reflections
  const reflections = entries
    .filter(e => e.reflection && e.reflection.trim() !== '')
    .map(e => ({ text: e.reflection, createdAt: e.created_at, date: e.date }));

  const aiInsights = getAIInsights(entries);

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <div className="page-container">
        
        {/* Offline Banner */}
        {isBackendOffline && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fca5a5',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px #ef4444'
            }} />
            <span>Backend connection unavailable. Using local demo data.</span>
          </div>
        )}

        {/* Success Toast */}
        {showToast && (
          <div style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--color-teal)',
            borderRadius: '12px',
            padding: '12px 24px',
            zIndex: 200,
            boxShadow: 'var(--shadow-glow-teal)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-teal-light)',
              boxShadow: '0 0 8px var(--color-teal-light)'
            }} />
            <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
              {toastMessage}
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TODAY PAGE                                                */}
        {/* ========================================================= */}
        {currentTab === 'today' && (
          <div>
            {/* Hero Section */}
            <div className="glass-panel" style={{
              padding: '12px 32px 32px 32px',
              minHeight: '360px',
              borderRadius: 'var(--border-radius-lg)',
              background: 'linear-gradient(135deg, rgba(14, 32, 37, 0.75) 0%, rgba(13, 15, 34, 0.75) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '24px',
              textAlign: 'left',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              <div style={{ position: 'absolute', top: '-50px', right: '10%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 75%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-50px', left: '5%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 75%)', pointerEvents: 'none' }} />

              {/* Background Flowing Waves extending from Logo on the right toward the center */}
              <svg 
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '65%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1,
                  opacity: 0.45,
                  overflow: 'visible'
                }}
                viewBox="0 0 500 200"
                preserveAspectRatio="none"
              >
                <path 
                  d="M 500 100 C 400 30, 300 170, 200 100 C 100 30, 0 170, -50 100" 
                  fill="none" 
                  stroke="url(#bgWaveTeal)" 
                  strokeWidth="2" 
                  className="bg-flow-wave bg-flow-wave-1"
                />
                <path 
                  d="M 500 120 C 380 160, 280 40, 180 120 C 80 200, 0 40, -50 120" 
                  fill="none" 
                  stroke="url(#bgWaveLavender)" 
                  strokeWidth="1.5" 
                  className="bg-flow-wave bg-flow-wave-2"
                />
                <path 
                  d="M 500 80 C 420 20, 320 180, 220 80 C 120 -20, 0 180, -50 80" 
                  fill="none" 
                  stroke="url(#bgWaveBeige)" 
                  strokeWidth="1" 
                  className="bg-flow-wave bg-flow-wave-3"
                />
                <defs>
                  <linearGradient id="bgWaveTeal" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(20, 184, 166, 0.5)" />
                    <stop offset="60%" stopColor="rgba(20, 184, 166, 0.2)" />
                    <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
                  </linearGradient>
                  <linearGradient id="bgWaveLavender" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(167, 139, 250, 0.4)" />
                    <stop offset="60%" stopColor="rgba(167, 139, 250, 0.15)" />
                    <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" />
                  </linearGradient>
                  <linearGradient id="bgWaveBeige" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(245, 245, 220, 0.3)" />
                    <stop offset="60%" stopColor="rgba(245, 245, 220, 0.1)" />
                    <stop offset="100%" stopColor="rgba(245, 245, 220, 0)" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="today-hero-content-wrapper">
                {/* Left content column */}
                <div style={{ maxWidth: '560px', width: '100%', position: 'relative', zIndex: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    <span className="badge badge-teal" style={{ alignSelf: 'flex-start' }}>
                      Daily Focus
                    </span>
                    <h2 style={{
                      fontSize: '2.2rem',
                      fontFamily: 'var(--font-headings)',
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: '1.2',
                      margin: 0
                    }}>
                      Welcome back
                    </h2>
                    {/* Thin elegant gradient divider line centered under the title */}
                    <div style={{ 
                      position: 'relative', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '190px', 
                      height: '9px', 
                      marginTop: '4px'
                    }}>
                      {/* Gradient Line */}
                      <div style={{ 
                        width: '80px', 
                        height: '1px', 
                        background: 'linear-gradient(to right, transparent, rgba(20, 184, 166, 0.4), rgba(139, 92, 246, 0.4), transparent)' 
                      }} />
                      {/* Glowing Center Dot */}
                      <div style={{ 
                        position: 'absolute', 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        backgroundColor: '#fff', 
                        boxShadow: '0 0 6px rgba(20, 184, 166, 0.8), 0 0 2px rgba(139, 92, 246, 0.6)' 
                      }} />
                    </div>
                  </div>
                  <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                    fontWeight: 400,
                    lineHeight: '1.55',
                    maxWidth: '540px'
                  }}>
                    “Create balance through small daily practices. Track patterns, not perfection.”
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                  }}>
                    Your body and mind deserve a gentle reset.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleOpenEntryModal()} className="btn btn-primary">
                      <Plus size={16} />
                      <span>Log Practice</span>
                    </button>
                    <button onClick={() => setCurrentTab('breathing')} className="btn btn-secondary">
                      <span>Start Breathing</span>
                    </button>
                  </div>
                </div>

                {/* Right visual column */}
                <div className="yoga-illustration">
                  <div className="yoga-sun" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(167, 139, 250, 0.08) 50%, transparent 75%)' }} />
                  <div className="yoga-ring yoga-ring-1" />
                  <div className="yoga-ring yoga-ring-2" />
                  <img 
                    src={circleLogo} 
                    alt="BalanceFlow Brand Symbol" 
                    style={{
                      borderRadius: '50%',
                      boxShadow: '0 0 35px rgba(20, 184, 166, 0.35), 0 0 70px rgba(167, 139, 250, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.12)',
                      zIndex: 3,
                      animation: 'floatLotus 5s ease-in-out infinite',
                      position: 'absolute'
                    }} 
                    className="hero-logo-img"
                  />
                  {/* Soft water/light reflection effect under the logo */}
                  <img 
                    src={circleLogo} 
                    alt="" 
                    style={{
                      borderRadius: '50%',
                      transform: 'scaleY(-0.7) translateY(125px) scale(0.95)',
                      opacity: 0.18,
                      filter: 'blur(5px) contrast(0.8) brightness(1.2)',
                      zIndex: 2,
                      position: 'absolute',
                      pointerEvents: 'none',
                      maskImage: 'linear-gradient(to top, transparent 20%, rgba(0,0,0,0.8) 100%)',
                      WebkitMaskImage: 'linear-gradient(to top, transparent 20%, rgba(0,0,0,0.8) 100%)',
                      animation: 'floatLotus 5s ease-in-out infinite'
                    }}
                    className="hero-logo-img"
                  />
                  {/* Floating Particles */}
                  <div className="glow-particle" style={{ bottom: '20%', left: '15%', '--particle-drift': '15px', animationDelay: '0s', width: '4px', height: '4px' } as React.CSSProperties} />
                  <div className="glow-particle" style={{ bottom: '25%', left: '35%', '--particle-drift': '-10px', animationDelay: '1.5s', width: '5px', height: '5px' } as React.CSSProperties} />
                  <div className="glow-particle" style={{ bottom: '30%', left: '55%', '--particle-drift': '20px', animationDelay: '3s', width: '3px', height: '3px' } as React.CSSProperties} />
                  <div className="glow-particle" style={{ bottom: '22%', left: '75%', '--particle-drift': '-8px', animationDelay: '4.5s', width: '4px', height: '4px' } as React.CSSProperties} />
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

                  {/* Serene Yoga Illustration Header */}
                  <div style={{
                    height: '135px',
                    borderRadius: '12px',
                    backgroundImage: `linear-gradient(to bottom, rgba(6, 10, 18, 0.15) 0%, rgba(6, 10, 18, 0.75) 100%), url(${wellnessYogaFlow})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 20%',
                    marginBottom: '10px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '16px'
                  }}>
                    <img 
                      src={circleLogo} 
                      alt="" 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '24px',
                        height: '24px',
                        opacity: 0.35,
                        pointerEvents: 'none'
                      }} 
                    />
                    <div style={{
                      color: '#ffffff',
                      fontFamily: 'var(--font-headings)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
                    }}>
                      Mindful Breath & Flow
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '4px', fontFamily: 'var(--font-headings)' }}>
                    12 min Gentle Yoga Reset
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4', maxWidth: '92%' }}>
                    Based on your recent logs showing mild body tension, we recommend this gentle session. It focuses on releasing shoulder tightness and inviting a calm balance.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
                  onClick={() => handleOpenPracticeDetail({
                    id: 'p_recommendation',
                    title: '12 min Gentle Yoga Reset',
                    type: 'Yoga',
                    duration: 12,
                    level: 'Beginner',
                    goal: 'Release shoulder tightness and invite calm balance',
                    description: 'A soothing sequence focused on neck rolls, chest openers, and gentle shoulder stretches. Designed to ease desktop fatigue and quiet active tension.',
                    gradientClass: 'grad-yoga-1',
                    benefits: ['Soothes desk posture fatigue', 'Encourages gentle movement', 'May support calm focus']
                  })}
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start Today’s Flow
                </button>
              </div>

              {/* Your Balance Space Visual Card */}
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <span className="badge badge-lavender">Your Balance Space</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Check-In</span>
                  </div>

                  {/* Glowing Fluid Balance Space Header */}
                  <div style={{
                    height: '130px',
                    borderRadius: '12px',
                    backgroundImage: `linear-gradient(to bottom, rgba(6, 10, 18, 0.1) 0%, rgba(6, 10, 18, 0.7) 100%), url(${balanceSpaceGlow})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '16px'
                  }}>
                    <div className="balance-wave-ring balance-wave-ring-1" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderColor: 'rgba(167, 139, 250, 0.25)', pointerEvents: 'none' }} />
                    <div className="balance-wave-ring balance-wave-ring-2" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderColor: 'rgba(20, 184, 166, 0.25)', pointerEvents: 'none' }} />
                    <img 
                      src={circleLogo} 
                      alt="" 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '24px',
                        height: '24px',
                        opacity: 0.35,
                        pointerEvents: 'none'
                      }} 
                    />
                    <div style={{
                      color: '#ffffff',
                      fontFamily: 'var(--font-headings)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
                    }}>
                      Pause & Reflect
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-headings)' }}>
                    Pause & Reflect
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0, borderLeft: '2px solid var(--color-teal)', paddingLeft: '8px' }}>
                      “Move gently. Breathe slowly. Notice your patterns.”
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, paddingLeft: '10px' }}>
                      “Track patterns, not perfection.”
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEntryModal()}
                  className="btn btn-secondary"
                  style={{
                    backgroundColor: 'rgba(167, 139, 250, 0.08)',
                    borderColor: 'rgba(167, 139, 250, 0.2)',
                    color: 'var(--color-lavender-light)',
                    fontWeight: 600,
                    justifyContent: 'center',
                    padding: '12px',
                    borderRadius: '12px',
                    width: '100%'
                  }}
                >
                  <span>Check In & Reflect</span>
                </button>
              </div>    </div>
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
                {reflections.length > 0 ? (
                  reflections.slice(0, 3).map((ref, idx) => (
                    <div key={idx} style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--text-secondary)', 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      borderLeft: '2px solid var(--color-lavender-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{ fontStyle: 'italic' }}>"{ref.text}"</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {formatEntryDate(ref.createdAt, ref.date)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No reflection notes logged yet. Log reflections inside your wellness entries to list them here.
                  </div>
                )}
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
                  onStart={(p) => handleOpenPracticeDetail(p)} 
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <span className="badge badge-teal" style={{ marginBottom: '8px' }}>Your Progress</span>
                <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>Your Wellness Insights</h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  Review weekly trends, practice impact ratings, and wellness patterns.
                </p>
              </div>

              {/* Data controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {entries.length > 0 ? (
                  <button 
                    onClick={handleClearLogs}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', borderColor: 'rgba(244, 63, 94, 0.25)', color: 'var(--color-rose-soft)' }}
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    <span>Clear Data</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleLoadDemoData}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', borderColor: 'rgba(20, 184, 166, 0.25)', color: 'var(--color-teal-light)' }}
                  >
                    <RefreshCw size={14} style={{ marginRight: '4px' }} />
                    <span>Load Demo Data</span>
                  </button>
                )}
              </div>
            </div>

            {entries.length === 0 ? (
              /* Soft Empty State */
              <div className="glass-panel" style={{
                padding: '60px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(20, 184, 166, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  border: '1.5px solid rgba(20, 184, 166, 0.2)',
                  boxShadow: '0 0 16px rgba(20, 184, 166, 0.15)'
                }}>
                  <img src={circleLogo} alt="BalanceFlow" style={{ width: '30px', height: '30px' }} />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', fontFamily: 'var(--font-headings)' }}>
                  Your Wellness Journal is Empty
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto', lineHeight: '1.5' }}>
                  Start logging your flows, meditation checks, and breathing resets to reveal custom charts, streaks, and AI patterns.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button onClick={() => handleOpenEntryModal()} className="btn btn-primary">
                    <Plus size={16} />
                    <span>Log First Practice</span>
                  </button>
                  <button onClick={handleLoadDemoData} className="btn btn-secondary">
                    <span>Load Mock Demo Data</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Dashboard Grid */
              <>
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
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                  <ChartCard title="Mood & Energy Trend" description="Comparison showing average daily mood vs energy after session." badge="Correlation Scale" badgeType="lavender">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                  <ChartCard title="Sleep Quality Trends" description="Reported sleep quality rating per night." badge="Sleep Quality" badgeType="green">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 10]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="sleep" stroke="var(--color-green-soft)" strokeWidth={3} dot={{ r: 4 }} name="Sleep Rating (1-10)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                </div>
              </>
            )}
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

            {entries.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <img src={circleLogo} alt="" style={{ width: '28px', height: '28px', opacity: 0.5, marginBottom: '4px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  No session logs found to compile your weekly overview.
                </p>
                <button onClick={() => handleOpenEntryModal()} className="btn btn-primary">
                  <Plus size={16} />
                  <span>Log Practice</span>
                </button>
              </div>
            ) : (
              <>
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
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Favorite Practice</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-lavender-light)', fontFamily: 'var(--font-headings)', marginTop: '8px' }}>
                        {bestPracticeType}
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
                    content={aiInsights.pattern.content}
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
              </>
            )}
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
              <span className="badge badge-lavender" style={{ marginBottom: '8px' }}>Mindful Wellness Companion</span>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>Your Wellness Insights</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Review patterns, trends and reflections from your wellness practice.
              </p>
            </div>

            {entries.length === 0 ? (
              /* Beautiful Empty State */
              <div className="glass-panel" style={{
                padding: '60px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                marginTop: '12px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(167, 139, 250, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  border: '1.5px solid rgba(167, 139, 250, 0.2)',
                  boxShadow: '0 0 16px rgba(167, 139, 250, 0.15)'
                }}>
                  <img src={circleLogo} alt="BalanceFlow" style={{ width: '30px', height: '30px' }} />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', fontFamily: 'var(--font-headings)' }}>
                  Your insights will grow with your practice.
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.5' }}>
                  Log a few yoga, meditation or breathing sessions to discover patterns in your stress, energy, mood and sleep.
                </p>
                <button onClick={() => handleOpenEntryModal()} className="btn btn-primary" style={{ marginTop: '8px' }}>
                  <Plus size={16} />
                  <span>Log First Practice</span>
                </button>
              </div>
            ) : (
              <>
                {/* Grid of Cards */}
                <div className="app-grid app-grid-2">
                  <InsightCard 
                    title="Pattern Summary" 
                    badge={aiInsights.pattern.badge}
                    type="pattern"
                    content={aiInsights.pattern.content}
                  />

                  <InsightCard 
                    title="Gentle Recommendation" 
                    badge={aiInsights.recommendation.badge}
                    type="recommendation"
                    content={aiInsights.recommendation.content}
                  />

                  <InsightCard 
                    title="Stress Trend Insight" 
                    badge={aiInsights.stress.badge}
                    type="connection"
                    content={aiInsights.stress.content}
                  />

                  <InsightCard 
                    title="Sleep & Energy Connection" 
                    badge={aiInsights.sleep.badge}
                    type="connection"
                    content={aiInsights.sleep.content}
                  />

                  <InsightCard 
                    title="Reflection Summary" 
                    badge={aiInsights.reflection.badge}
                    type="reflection"
                    content={aiInsights.reflection.content}
                    reflectionPrompt={aiInsights.reflection.prompt}
                    onReflectClick={() => {
                      setCurrentTab('today');
                      setTimeout(() => {
                        const el = document.querySelector('.reflection-input');
                        if (el) (el as HTMLInputElement).focus();
                      }, 150);
                    }}
                  />

                  <InsightCard 
                    title="Next Week Focus" 
                    badge={aiInsights.focus.badge}
                    type="recommendation"
                    content={aiInsights.focus.content}
                  />
                </div>

                <div style={{ marginTop: '24px' }}>
                  <InsightCard 
                    title="How insights are generated"
                    badge="Disclaimer"
                    type="insight"
                    content="Insights are generated from your logged wellness activities and reflections. They are designed to support personal awareness, habit tracking and self-reflection. They are not medical advice, diagnosis or treatment."
                  />
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Practice Detail & Active Guided Timer Modal */}
      {isDetailModalOpen && selectedPracticeForDetail && (
        <PracticeDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          practice={selectedPracticeForDetail}
          onCompleteAndLog={handleCompletePracticeAndLog}
        />
      )}

      {/* Wellness Entry Popup Dialog Modal */}
      {isModalOpen && (
        <EntryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEntry}
          prefilledValues={prefilledValues}
        />
      )}
    </Layout>
  );
}
