import { describe, it, expect } from 'vitest';
import { buildSampleEntries } from './sampleEntries';

describe('buildSampleEntries', () => {
  it('flags every entry as sample with unique ids', () => {
    const samples = buildSampleEntries();
    expect(samples.length).toBeGreaterThan(0);
    expect(samples.every(e => e.isSample === true)).toBe(true);
    expect(new Set(samples.map(e => e.id)).size).toBe(samples.length);
  });

  it('re-dates entries so the latest one is today and none are in the future', () => {
    const now = new Date(2026, 9, 24, 15, 0);
    const dates = buildSampleEntries(now).map(e => e.date).sort();
    expect(dates[dates.length - 1]).toBe('2026-10-24');
    expect(dates[0] <= '2026-10-24').toBe(true);
  });
});
