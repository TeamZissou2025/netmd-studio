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
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          {/* Queue header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-nav font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <ListMusic size={16} style={{ color: 'var(--pillar-transfer)' }} />
              Transfer Queue
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-tag" style={{ color: 'var(--text-tertiary)' }}>
                {doneCount}/{tracks.length} complete
              </span>
              {!isTransferring && tracks.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  title="Clear queue"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Overall progress bar */}
          {isTransferring && (
            <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-0) 50%, transparent)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-tag" style={{ color: 'var(--text-secondary)' }}>
                  {isPaused ? 'Paused' : `Transferring track ${currentTrackIndex + 1} of ${tracks.length}`}
                </span>
                <span className="text-tag font-mono" style={{ color: 'var(--pillar-transfer)' }}>
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${overallProgress}%`, background: 'linear-gradient(to right, var(--accent), var(--pillar-transfer))' }}
                />
              </div>
            </div>
          )}

          {/* Track list */}
          <div className="max-h-[400px] overflow-y-auto">
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
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
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
