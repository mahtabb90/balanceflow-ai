import type { Reflection, WellnessEntry } from '../types/wellness';

/**
 * Browser-local storage for the demo experience.
 *
 * Everything here stays in this browser: it never syncs between devices and is lost
 * when the visitor clears site data. Stored values can be edited by the visitor, so
 * every read is validated and anything malformed is dropped.
 */

export const STORAGE_KEYS = {
  entries: 'balanceflow.demo.v1.entries',
  reflections: 'balanceflow.demo.v1.reflections',
  prefs: 'balanceflow.demo.v1.prefs',
} as const;

export const MAX_REFLECTION_LENGTH = 500;
const MAX_ENTRIES = 500;
const MAX_REFLECTIONS = 200;

export interface DemoPrefs {
  /** Whether reflection text may be sent for AI analysis. Off unless the visitor opts in. */
  includeReflectionsInAI: boolean;
}

const TYPES = ['Yoga', 'Meditation', 'Breathing'];
const INTENSITIES = ['Gentle', 'Moderate', 'Strong'];
const MOODS = ['Tired', 'Calm', 'Happy', 'Stressed'];

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null; // blocked (private mode, disabled site data)
  }
}

function readJSON(key: string): unknown {
  try {
    const raw = getStorage()?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // quota exceeded or storage unavailable
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isScale = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 1 && v <= 10;

function parseEntry(v: unknown): WellnessEntry | null {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'string' || typeof v.date !== 'string' || typeof v.day !== 'string') return null;
  if (typeof v.title !== 'string' || v.title.length === 0 || v.title.length > 80) return null;
  if (!TYPES.includes(v.type as string) || !INTENSITIES.includes(v.intensity as string)) return null;
  if (!MOODS.includes(v.moodBefore as string) || !MOODS.includes(v.moodAfter as string)) return null;
  if (typeof v.duration !== 'number' || !Number.isFinite(v.duration) || v.duration < 1 || v.duration > 600) return null;
  if (![v.energyBefore, v.energyAfter, v.stressBefore, v.stressAfter, v.sleepQuality].every(isScale)) return null;
  const reflection = typeof v.reflection === 'string' ? v.reflection.slice(0, MAX_REFLECTION_LENGTH) : '';
  return {
    id: v.id,
    date: v.date,
    day: v.day,
    type: v.type as WellnessEntry['type'],
    title: v.title,
    duration: v.duration,
    intensity: v.intensity as WellnessEntry['intensity'],
    moodBefore: v.moodBefore as WellnessEntry['moodBefore'],
    moodAfter: v.moodAfter as WellnessEntry['moodAfter'],
    energyBefore: v.energyBefore as number,
    energyAfter: v.energyAfter as number,
    stressBefore: v.stressBefore as number,
    stressAfter: v.stressAfter as number,
    sleepQuality: v.sleepQuality as number,
    reflection,
    created_at: typeof v.created_at === 'string' ? v.created_at : undefined,
    ...(v.isSample === true ? { isSample: true } : {}),
  };
}

function parseReflection(v: unknown): Reflection | null {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'string' || typeof v.text !== 'string' || typeof v.createdAt !== 'string') return null;
  const text = v.text.trim().slice(0, MAX_REFLECTION_LENGTH);
  if (!text) return null;
  return { id: v.id, text, createdAt: v.createdAt };
}

export function loadEntries(): WellnessEntry[] {
  const data = readJSON(STORAGE_KEYS.entries);
  if (!Array.isArray(data)) return [];
  return data.slice(0, MAX_ENTRIES).map(parseEntry).filter((e): e is WellnessEntry => e !== null);
}

export function saveEntries(entries: WellnessEntry[]): boolean {
  return writeJSON(STORAGE_KEYS.entries, entries);
}

export function loadReflections(): Reflection[] {
  const data = readJSON(STORAGE_KEYS.reflections);
  if (!Array.isArray(data)) return [];
  return data.slice(0, MAX_REFLECTIONS).map(parseReflection).filter((r): r is Reflection => r !== null);
}

export function saveReflections(reflections: Reflection[]): boolean {
  return writeJSON(STORAGE_KEYS.reflections, reflections);
}

export function loadPrefs(): DemoPrefs {
  const data = readJSON(STORAGE_KEYS.prefs);
  return { includeReflectionsInAI: isRecord(data) && data.includeReflectionsInAI === true };
}

export function savePrefs(prefs: DemoPrefs): boolean {
  return writeJSON(STORAGE_KEYS.prefs, prefs);
}

export function newId(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${random}`;
}

/** Date helpers for entries logged now, in the visitor's local time zone. */
export function localDateParts(now: Date = new Date()): { date: string; day: string } {
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return { date: `${now.getFullYear()}-${month}-${day}`, day: daysShort[now.getDay()] };
}
