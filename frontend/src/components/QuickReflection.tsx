import React, { useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import type { Reflection } from '../types/wellness';
import { formatEntryDate } from '../services/apiService';
import { MAX_REFLECTION_LENGTH } from '../services/localStore';
import { ConfirmDialog } from './ConfirmDialog';

interface QuickReflectionProps {
  reflections: Reflection[];
  onAdd: (text: string) => void;
  /** Returns false when the deletion could not be saved (for example storage is unavailable). */
  onDelete: (id: string) => boolean | Promise<boolean>;
}

const VISIBLE_COUNT = 3;

/** Quick Reflection notes. Stored separately from practice sessions: deleting a note never touches a session. */
export const QuickReflection: React.FC<QuickReflectionProps> = ({ reflections, onAdd, onDelete }) => {
  const [text, setText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Reflection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sorted = [...reflections].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visible = showAll ? sorted : sorted.slice(0, VISIBLE_COUNT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  const closeDialog = () => {
    setPendingDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const ok = await onDelete(pendingDelete.id);
      if (ok) {
        setPendingDelete(null);
      } else {
        setDeleteError('Could not update this browser’s storage. Your reflection was not deleted.');
      }
    } catch {
      setDeleteError('Something went wrong. Your reflection was not deleted.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <MessageSquare size={18} style={{ color: 'var(--color-lavender-light)' }} />
        <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Quick Reflection</h3>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_REFLECTION_LENGTH}
          aria-label="Quick reflection"
          placeholder="Record how your body or mind feels right now..."
          style={{
            flex: 1,
            minWidth: '260px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'var(--transition-fast)',
          }}
          className="reflection-input"
        />
        <button type="submit" className="btn btn-secondary" style={{ display: 'flex', gap: '6px' }}>
          <Send size={14} />
          <span>Log</span>
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visible.map((ref) => (
          <li
            key={ref.id}
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              padding: '6px 6px 6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderLeft: '2px solid var(--color-lavender-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}>"{ref.text}"</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatEntryDate(ref.createdAt)}
              </span>
              <button
                type="button"
                className="reflection-delete-btn"
                aria-label={`Delete reflection: ${ref.text.slice(0, 40)}`}
                onClick={() => setPendingDelete(ref)}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      {sorted.length === 0 && (
        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No reflections yet. Write a short note above to start your journal.
        </div>
      )}

      {sorted.length > VISIBLE_COUNT && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowAll(v => !v)}
          style={{ marginTop: '12px', fontSize: '0.78rem', padding: '6px 12px' }}
        >
          {showAll ? 'Show fewer' : `Show all (${sorted.length})`}
        </button>
      )}

      <p style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        Reflections are saved in this browser only. They don’t sync between devices and may be lost if you clear site data.
      </p>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this reflection?"
          description={
            <>
              <span style={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}>"{pendingDelete.text}"</span>
              <br />
              This can’t be undone. Your practice sessions are not affected.
            </>
          }
          confirmLabel="Delete"
          busy={isDeleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
};
