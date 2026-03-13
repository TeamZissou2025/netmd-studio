/**
 * Audio encoding pipeline using FFmpeg WASM + atracdenc WASM.
 *
 * Architecture matches Web MiniDisc Pro (asivery/webminidisc):
 * - FFmpeg WASM (in its own worker via @ffmpeg/ffmpeg) handles all audio decoding
 * - For SP: FFmpeg transcodes directly to s16be PCM
 * - For LP2/LP4: FFmpeg transcodes to WAV, then atracdenc worker encodes to ATRAC3
 *
 * No OfflineAudioContext or AudioContext used — all decoding is FFmpeg-based.
 */

import { useCallback } from 'react';
import { createWorker, type FFmpegWorker } from '@ffmpeg/ffmpeg';
import { useTransferStore } from './store';

/**
 * Wrapper for the atracdenc Web Worker.
 * Matches AtracdencProcess from Web MiniDisc Pro.
 */
class AtracdencProcess {
  private worker: Worker;
  private messageCallback?: (ev: MessageEvent) => void;

  constructor() {
    this.worker = new Worker(
      `${import.meta.env.BASE_URL}wasm/atracdenc-worker.js`
    );
    this.worker.onmessage = this.handleMessage.bind(this);
  }

  async init(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.messageCallback = () => resolve();
      this.worker.postMessage({ action: 'init' });
    });
  }

  async encode(data: ArrayBuffer, bitrate: string): Promise<ArrayBuffer> {
    const ev = await new Promise<MessageEvent>((resolve) => {
      this.messageCallback = (e) => resolve(e);
      this.worker.postMessage({ action: 'encode', bitrate, data }, [data]);
    });
    return ev.data.result as ArrayBuffer;
  }

  terminate(): void {
    this.worker.terminate();
  }

  private handleMessage(ev: MessageEvent): void {
    this.messageCallback?.(ev);
    this.messageCallback = undefined;
  }
}

export function useAudioPipeline() {
  const updateTrackEncodeProgress = useTransferStore((s) => s.updateTrackEncodeProgress);
  const updateTrackTransferProgress = useTransferStore((s) => s.updateTrackTransferProgress);
  const updateTrackStatus = useTransferStore((s) => s.updateTrackStatus);
  const updateTrackDuration = useTransferStore((s) => s.updateTrackDuration);
  const setTrackEncodedData = useTransferStore((s) => s.setTrackEncodedData);
  const setTrackError = useTransferStore((s) => s.setTrackError);
  const updateOverallProgress = useTransferStore((s) => s.updateOverallProgress);

  /**
   * Create a new FFmpeg worker instance with local WASM paths.
   * A new worker is created per file (matching Web MiniDisc Pro).
   */
  const createFFmpeg = useCallback((): FFmpegWorker => {
    return createWorker({
      corePath: `${import.meta.env.BASE_URL}wasm/ffmpeg-core.js`,
      workerPath: `${import.meta.env.BASE_URL}wasm/worker.min.js`,
      logger: ({ message }) => {
        // Only log non-empty messages
        if (message.trim()) {
          console.log('[FFmpeg]', message);
        }
      },
    });
  }, []);

  const encodeTrack = useCallback(
    async (
      trackId: string,
      file: File,
      format: 'sp' | 'lp2' | 'lp4'
    ): Promise<{ data: ArrayBuffer; durationSeconds: number }> => {
      updateTrackStatus(trackId, 'encoding');
      updateTrackEncodeProgress(trackId, 0, 'decoding');

      let ffmpeg: FFmpegWorker | null = null;
      let atracdenc: AtracdencProcess | null = null;

      try {
        // Step 1: Create FFmpeg worker and load
        ffmpeg = createFFmpeg();
        await ffmpeg.load();

        updateTrackEncodeProgress(trackId, 10, 'decoding');
        updateOverallProgress();

        // Step 2: Write input file to FFmpeg's virtual filesystem
        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
        const inFile = `input.${ext}`;
        await ffmpeg.write(inFile, file);

        updateTrackEncodeProgress(trackId, 20, 'decoding');
        updateOverallProgress();

        let outputData: ArrayBuffer;
        let durationSeconds: number;

        if (format === 'sp') {
          // SP mode: FFmpeg decodes and converts directly to s16be PCM
          // This is exactly what netmd-js expects for Wireformat.pcm
          const outFile = 'output.raw';
          await ffmpeg.transcode(inFile, outFile, '-ac 2 -ar 44100 -f s16be');

          updateTrackEncodeProgress(trackId, 80, 'encoding');
          updateOverallProgress();

          const result = await ffmpeg.read(outFile);
          outputData = new Uint8Array(result.data).buffer as ArrayBuffer;

          // Duration from PCM size: bytes / (sampleRate * channels * bytesPerSample)
          durationSeconds = result.data.byteLength / (44100 * 2 * 2);
        } else {
          // LP2/LP4: FFmpeg decodes to WAV, then atracdenc encodes to ATRAC3
          const wavFile = 'output.wav';
          await ffmpeg.transcode(inFile, wavFile, '-ac 2 -ar 44100 -f wav');

          updateTrackEncodeProgress(trackId, 40, 'decoding');
          updateOverallProgress();

          const wavResult = await ffmpeg.read(wavFile);

          // Duration from WAV data (header is 44 bytes for standard PCM WAV)
          const wavDataSize = wavResult.data.byteLength - 44;
          durationSeconds = wavDataSize / (44100 * 2 * 2);

          updateTrackEncodeProgress(trackId, 50, 'encoding');
          updateOverallProgress();

          // Create atracdenc worker and encode
          atracdenc = new AtracdencProcess();
          await atracdenc.init();

          updateTrackEncodeProgress(trackId, 60, 'encoding');
          updateOverallProgress();

          // Map our bitrate to atracdenc's expected values
          // LP2 = 132kbps → atracdenc expects '128'
          // LP4 = 66kbps → atracdenc expects '64'
          const bitrate = format === 'lp2' ? '128' : '64';

          // Transfer WAV data to atracdenc worker — copy to ensure clean ArrayBuffer
          const wavBuffer = new Uint8Array(wavResult.data).buffer as ArrayBuffer;
          outputData = await atracdenc.encode(wavBuffer, bitrate);

          atracdenc.terminate();
          atracdenc = null;
        }

        // Cleanup FFmpeg worker (one per file, matching Web MiniDisc Pro)
        await ffmpeg.terminate();
        ffmpeg = null;

        updateTrackEncodeProgress(trackId, 95, 'encoding');
        updateOverallProgress();

        // Update store
        updateTrackDuration(trackId, durationSeconds);
        setTrackEncodedData(trackId, outputData, outputData.byteLength);
        updateTrackEncodeProgress(trackId, 100, 'encoding');
        updateOverallProgress();

        return { data: outputData, durationSeconds };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Audio encoding failed';
        setTrackError(trackId, message);

        // Cleanup on error
        try { ffmpeg?.terminate(); } catch { /* ignore */ }
        try { atracdenc?.terminate(); } catch { /* ignore */ }

        throw new Error(message);
      }
    },
    [
      createFFmpeg,
      updateTrackStatus,
      updateTrackEncodeProgress,
      updateTrackDuration,
      setTrackEncodedData,
      setTrackError,
      updateOverallProgress,
    ]
  );

  const cancelEncoding = useCallback((_trackId: string) => {
    // FFmpeg worker is per-file and cleaned up after each encode.
    // Mid-transcode cancellation not supported by ffmpeg@0.6.1.
  }, []);

  const terminateWorker = useCallback(() => {
    // No persistent worker to terminate — each encode creates and destroys its own.
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
