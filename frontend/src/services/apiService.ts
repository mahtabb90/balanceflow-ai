import type { WellnessEntry, BackendWellnessEntry } from '../types/wellness';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

// Helper to parse datetime string safely as UTC if no timezone suffix is present
export function parseUTCDateTime(timestamp: string): Date {
  if (!timestamp) return new Date();
  
  let formatted = timestamp.trim();
  const hasTimezone = formatted.includes('Z') || 
                      formatted.includes('+') || 
                      (formatted.includes('-') && formatted.indexOf('-') !== formatted.lastIndexOf('-') && formatted.split('-').length > 3);
  
  if (!hasTimezone) {
    formatted = formatted.replace(' ', 'T');
    formatted = formatted + 'Z';
  }
  
  return new Date(formatted);
}

// Helper to format timestamps into localized browser dates/times
export function formatEntryDate(createdAt?: string, fallbackDate?: string): string {
  if (!createdAt) {
    if (fallbackDate) {
      const dateParts = fallbackDate.split('-');
      if (dateParts.length === 3) {
        return new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]))
          .toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return fallbackDate;
    }
    return '';
  }

  const localDate = parseUTCDateTime(createdAt);
  return localDate.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Convert backend snake_case model to frontend camelCase type
export function mapBackendToFrontend(entry: BackendWellnessEntry): WellnessEntry {
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const createdDate = parseUTCDateTime(entry.created_at);
  
  // Calculate local date (YYYY-MM-DD) and day in browser local timezone
  const year = createdDate.getFullYear();
  const month = String(createdDate.getMonth() + 1).padStart(2, '0');
  const day = String(createdDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const dayStr = daysShort[createdDate.getDay()] || 'Mon';

  return {
    id: String(entry.id),
    date: dateStr,
    day: dayStr,
    type: entry.practice_type as 'Yoga' | 'Meditation' | 'Breathing',
    title: entry.practice_title,
    duration: entry.duration_minutes,
    intensity: entry.intensity as 'Gentle' | 'Moderate' | 'Strong',
    moodBefore: entry.mood_before as 'Tired' | 'Calm' | 'Happy' | 'Stressed',
    moodAfter: entry.mood_after as 'Tired' | 'Calm' | 'Happy' | 'Stressed',
    energyBefore: entry.energy_before,
    energyAfter: entry.energy_after,
    stressBefore: entry.stress_before,
    stressAfter: entry.stress_after,
    sleepQuality: entry.sleep_quality,
    reflection: entry.reflection || '',
    created_at: entry.created_at,
  };
}

// Convert frontend camelCase log (without id, date, day) to backend snake_case model
export function mapFrontendToBackend(entry: Omit<WellnessEntry, 'id' | 'date' | 'day'>): Omit<BackendWellnessEntry, 'id' | 'created_at'> {
  return {
    practice_type: entry.type,
    practice_title: entry.title,
    duration_minutes: entry.duration,
    intensity: entry.intensity,
    mood_before: entry.moodBefore,
    mood_after: entry.moodAfter,
    energy_before: entry.energyBefore,
    energy_after: entry.energyAfter,
    stress_before: entry.stressBefore,
    stress_after: entry.stressAfter,
    sleep_quality: entry.sleepQuality,
    reflection: entry.reflection || undefined,
  };
}

export async function getEntries(): Promise<WellnessEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/entries`);
  if (!response.ok) {
    throw new Error(`Failed to fetch entries: ${response.statusText}`);
  }
  const data: BackendWellnessEntry[] = await response.json();
  return data.map(mapBackendToFrontend);
}

export async function createEntry(entry: Omit<WellnessEntry, 'id' | 'date' | 'day'>): Promise<WellnessEntry> {
  const backendData = mapFrontendToBackend(entry);
  const response = await fetch(`${API_BASE_URL}/api/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create entry: ${response.statusText}`);
  }
  const data: BackendWellnessEntry = await response.json();
  return mapBackendToFrontend(data);
}

export async function deleteEntry(id: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/entries/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete entry: ${response.statusText}`);
  }
}

export async function deleteAllEntries(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/entries`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete all entries: ${response.statusText}`);
  }
}
