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
}
