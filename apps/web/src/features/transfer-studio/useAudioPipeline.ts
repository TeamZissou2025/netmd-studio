/**
 * Audio pipeline for SP transfer.
 *
 * SP mode only (LP2/LP4 disabled until ATRAC WASM binaries are available):
 * 1. Main thread: File → AudioContext.decodeAudioData() → AudioBuffer (44100Hz stereo)
 * 2. Main thread: Interleave L/R channels → convert float to s16be
 * 3. Main thread: Send raw PCM bytes to netmd-js via sendTrack()
 *
 * No workers, no WASM, no ATRAC encoding needed for SP.
 */

import { useCallback } from 'react';
import { useTransferStore } from './store';

/**
 * Decode an audio file to 44100Hz stereo AudioBuffer using the browser's
 * built-in decoder (supports MP3, FLAC, WAV, OGG, AAC, M4A).
 */
async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();

  // Use a regular AudioContext for decoding — available on all browsers
  const audioCtx = new AudioContext({ sampleRate: 44100 });
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } finally {
    await audioCtx.close();
  }
}

/**
 * Resample an AudioBuffer to 44100Hz stereo if needed.
 */
async function ensureFormat(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
  if (audioBuffer.sampleRate === 44100 && audioBuffer.numberOfChannels === 2) {
    return audioBuffer;
  }

  const targetLength = Math.ceil(audioBuffer.duration * 44100);
  const offlineCtx = new OfflineAudioContext(2, targetLength, 44100);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  return await offlineCtx.startRendering();
}

/**
 * Interleave left/right Float32 channels and convert to 16-bit big-endian PCM.
 * Output format: [L0_hi, L0_lo, R0_hi, R0_lo, L1_hi, L1_lo, R1_hi, R1_lo, ...]
 * This is exactly what netmd-js expects for Wireformat.pcm (SP mode).
 */
function audioBufferToS16BE(audioBuffer: AudioBuffer): Uint8Array {
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.numberOfChannels > 1
    ? audioBuffer.getChannelData(1)
    : left; // mono → duplicate to both channels

  const numSamples = left.length;
  const buffer = new ArrayBuffer(numSamples * 4); // 2 channels × 2 bytes per sample
  const view = new DataView(buffer);

  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    // false = big-endian
    view.setInt16(i * 4, l < 0 ? l * 0x8000 : l * 0x7FFF, false);
    view.setInt16(i * 4 + 2, r < 0 ? r * 0x8000 : r * 0x7FFF, false);
  }

  return new Uint8Array(buffer);
}

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
      if (format !== 'sp') {
        const msg = 'LP2/LP4 encoding is not yet available — ATRAC WASM encoder required';
        setTrackError(trackId, msg);
        throw new Error(msg);
      }

      updateTrackStatus(trackId, 'encoding');
      updateTrackEncodeProgress(trackId, 0, 'decoding');

      try {
        // Step 1: Decode audio file to AudioBuffer
        updateTrackEncodeProgress(trackId, 10, 'decoding');
        updateOverallProgress();

        const audioBuffer = await decodeAudioFile(file);

        updateTrackEncodeProgress(trackId, 40, 'decoding');
        updateOverallProgress();

        // Step 2: Resample to 44100Hz stereo if needed
        const resampled = await ensureFormat(audioBuffer);
        const durationSeconds = resampled.duration;

        updateTrackEncodeProgress(trackId, 60, 'encoding');
        updateOverallProgress();

        // Step 3: Convert to s16be PCM (interleaved big-endian 16-bit)
        const pcmData = audioBufferToS16BE(resampled);

        updateTrackEncodeProgress(trackId, 90, 'encoding');
        updateOverallProgress();

        // Store result
        const outputBuffer = pcmData.buffer as ArrayBuffer;
        updateTrackDuration(trackId, durationSeconds);
        setTrackEncodedData(trackId, outputBuffer, outputBuffer.byteLength);
        updateTrackEncodeProgress(trackId, 100, 'encoding');
        updateOverallProgress();

        return { data: outputBuffer, durationSeconds };
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
    // No async worker to cancel — encoding is synchronous on main thread
  }, []);

  const terminateWorker = useCallback(() => {
    // No worker to terminate
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
