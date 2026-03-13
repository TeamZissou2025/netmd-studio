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
    <div className="bg-studio-surface border border-studio-border rounded-studio-lg">
      <div className="px-4 py-3 border-b border-studio-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-studio-text flex items-center gap-2">
          <List size={16} className="text-studio-magenta" />
          Disc Contents
        </h3>
        <span className="text-2xs font-mono text-studio-text-dim">
          {toc.trackCount} track{toc.trackCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Disc title */}
      <div className="px-4 py-2 border-b border-studio-border bg-studio-black/50">
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
              className="flex-1 h-6 bg-studio-black border border-studio-cyan-border rounded px-2 text-xs text-studio-text outline-none"
              autoFocus
              maxLength={120}
            />
            <button onClick={confirmEditTitle} className="text-studio-success hover:opacity-80">
              <Check size={14} />
            </button>
            <button onClick={cancelEditTitle} className="text-studio-text-dim hover:text-studio-text">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <span className="text-xs text-studio-text-muted truncate">
              {toc.title || 'Untitled Disc'}
            </span>
            <button
              onClick={startEditTitle}
              className="opacity-0 group-hover:opacity-100 text-studio-text-dim hover:text-studio-text transition-opacity"
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
            <Disc3 size={24} className="text-studio-text-dim mb-2" />
            <p className="text-xs text-studio-text-dim">Disc is empty</p>
          </div>
        ) : (
          <ul className="divide-y divide-studio-border">
            {toc.tracks.map((track) => (
              <li
                key={track.index}
                className="px-4 py-2 flex items-center gap-3 hover:bg-studio-surface-hover group"
              >
                <span className="text-2xs font-mono text-studio-text-dim w-5 text-right shrink-0">
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
                      className="flex-1 h-6 bg-studio-black border border-studio-cyan-border rounded px-2 text-xs text-studio-text outline-none"
                      autoFocus
                      maxLength={120}
                    />
                    <button onClick={confirmEditTrack} className="text-studio-success hover:opacity-80">
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEditTrack} className="text-studio-text-dim hover:text-studio-text">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-xs text-studio-text truncate">
                      {track.title || 'Untitled'}
                    </span>
                    {formatBadge(track.encoding)}
                    <span className="text-2xs font-mono text-studio-text-dim w-10 text-right shrink-0">
                      {formatDuration(track.durationSeconds)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => startEditTrack(track)}
                        className="text-studio-text-dim hover:text-studio-text"
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
