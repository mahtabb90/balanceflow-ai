import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

function Harness({ onConfirm = vi.fn() }: { onConfirm?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <ConfirmDialog title="Delete it?" description="Sure?" confirmLabel="Delete" onConfirm={onConfirm} onCancel={() => setOpen(false)} />
      )}
    </>
  );
}

describe('ConfirmDialog', () => {
  it('is an accessible alertdialog that focuses Cancel first', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('alertdialog', { name: 'Delete it?' });
    expect(dialog).toHaveAccessibleDescription('Sure?');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('Open'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByText('Open')).toHaveFocus();
  });

  it('traps Tab focus inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('Open'));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
  });

  it('calls onConfirm only from the confirm button', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows an error and disables buttons while busy', () => {
    render(<ConfirmDialog title="t" description="d" confirmLabel="Delete" busy error="Nope" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Nope');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Deleting/ })).toBeDisabled();
  });
});
