import { useRef, useCallback } from 'react';
import { useTransferStore } from './store';

type AudioWorkerResponse =
  | { type: 'progress'; id: string; percent: number; stage: 'decoding' | 'encoding' }
  | { type: 'complete'; id: string; data: ArrayBuffer; format: 'sp' | 'lp2' | 'lp4'; durationSeconds: number }
  | { type: 'error'; id: string; message: string };

let workerIdCounter = 0;

export function useAudioPipeline() {
  const workerRef = useRef<Worker | null>(null);
  const {
    updateTrackEncodeProgress,
    updateTrackTransferProgress,
    updateTrackStatus,
    updateTrackDuration,
    setTrackEncodedData,
    setTrackError,
    updateOverallProgress,
  } = useTransferStore();

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
        const worker = getWorker();
        const jobId = `${trackId}-${++workerIdCounter}`;

        updateTrackStatus(trackId, 'encoding');
        updateTrackEncodeProgress(trackId, 0, 'decoding');

        const handler = (event: MessageEvent<AudioWorkerResponse>) => {
          const msg = event.data;
          if (msg.id !== jobId) return;

          switch (msg.type) {
            case 'progress':
              updateTrackEncodeProgress(trackId, msg.percent, msg.stage);
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

        file.arrayBuffer().then((buffer) => {
          worker.postMessage(
            { type: 'encode', id: jobId, buffer, format, filename: file.name },
            [buffer]
          );
        }).catch((err) => {
          worker.removeEventListener('message', handler);
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
