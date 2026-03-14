import { useState } from 'react';
import { List, Pencil, Trash2, Check, X, Disc3 } from 'lucide-react';
import { Badge } from '@netmd-studio/ui';
import { formatDuration } from '@netmd-studio/utils';
import { useDeviceConnection } from './useDeviceConnection';
import type { DiscTrack } from '@netmd-studio/netmd';

export function DiscTOCPanel() {
  const { toc, renameTrack, renameDisc } = useDeviceConnection();
  const [editingTrack, setEditingTrack] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

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

  const formatBadge = (encoding: string) => {
    switch (encoding) {
      case 'sp': return <Badge variant="cyan">SP</Badge>;
      case 'lp2': return <Badge variant="magenta">LP2</Badge>;
      case 'lp4': return <Badge variant="amber">LP4</Badge>;
      default: return <Badge>{encoding}</Badge>;
    }
  };

  return (
    <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-nav font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <List size={16} style={{ color: 'var(--pillar-transfer)' }} />
          Disc Contents
        </h3>
        <span className="text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {toc.trackCount} track{toc.trackCount !== 1 ? 's' : ''}
        </span>
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
            <button onClick={confirmEditTitle} style={{ color: 'var(--success)' }} className="hover:opacity-80">
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
                    <button onClick={confirmEditTrack} style={{ color: 'var(--success)' }} className="hover:opacity-80">
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEditTrack} style={{ color: 'var(--text-tertiary)' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-label truncate" style={{ color: 'var(--text-primary)' }}>
                      {track.title || 'Untitled'}
                    </span>
                    {formatBadge(track.encoding)}
                    <span className="text-tag font-mono w-10 text-right shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDuration(track.durationSeconds)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => startEditTrack(track)}
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Rename"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
