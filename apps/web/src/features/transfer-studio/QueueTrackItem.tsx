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
        return <Music size={14} className="text-studio-text-dim" />;
      case 'encoding':
        return <Loader2 size={14} className="text-studio-cyan animate-spin" />;
      case 'transferring':
        return <Loader2 size={14} className="text-studio-magenta animate-spin" />;
      case 'done':
        return <CheckCircle2 size={14} className="text-studio-success" />;
      case 'error':
        return <AlertCircle size={14} className="text-studio-error" />;
    }
  };

  const formatBadgeVariant = track.format === 'sp' ? 'cyan' : track.format === 'lp2' ? 'magenta' : 'amber';

  return (
    <div
      className={`px-3 py-2.5 flex items-center gap-3 transition-colors ${
        isActive ? 'bg-studio-surface-active' : 'hover:bg-studio-surface-hover'
      } ${track.status === 'error' ? 'bg-red-500/5' : ''}`}
    >
      {/* Drag handle / reorder */}
      <div className="flex flex-col items-center shrink-0">
        {track.status === 'queued' ? (
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="text-studio-text-dim hover:text-studio-text disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ArrowUpFromLine size={10} />
            </button>
            <GripVertical size={12} className="text-studio-text-dim" />
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === totalTracks - 1}
              className="text-studio-text-dim hover:text-studio-text disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ArrowDownFromLine size={10} />
            </button>
          </div>
        ) : (
          <span className="text-2xs font-mono text-studio-text-dim w-4 text-center">
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
          <span className="text-xs text-studio-text truncate">{track.title}</span>
          <Badge variant={formatBadgeVariant}>{track.format.toUpperCase()}</Badge>
        </div>

        {/* Progress bars */}
        {(track.status === 'encoding' || track.status === 'transferring') && (
          <div className="mt-1.5 space-y-1">
            {/* Encoding progress */}
            <div className="flex items-center gap-2">
              <span className="text-2xs text-studio-text-dim w-16 shrink-0">
                {track.encodeStage === 'decoding' ? 'Decoding' : 'Encoding'}
              </span>
              <div className="flex-1 h-1 bg-studio-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-studio-cyan rounded-full transition-[width] duration-150"
                  style={{ width: `${track.encodeProgress}%` }}
                />
              </div>
              <span className="text-2xs font-mono text-studio-text-dim w-8 text-right">
                {Math.round(track.encodeProgress)}%
              </span>
            </div>

            {/* Transfer progress (only show when transferring) */}
            {track.status === 'transferring' && (
              <div className="flex items-center gap-2">
                <span className="text-2xs text-studio-text-dim w-16 shrink-0">Transfer</span>
                <div className="flex-1 h-1 bg-studio-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-studio-magenta rounded-full transition-[width] duration-150"
                    style={{ width: `${track.transferProgress}%` }}
                  />
                </div>
                <span className="text-2xs font-mono text-studio-text-dim w-8 text-right">
                  {Math.round(track.transferProgress)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {track.status === 'error' && track.error && (
          <p className="text-2xs text-studio-error mt-1 truncate">{track.error}</p>
        )}

        {/* Done info */}
        {track.status === 'done' && track.duration > 0 && (
          <p className="text-2xs text-studio-text-dim mt-0.5">
            {formatDuration(Math.round(track.duration))}
            {track.encodedSize ? ` · ${formatFileSize(track.encodedSize)}` : ''}
          </p>
        )}

        {/* Queued info */}
        {track.status === 'queued' && (
          <p className="text-2xs text-studio-text-dim mt-0.5">
            {track.duration > 0 ? formatDuration(Math.round(track.duration)) : formatFileSize(track.file.size)}
          </p>
        )}
      </div>

      {/* Remove button */}
      {(track.status === 'queued' || track.status === 'error') && (
        <button
          onClick={() => onRemove(track.id)}
          className="text-studio-text-dim hover:text-studio-error transition-colors shrink-0"
          title="Remove"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
