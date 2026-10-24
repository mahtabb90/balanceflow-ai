import type { WellnessEntry, Reflection, AIInsightsResponse } from '../types/wellness';

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

export interface DemoInsightsPayload {
  entries: Record<string, string | number | null>[];
  reflections: string[];
  include_reflections: boolean;
}

function entryTimestamp(entry: WellnessEntry): string {
  if (entry.created_at) return entry.created_at;
  const [y, m, d] = entry.date.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12).toISOString();
}

/**
 * Build the request body for the stateless insights endpoint from this visitor's local data.
 * Free-text reflections are only included when the visitor has explicitly opted in.
 */
export function buildDemoInsightsPayload(
  entries: WellnessEntry[],
  reflections: Reflection[],
  includeReflections: boolean,
): DemoInsightsPayload {
  return {
    entries: entries.slice(-100).map(entry => ({
      practice_type: entry.type,
      practice_title: entry.title.slice(0, 80),
      duration_minutes: entry.duration,
      intensity: entry.intensity,
      mood_before: entry.moodBefore,
      mood_after: entry.moodAfter,
      energy_before: entry.energyBefore,
      energy_after: entry.energyAfter,
      stress_before: entry.stressBefore,
      stress_after: entry.stressAfter,
      sleep_quality: entry.sleepQuality,
      reflection: includeReflections && entry.reflection ? entry.reflection.slice(0, 500) : null,
      created_at: entryTimestamp(entry),
    })),
    reflections: includeReflections ? reflections.slice(0, 20).map(r => r.text.slice(0, 500)) : [],
    include_reflections: includeReflections,
  };
}

/** Ask the backend for insights from this visitor's local data. Nothing is stored server-side. */
export async function getDemoInsights(
  entries: WellnessEntry[],
  reflections: Reflection[],
  includeReflections: boolean,
): Promise<AIInsightsResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/demo/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildDemoInsightsPayload(entries, reflections, includeReflections)),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch AI insights: ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
