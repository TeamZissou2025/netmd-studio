/**
 * Audio pipeline using Web MiniDisc Pro's EXACT encoding stack:
 *
 * SP:  FFmpeg WASM → s16be PCM (Wireformat.pcm)
 * LP2: FFmpeg WASM → WAV → atracdenc WASM → ATRAC3 132kbps
 * LP4: FFmpeg WASM → WAV → atracdenc WASM → ATRAC3 66kbps
 *
 * This delegates to NetMDConnection.encodeAudio() which uses the
 * vendored AtracdencAudioExportService — the SAME code path that
 * runs in Web MiniDisc Pro.
 */

import { useCallback } from 'react';
import { useTransferStore } from './store';
import { getConnectionInstance } from './connection';

export function useAudioPipeline() {
  const updateTrackEncodeProgress = useTransferStore((s) => s.updateTrackEncodeProgress);
  const updateTrackTransferProgress = useTransferStore((s) => s.updateTrackTransferProgress);
  const updateTrackStatus = useTransferStore((s) => s.updateTrackStatus);
  const updateTrackDuration = useTransferStore((s) => s.updateTrackDuration);
  const setTrackEncodedData = useTransferStore((s) => s.setTrackEncodedData);
  const setTrackError = useTransferStore((s) => s.setTrackError);
  const updateOverallProgress = useTransferStore((s) => s.updateOverallProgress);

  const encodeTrack = useCallback(
    async (
      trackId: string,
      file: File,
      format: 'sp' | 'lp2' | 'lp4'
    ): Promise<{ data: ArrayBuffer; durationSeconds: number }> => {
      updateTrackStatus(trackId, 'encoding');
      updateTrackEncodeProgress(trackId, 0, 'decoding');

      try {
        const conn = getConnectionInstance();

        // Use the vendored WMD audio pipeline (FFmpeg + atracdenc WASM)
        const data = await conn.encodeAudio(file, format, ({ state, total }) => {
          if (total > 0) {
            const pct = Math.round((state / total) * 100);
            updateTrackEncodeProgress(trackId, pct, 'encoding');
            updateOverallProgress();
          }
        });

        // Estimate duration from encoded data size
        let durationSeconds: number;
        switch (format) {
          case 'sp':
            // s16be PCM: 44100 Hz × 2 channels × 2 bytes = 176400 bytes/sec
            durationSeconds = data.byteLength / 176400;
            break;
          case 'lp2':
            // ATRAC3 132kbps = 16500 bytes/sec
            durationSeconds = data.byteLength / 16500;
            break;
          case 'lp4':
            // ATRAC3 66kbps = 8250 bytes/sec
            durationSeconds = data.byteLength / 8250;
            break;
        }

        updateTrackDuration(trackId, durationSeconds);
        setTrackEncodedData(trackId, data, data.byteLength);
        updateTrackEncodeProgress(trackId, 100, 'encoding');
        updateOverallProgress();

        return { data, durationSeconds };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Audio encoding failed';
        setTrackError(trackId, message);
        throw new Error(message);
      }
    },
    [
      updateTrackStatus,
      updateTrackEncodeProgress,
      updateTrackDuration,
      setTrackEncodedData,
      setTrackError,
      updateOverallProgress,
    ]
  );

  const cancelEncoding = useCallback((_trackId: string) => {
    // Cannot cancel mid-encode with current WASM pipeline
  }, []);

  const terminateWorker = useCallback(() => {
    // Workers are terminated per-encode by the vendor service
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
