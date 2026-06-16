export interface WellnessEntry {
  id: string;
  date: string; // ISO date format "YYYY-MM-DD"
  day: string;  // Short day string "Mon", "Tue", etc.
  type: 'Yoga' | 'Meditation' | 'Breathing';
  title: string;
  duration: number; // in minutes
  intensity: 'Gentle' | 'Moderate' | 'Strong';
  moodBefore: 'Tired' | 'Calm' | 'Happy' | 'Stressed';
  moodAfter: 'Tired' | 'Calm' | 'Happy' | 'Stressed';
  energyBefore: number; // 1-10
  energyAfter: number;  // 1-10
  stressBefore: number; // 1-10
  stressAfter: number;  // 1-10
  sleepQuality: number; // 1-10
  reflection: string;
  created_at?: string;
}

export interface BackendWellnessEntry {
  id: number;
  practice_type: string;
  practice_title: string;
  duration_minutes: number;
  intensity: string;
  mood_before: string;
  mood_after: string;
  energy_before: number;
  energy_after: number;
  stress_before: number;
  stress_after: number;
  sleep_quality: number;
  reflection?: string;
  created_at: string;
}
