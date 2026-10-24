import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  STORAGE_KEYS, loadEntries, saveEntries, loadReflections, saveReflections, loadPrefs, savePrefs, MAX_REFLECTION_LENGTH,
} from './localStore';
import type { WellnessEntry } from '../types/wellness';

const entry = (over: Partial<WellnessEntry> = {}): WellnessEntry => ({
  id: 'e1', date: '2026-06-08', day: 'Mon', type: 'Yoga', title: 'Flow', duration: 15, intensity: 'Gentle',
  moodBefore: 'Tired', moodAfter: 'Calm', energyBefore: 5, energyAfter: 7, stressBefore: 6, stressAfter: 4,
  sleepQuality: 7, reflection: '', ...over,
});

afterEach(() => vi.restoreAllMocks());

describe('localStore', () => {
  it('starts empty for a new visitor (no sample data is loaded automatically)', () => {
    expect(loadEntries()).toEqual([]);
    expect(loadReflections()).toEqual([]);
    expect(loadPrefs()).toEqual({ includeReflectionsInAI: false });
  });

  it('round-trips entries, reflections and prefs', () => {
    expect(saveEntries([entry({ isSample: true })])).toBe(true);
    expect(saveReflections([{ id: 'r1', text: 'calm', createdAt: '2026-06-08T10:00:00Z' }])).toBe(true);
    expect(savePrefs({ includeReflectionsInAI: true })).toBe(true);
    expect(loadEntries()[0].isSample).toBe(true);
    expect(loadReflections()).toHaveLength(1);
    expect(loadPrefs().includeReflectionsInAI).toBe(true);
  });

  it('ignores corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEYS.entries, '{not json');
    localStorage.setItem(STORAGE_KEYS.reflections, 'nope');
    expect(loadEntries()).toEqual([]);
    expect(loadReflections()).toEqual([]);
  });

  it('drops malformed or tampered records but keeps valid ones', () => {
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify([
      entry(), entry({ id: 'bad1', type: 'Hacking' as never }), entry({ id: 'bad2', stressBefore: 99 }), 'junk', null,
    ]));
    localStorage.setItem(STORAGE_KEYS.reflections, JSON.stringify([
      { id: 'r1', text: 'ok', createdAt: 'x' }, { id: 'r2', text: '   ', createdAt: 'x' }, { id: 3 },
    ]));
    expect(loadEntries().map(e => e.id)).toEqual(['e1']);
    expect(loadReflections().map(r => r.id)).toEqual(['r1']);
  });

  it('caps reflection length on read', () => {
    localStorage.setItem(STORAGE_KEYS.reflections, JSON.stringify([
      { id: 'r1', text: 'x'.repeat(MAX_REFLECTION_LENGTH + 100), createdAt: 'x' },
    ]));
    expect(loadReflections()[0].text).toHaveLength(MAX_REFLECTION_LENGTH);
  });

  it('reports failure instead of throwing when storage is full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    expect(saveEntries([entry()])).toBe(false);
    expect(saveReflections([])).toBe(false);
  });

  it('falls back to defaults when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(loadEntries()).toEqual([]);
    expect(loadPrefs().includeReflectionsInAI).toBe(false);
  });
});
