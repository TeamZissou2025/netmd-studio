import { useState } from 'react';
import { List, Pencil, Trash2, Check, X, Disc3, Loader2 } from 'lucide-react';
import { Badge, Button } from '@netmd-studio/ui';
import { formatDuration } from '@netmd-studio/utils';
import { useDeviceConnection } from './useDeviceConnection';
import type { DiscTrack } from '@netmd-studio/netmd';
import toast from 'react-hot-toast';

export function DiscTOCPanel() {
  const { toc, renameTrack, renameDisc, deleteTrack, eraseDisc } = useDeviceConnection();
  const [editingTrack, setEditingTrack] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const [confirmAction, setConfirmAction] = useState<{
    type: 'eraseDisc' | 'deleteTrack';
    trackIndex?: number;
    trackTitle?: string;
  } | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  if (!toc) return null;

  const startEditTrack = (track: DiscTrack) => {
    setEditingTrack(track.index);
    setEditValue(track.title);
  };

  const confirmEditTrack = async () => {
    if (editingTrack !== null) {
      await renameTrack(editingTrack, editValue);
      setEditingTrack(null);
    }
  };

  const cancelEditTrack = () => {
    setEditingTrack(null);
    setEditValue('');
  };

  const startEditTitle = () => {
    setEditingTitle(true);
    setTitleValue(toc.title);
  };

  const confirmEditTitle = async () => {
    await renameDisc(titleValue);
    setEditingTitle(false);
  };

  const cancelEditTitle = () => {
    setEditingTitle(false);
    setTitleValue('');
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionInProgress(true);
    try {
      if (confirmAction.type === 'eraseDisc') {
        const ok = await eraseDisc();
        if (ok) toast.success('Disc erased');
      } else if (confirmAction.type === 'deleteTrack' && confirmAction.trackIndex !== undefined) {
        const ok = await deleteTrack(confirmAction.trackIndex);
        if (ok) toast.success(`Deleted track ${confirmAction.trackIndex + 1}`);
      }
    } finally {
      setActionInProgress(false);
      setConfirmAction(null);
    }
  };

  const formatBadge = (encoding: string) => {
    switch (encoding) {
      case 'sp': return <Badge variant="cyan">SP</Badge>;
      case 'lp2': return <Badge variant="magenta">LP2</Badge>;
      case 'lp4': return <Badge variant="amber">LP4</Badge>;
      default: return <Badge>{encoding}</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-nav font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <List size={16} style={{ color: 'var(--pillar-transfer)' }} />
            Disc Contents
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {toc.trackCount} track{toc.trackCount !== 1 ? 's' : ''}
            </span>
            {toc.trackCount > 0 && (
              <button
                onClick={() => setConfirmAction({ type: 'eraseDisc' })}
                title="Erase disc"
                style={{ color: 'var(--error)', opacity: 0.6 }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Disc title */}
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-0) 50%, transparent)' }}>
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEditTitle();
                  if (e.key === 'Escape') cancelEditTitle();
                }}
                className="flex-1 h-6 rounded px-2 text-label outline-none"
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)' }}
                autoFocus
                maxLength={120}
              />
              <button onClick={confirmEditTitle} style={{ color: 'var(--success)' }}>
                <Check size={14} />
              </button>
              <button onClick={cancelEditTitle} style={{ color: 'var(--text-tertiary)' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <span className="text-label truncate" style={{ color: 'var(--text-secondary)' }}>
                {toc.title || 'Untitled Disc'}
              </span>
              <button
                onClick={startEditTitle}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Track list */}
        <div className="max-h-[300px] overflow-y-auto">
          {toc.tracks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Disc3 size={24} className="mb-2" style={{ color: 'var(--text-tertiary)' }} />
              <p className="text-label" style={{ color: 'var(--text-tertiary)' }}>Disc is empty</p>
            </div>
          ) : (
            <ul>
              {toc.tracks.map((track) => (
                <li
                  key={track.index}
                  className="px-4 py-2 flex items-center gap-3 group"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  {/* Track number */}
                  <span className="text-tag font-mono w-5 text-right shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {track.index + 1}
                  </span>

                  {editingTrack === track.index ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEditTrack();
                          if (e.key === 'Escape') cancelEditTrack();
                        }}
                        className="flex-1 h-6 rounded px-2 text-label outline-none"
                        style={{ background: 'var(--surface-0)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)' }}
                        autoFocus
                        maxLength={120}
                      />
                      <button onClick={confirmEditTrack} style={{ color: 'var(--success)' }}>
                        <Check size={14} />
                      </button>
                      <button onClick={cancelEditTrack} style={{ color: 'var(--text-tertiary)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Title */}
                      <span className="flex-1 text-label truncate" style={{ color: 'var(--text-primary)' }}>
                        {track.title || 'Untitled'}
                      </span>

                      {/* Encoding badge */}
                      {formatBadge(track.encoding)}

                      {/* Duration */}
                      <span className="text-tag font-mono w-10 text-right shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                        {formatDuration(track.durationSeconds)}
                      </span>

                      {/* Rename — hover only */}
                      <button
                        onClick={() => startEditTrack(track)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Rename"
                      >
                        <Pencil size={12} />
                      </button>

                      {/* Delete — always visible */}
                      <button
                        onClick={() => setConfirmAction({
                          type: 'deleteTrack',
                          trackIndex: track.index,
                          trackTitle: track.title || 'Untitled',
                        })}
                        title="Delete track"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => !actionInProgress && setConfirmAction(null)}
        >
          <div
            className="rounded-xl p-6 w-full max-w-sm mx-4 space-y-4"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
              {confirmAction.type === 'eraseDisc' ? 'Erase Disc' : 'Delete Track'}
            </h3>
            <p className="text-label" style={{ color: 'var(--text-secondary)' }}>
              {confirmAction.type === 'eraseDisc'
                ? 'Erase all tracks from this disc? This cannot be undone.'
                : `Delete track ${(confirmAction.trackIndex ?? 0) + 1}: ${confirmAction.trackTitle}?`}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setConfirmAction(null)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmAction}
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {confirmAction.type === 'eraseDisc' ? 'Erasing...' : 'Deleting...'}
                  </>
                ) : (
                  confirmAction.type === 'eraseDisc' ? 'Erase Disc' : 'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
