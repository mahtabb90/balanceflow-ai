import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickReflection } from './QuickReflection';
import type { Reflection } from '../types/wellness';

const list: Reflection[] = [
  { id: 'r1', text: 'First note', createdAt: '2026-06-08T10:00:00Z' },
  { id: 'r2', text: 'Second note', createdAt: '2026-06-09T10:00:00Z' },
];

describe('QuickReflection', () => {
  it('shows a friendly empty state and the local-storage explanation', () => {
    render(<QuickReflection reflections={[]} onAdd={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/No reflections yet/)).toBeInTheDocument();
    expect(screen.getByText(/saved in this browser only/i)).toBeInTheDocument();
  });

  it('adds a trimmed reflection and clears the input', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<QuickReflection reflections={[]} onAdd={onAdd} onDelete={vi.fn()} />);
    await user.type(screen.getByLabelText('Quick reflection'), '  feeling calm  ');
    await user.click(screen.getByRole('button', { name: /Log/ }));
    expect(onAdd).toHaveBeenCalledWith('feeling calm');
    expect(screen.getByLabelText('Quick reflection')).toHaveValue('');
  });

  it('deletes only the selected reflection after confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockReturnValue(true);
    render(<QuickReflection reflections={list} onAdd={vi.fn()} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /Delete reflection: First note/ }));
    expect(onDelete).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText(/First note/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('r1');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does not delete when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockReturnValue(true);
    render(<QuickReflection reflections={list} onAdd={vi.fn()} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /Delete reflection: Second note/ }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and explains the problem when deletion cannot be saved', async () => {
    const user = userEvent.setup();
    render(<QuickReflection reflections={list} onAdd={vi.fn()} onDelete={vi.fn().mockReturnValue(false)} />);
    await user.click(screen.getByRole('button', { name: /Delete reflection: First note/ }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/was not deleted/);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('shows newest first and offers to expand beyond three', async () => {
    const user = userEvent.setup();
    const many: Reflection[] = Array.from({ length: 5 }, (_, i) => ({
      id: `r${i}`, text: `note ${i}`, createdAt: `2026-06-0${i + 1}T10:00:00Z`,
    }));
    render(<QuickReflection reflections={many} onAdd={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('note 4');
    await user.click(screen.getByRole('button', { name: 'Show all (5)' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
});
