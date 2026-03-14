import {
  Music,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  GripVertical,
  ArrowUpFromLine,
  ArrowDownFromLine,
} from 'lucide-react';
import { Badge } from '@netmd-studio/ui';
import { formatDuration, formatFileSize } from '@netmd-studio/utils';
import type { TransferTrack } from '@netmd-studio/types';

interface QueueTrackItemProps {
  track: TransferTrack;
  index: number;
  totalTracks: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isActive: boolean;
}

export function QueueTrackItem({
  track,
  index,
  totalTracks,
  onRemove,
  onMoveUp,
  onMoveDown,
  isActive,
}: QueueTrackItemProps) {
  const StatusIcon = () => {
    switch (track.status) {
      case 'queued':
        return <Music size={14} style={{ color: 'var(--text-tertiary)' }} />;
      case 'encoding':
        return <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />;
      case 'transferring':
        return <Loader2 size={14} className="animate-spin" style={{ color: 'var(--pillar-transfer)' }} />;
      case 'done':
        return <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />;
      case 'error':
        return <AlertCircle size={14} style={{ color: 'var(--error)' }} />;
    }
  };

  const formatBadgeVariant = track.format === 'sp' ? 'cyan' : track.format === 'lp2' ? 'magenta' : 'amber';

  return (
    <div
      className="px-3 py-2.5 flex items-center gap-3 transition-colors"
      style={{
        background: track.status === 'error'
          ? 'rgba(255,51,68,0.05)'
          : isActive
            ? 'var(--surface-3)'
            : undefined,
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Drag handle / reorder */}
      <div className="flex flex-col items-center shrink-0">
        {track.status === 'queued' ? (
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowUpFromLine size={10} />
            </button>
            <GripVertical size={12} style={{ color: 'var(--text-tertiary)' }} />
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === totalTracks - 1}
              className="disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowDownFromLine size={10} />
            </button>
          </div>
        ) : (
          <span className="text-tag font-mono w-4 text-center" style={{ color: 'var(--text-tertiary)' }}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Status icon */}
      <div className="shrink-0">
        <StatusIcon />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-label truncate" style={{ color: 'var(--text-primary)' }}>{track.title}</span>
          <Badge variant={formatBadgeVariant}>{track.format.toUpperCase()}</Badge>
        </div>

        {/* Progress bars */}
        {(track.status === 'encoding' || track.status === 'transferring') && (
          <div className="mt-1.5 space-y-1">
            {/* Encoding progress */}
            <div className="flex items-center gap-2">
              <span className="text-tag w-16 shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                {track.encodeStage === 'decoding' ? 'Decoding' : 'Encoding'}
              </span>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-150"
                  style={{ width: `${track.encodeProgress}%`, background: 'var(--accent)' }}
                />
              </div>
              <span className="text-tag font-mono w-8 text-right" style={{ color: 'var(--text-tertiary)' }}>
                {Math.round(track.encodeProgress)}%
              </span>
            </div>

            {/* Transfer progress (only show when transferring) */}
            {track.status === 'transferring' && (
              <div className="flex items-center gap-2">
                <span className="text-tag w-16 shrink-0" style={{ color: 'var(--text-tertiary)' }}>Transfer</span>
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div
                    className="h-full rounded-full transition-[width] duration-150"
                    style={{ width: `${track.transferProgress}%`, background: 'var(--pillar-transfer)' }}
                  />
                </div>
                <span className="text-tag font-mono w-8 text-right" style={{ color: 'var(--text-tertiary)' }}>
                  {Math.round(track.transferProgress)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {track.status === 'error' && track.error && (
          <p className="text-tag mt-1 truncate" style={{ color: 'var(--error)' }}>{track.error}</p>
        )}

        {/* Done info */}
        {track.status === 'done' && track.duration > 0 && (
          <p className="text-tag mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {formatDuration(Math.round(track.duration))}
            {track.encodedSize ? ` · ${formatFileSize(track.encodedSize)}` : ''}
          </p>
        )}

        {/* Queued info */}
        {track.status === 'queued' && (
          <p className="text-tag mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {track.duration > 0 ? formatDuration(Math.round(track.duration)) : formatFileSize(track.file.size)}
          </p>
        )}
      </div>

      {/* Remove button */}
      {(track.status === 'queued' || track.status === 'error') && (
        <button
          onClick={() => onRemove(track.id)}
          className="transition-colors shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
          title="Remove"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
