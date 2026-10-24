import type { WellnessEntry } from '../types/wellness';

// Example entries a visitor can explicitly load to explore the app. They are never
// loaded automatically and are always flagged with isSample so they stay distinguishable
// from entries the visitor logs.
const SAMPLE_TEMPLATES: WellnessEntry[] = [
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

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toLocalDateString(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Sample entries re-dated so the most recent one falls on `now` (keeps streaks and weekly views meaningful). */
export function buildSampleEntries(now: Date = new Date()): WellnessEntry[] {
  const parse = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
  };
  const latest = Math.max(...SAMPLE_TEMPLATES.map(e => parse(e.date).getTime()));
  return SAMPLE_TEMPLATES.map(template => {
    const offsetDays = Math.round((latest - parse(template.date).getTime()) / 86_400_000);
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetDays, 12);
    return {
      ...template,
      id: `sample_${template.id}`,
      date: toLocalDateString(when),
      day: DAYS_SHORT[when.getDay()],
      created_at: when.toISOString(),
      isSample: true,
    };
  });
}
