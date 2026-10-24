import { describe, it, expect, vi, afterEach } from 'vitest';
import * as api from './apiService';
import type { WellnessEntry, Reflection } from '../types/wellness';

const entry: WellnessEntry = {
  id: 'e1', date: '2026-06-08', day: 'Mon', type: 'Yoga', title: 'Flow', duration: 15, intensity: 'Gentle',
  moodBefore: 'Tired', moodAfter: 'Calm', energyBefore: 5, energyAfter: 7, stressBefore: 6, stressAfter: 4,
  sleepQuality: 7, reflection: 'PRIVATE-ENTRY-NOTE', created_at: '2026-06-08T10:00:00.000Z',
};
const reflections: Reflection[] = [{ id: 'r1', text: 'PRIVATE-QUICK-NOTE', createdAt: '2026-06-08T11:00:00Z' }];

afterEach(() => vi.unstubAllGlobals());

describe('demo insights payload', () => {
  it('contains no free text unless the visitor opts in', () => {
    const body = JSON.stringify(api.buildDemoInsightsPayload([entry], reflections, false));
    expect(body).not.toContain('PRIVATE');
    expect(JSON.parse(body).include_reflections).toBe(false);
  });

  it('includes reflection text only after explicit opt-in', () => {
    const body = JSON.stringify(api.buildDemoInsightsPayload([entry], reflections, true));
    expect(body).toContain('PRIVATE-ENTRY-NOTE');
    expect(body).toContain('PRIVATE-QUICK-NOTE');
  });
});

describe('API surface', () => {
  it('no longer exposes shared-database entry functions', () => {
    for (const name of ['getEntries', 'createEntry', 'deleteEntry', 'deleteAllEntries']) {
      expect(name in api).toBe(false);
    }
  });

  it('posts visitor data to the stateless endpoint only', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ source: 'fallback' }) });
    vi.stubGlobal('fetch', fetchMock);
    await api.getDemoInsights([entry], reflections, false);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/demo\/insights$/);
    expect(init.method).toBe('POST');
  });

  it('rejects when the server answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    await expect(api.getDemoInsights([entry], [], false)).rejects.toThrow();
  });
});
