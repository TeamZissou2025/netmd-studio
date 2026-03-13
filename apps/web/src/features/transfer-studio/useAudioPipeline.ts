import { useRef, useCallback } from 'react';
import { useTransferStore } from './store';

type AudioWorkerResponse =
  | { type: 'progress'; id: string; percent: number; stage: 'encoding' }
  | { type: 'complete'; id: string; data: ArrayBuffer; format: 'sp' | 'lp2' | 'lp4'; durationSeconds: number }
  | { type: 'error'; id: string; message: string };

let workerIdCounter = 0;

/**
 * Decode audio file to 44100Hz stereo PCM on the main thread.
 * OfflineAudioContext is only available on the main thread — NOT in Web Workers.
 */
async function decodeAudioOnMainThread(
  buffer: ArrayBuffer,
  onProgress?: (percent: number) => void
): Promise<{ left: Float32Array; right: Float32Array; durationSeconds: number }> {
  onProgress?.(0);

  // Step 1: Decode compressed audio to AudioBuffer using the browser's built-in decoder
  const audioContext = new OfflineAudioContext(2, 44100, 44100);
  const audioBuffer = await audioContext.decodeAudioData(buffer);

  onProgress?.(40);

  // Step 2: Resample to 44100Hz stereo if needed
  let resampledBuffer: AudioBuffer;
  if (audioBuffer.sampleRate !== 44100 || audioBuffer.numberOfChannels !== 2) {
    const offlineCtx = new OfflineAudioContext(
      2,
      Math.ceil(audioBuffer.duration * 44100),
      44100
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    resampledBuffer = await offlineCtx.startRendering();
  } else {
    resampledBuffer = audioBuffer;
  }

  onProgress?.(80);

  // Step 3: Extract channel data
  const left = resampledBuffer.getChannelData(0);
  const right = resampledBuffer.numberOfChannels > 1
    ? resampledBuffer.getChannelData(1)
    : left;

  onProgress?.(100);

  return { left, right, durationSeconds: resampledBuffer.duration };
}

export function useAudioPipeline() {
  const workerRef = useRef<Worker | null>(null);
  const updateTrackEncodeProgress = useTransferStore((s) => s.updateTrackEncodeProgress);
  const updateTrackTransferProgress = useTransferStore((s) => s.updateTrackTransferProgress);
  const updateTrackStatus = useTransferStore((s) => s.updateTrackStatus);
  const updateTrackDuration = useTransferStore((s) => s.updateTrackDuration);
  const setTrackEncodedData = useTransferStore((s) => s.setTrackEncodedData);
  const setTrackError = useTransferStore((s) => s.setTrackError);
  const updateOverallProgress = useTransferStore((s) => s.updateOverallProgress);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('./audio-worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  const encodeTrack = useCallback(
    (trackId: string, file: File, format: 'sp' | 'lp2' | 'lp4'): Promise<{ data: ArrayBuffer; durationSeconds: number }> => {
      return new Promise((resolve, reject) => {
        const jobId = `${trackId}-${++workerIdCounter}`;

        updateTrackStatus(trackId, 'encoding');
        updateTrackEncodeProgress(trackId, 0, 'decoding');

        // Step 1: Read file and decode audio on the main thread
        file.arrayBuffer().then(async (buffer) => {
          let left: Float32Array;
          let right: Float32Array;
          let durationSeconds: number;

          try {
            const decoded = await decodeAudioOnMainThread(buffer, (percent) => {
              updateTrackEncodeProgress(trackId, percent, 'decoding');
              updateOverallProgress();
            });
            left = decoded.left;
            right = decoded.right;
            durationSeconds = decoded.durationSeconds;
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to decode audio';
            setTrackError(trackId, message);
            reject(new Error(message));
            return;
          }

          // Step 2: Send decoded PCM to worker for format conversion (s16be/s16le)
          const worker = getWorker();

          const handler = (event: MessageEvent<AudioWorkerResponse>) => {
            const msg = event.data;
            if (msg.id !== jobId) return;

            switch (msg.type) {
              case 'progress':
                updateTrackEncodeProgress(trackId, msg.percent, 'encoding');
                updateOverallProgress();
                break;
              case 'complete':
                worker.removeEventListener('message', handler);
                updateTrackDuration(trackId, msg.durationSeconds);
                setTrackEncodedData(trackId, msg.data, msg.data.byteLength);
                updateOverallProgress();
                resolve({ data: msg.data, durationSeconds: msg.durationSeconds });
                break;
              case 'error':
                worker.removeEventListener('message', handler);
                setTrackError(trackId, msg.message);
                updateOverallProgress();
                reject(new Error(msg.message));
                break;
            }
          };

          worker.addEventListener('message', handler);

          // Transfer Float32Arrays to worker (zero-copy)
          worker.postMessage(
            { type: 'encode', id: jobId, left, right, format, durationSeconds },
            [left.buffer, right.buffer]
          );
        }).catch((err) => {
          setTrackError(trackId, err instanceof Error ? err.message : 'Failed to read file');
          reject(err);
        });
      });
    },
    [getWorker, updateTrackStatus, updateTrackEncodeProgress, updateTrackDuration, setTrackEncodedData, setTrackError, updateOverallProgress]
  );

  const cancelEncoding = useCallback(
    (trackId: string) => {
      const worker = workerRef.current;
      if (worker) {
        worker.postMessage({ type: 'cancel', id: trackId });
      }
    },
    []
  );

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return {
    encodeTrack,
    cancelEncoding,
    terminateWorker,
    updateTrackTransferProgress,
    updateTrackStatus,
    updateOverallProgress,
  };
}
