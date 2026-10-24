import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEYS, loadEntries, loadReflections } from './services/localStore';

const session = {
  id: 'e1', date: '2026-06-08', day: 'Mon', type: 'Yoga', title: 'Morning Flow', duration: 15, intensity: 'Gentle',
  moodBefore: 'Tired', moodAfter: 'Calm', energyBefore: 5, energyAfter: 7, stressBefore: 6, stressAfter: 4,
  sleepQuality: 7, reflection: 'note attached to the practice',
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockRejectedValue(new Error('network disabled in tests'));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('Today page with browser-local data', () => {
  it('labels the experience as a local demo and starts with no sample data', () => {
    render(<App />);
    expect(screen.getByText(/Local demo\./)).toBeInTheDocument();
    expect(loadEntries()).toEqual([]);
    expect(screen.getByText(/No reflections yet/)).toBeInTheDocument();
  });

  it('never calls the shared-data API', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Quick reflection'), 'hello');
    await user.click(screen.getByRole('button', { name: /Log$/ }));
    const urls = fetchMock.mock.calls.map(c => String(c[0]));
    expect(urls.filter(u => u.includes('/api/entries') || u.includes('/api/stats') || u.includes('/api/reports'))).toEqual([]);
  });

  it('saves a reflection locally, deletes it after confirmation, and the deletion survives a reload', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify([session]));
    const { unmount } = render(<App />);

    await user.type(screen.getByLabelText('Quick reflection'), 'a calm morning');
    await user.click(screen.getByRole('button', { name: /Log$/ }));
    expect(loadReflections().map(r => r.text)).toEqual(['a calm morning']);
    // Quick Reflection must not create a practice session
    expect(loadEntries()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /Delete reflection: a calm morning/ }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    expect(screen.queryByText(/a calm morning/)).not.toBeInTheDocument();
    expect(screen.getByText(/No reflections yet/)).toBeInTheDocument();

    unmount();
    render(<App />);
    expect(screen.queryByText(/a calm morning/)).not.toBeInTheDocument();
    expect(loadReflections()).toEqual([]);
    // Practice sessions, including their attached notes, are untouched
    const entries = loadEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].reflection).toBe('note attached to the practice');
  });
});
