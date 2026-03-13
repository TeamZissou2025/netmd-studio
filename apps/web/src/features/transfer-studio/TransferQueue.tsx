import { Play, Pause, Square, Trash2, ListMusic } from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import { useTransferQueue } from './useTransferQueue';
import { QueueTrackItem } from './QueueTrackItem';
import { DropZone } from './DropZone';

export function TransferQueue() {
  const {
    tracks,
    isTransferring,
    isPaused,
    overallProgress,
    currentTrackIndex,
    addFiles,
    removeTrack,
    clearQueue,
    reorderTrack,
    startTransfer,
    pauseTransfer,
    resumeTransfer,
    cancelTransfer,
  } = useTransferQueue();

  const queuedCount = tracks.filter((t) => t.status === 'queued').length;
  const doneCount = tracks.filter((t) => t.status === 'done').length;
  const hasQueuedTracks = queuedCount > 0;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <DropZone onFilesAdded={addFiles} disabled={isTransferring} />

      {/* Queue */}
      {tracks.length > 0 && (
        <div className="bg-studio-surface border border-studio-border rounded-studio-lg overflow-hidden">
          {/* Queue header */}
          <div className="px-4 py-3 border-b border-studio-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-studio-text flex items-center gap-2">
              <ListMusic size={16} className="text-studio-magenta" />
              Transfer Queue
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xs text-studio-text-dim">
                {doneCount}/{tracks.length} complete
              </span>
              {!isTransferring && tracks.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="text-studio-text-dim hover:text-studio-error transition-colors"
                  title="Clear queue"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Overall progress bar */}
          {isTransferring && (
            <div className="px-4 py-2 border-b border-studio-border bg-studio-black/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xs text-studio-text-muted">
                  {isPaused ? 'Paused' : `Transferring track ${currentTrackIndex + 1} of ${tracks.length}`}
                </span>
                <span className="text-2xs font-mono text-studio-magenta">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <div className="h-1.5 bg-studio-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-studio-cyan to-studio-magenta rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Track list */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-studio-border">
            {tracks.map((track, i) => (
              <QueueTrackItem
                key={track.id}
                track={track}
                index={i}
                totalTracks={tracks.length}
                onRemove={removeTrack}
                onMoveUp={(idx) => reorderTrack(idx, idx - 1)}
                onMoveDown={(idx) => reorderTrack(idx, idx + 1)}
                isActive={i === currentTrackIndex}
              />
            ))}
          </div>

          {/* Queue controls */}
          <div className="px-4 py-3 border-t border-studio-border flex items-center gap-2">
            {!isTransferring ? (
              <Button
                variant="primary"
                onClick={startTransfer}
                disabled={!hasQueuedTracks}
                className="flex-1"
              >
                <Play size={14} />
                Start Transfer
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button variant="primary" onClick={resumeTransfer} className="flex-1">
                    <Play size={14} />
                    Resume
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={pauseTransfer} className="flex-1">
                    <Pause size={14} />
                    Pause
                  </Button>
                )}
                <Button variant="danger" onClick={cancelTransfer}>
                  <Square size={14} />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
