// Audio encoding Web Worker
// Handles PCM format conversion off the main thread to prevent UI blocking.
// Receives decoded PCM Float32 data from main thread and converts to the
// wire format needed by netmd-js (s16be for SP, s16le for LP2/LP4).
//
// NOTE: OfflineAudioContext is NOT available in Web Workers, so all audio
// decoding must happen on the main thread before posting data here.

export type AudioWorkerMessage =
  | {
      type: 'encode';
      id: string;
      left: Float32Array;
      right: Float32Array;
      format: 'sp' | 'lp2' | 'lp4';
      durationSeconds: number;
    }
  | { type: 'cancel'; id: string };

export type AudioWorkerResponse =
  | { type: 'progress'; id: string; percent: number; stage: 'encoding' }
  | { type: 'complete'; id: string; data: ArrayBuffer; format: 'sp' | 'lp2' | 'lp4'; durationSeconds: number }
  | { type: 'error'; id: string; message: string };

const cancelledJobs = new Set<string>();

self.addEventListener('message', async (event: MessageEvent<AudioWorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'encode': {
      try {
        if (cancelledJobs.has(msg.id)) {
          cancelledJobs.delete(msg.id);
          return;
        }

        const { left, right, format, durationSeconds } = msg;
        const samples = left.length;

        self.postMessage({
          type: 'progress', id: msg.id, percent: 0, stage: 'encoding',
        } satisfies AudioWorkerResponse);

        let outputBuffer: ArrayBuffer;

        if (format === 'sp') {
          // SP mode: convert Float32 PCM to signed 16-bit big-endian PCM (s16be)
          // netmd-js expects Wireformat.pcm = s16be, 44100Hz stereo
          const dataView = new DataView(new ArrayBuffer(samples * 4)); // stereo 16-bit = 4 bytes per frame
          for (let i = 0; i < samples; i++) {
            const l = Math.max(-1, Math.min(1, left[i]));
            const r = Math.max(-1, Math.min(1, right[i]));
            dataView.setInt16(i * 4, l < 0 ? l * 0x8000 : l * 0x7fff, false); // false = big-endian
            dataView.setInt16(i * 4 + 2, r < 0 ? r * 0x8000 : r * 0x7fff, false);

            if (i % 44100 === 0) {
              self.postMessage({
                type: 'progress', id: msg.id,
                percent: Math.round((i / samples) * 100), stage: 'encoding',
              } satisfies AudioWorkerResponse);
            }
          }
          outputBuffer = dataView.buffer;
        } else {
          // LP2/LP4: In production, atracdenc WASM encodes to ATRAC3.
          // For now, output signed 16-bit little-endian PCM as placeholder.
          // The bitrate would be 132kbps (LP2) or 66kbps (LP4).
          const int16 = new Int16Array(samples * 2);
          for (let i = 0; i < samples; i++) {
            const l = Math.max(-1, Math.min(1, left[i]));
            const r = Math.max(-1, Math.min(1, right[i]));
            int16[i * 2] = l < 0 ? l * 0x8000 : l * 0x7fff;
            int16[i * 2 + 1] = r < 0 ? r * 0x8000 : r * 0x7fff;

            if (i % 44100 === 0) {
              self.postMessage({
                type: 'progress', id: msg.id,
                percent: Math.round((i / samples) * 100), stage: 'encoding',
              } satisfies AudioWorkerResponse);
            }
          }
          outputBuffer = int16.buffer;
        }

        if (cancelledJobs.has(msg.id)) {
          cancelledJobs.delete(msg.id);
          return;
        }

        self.postMessage({
          type: 'progress', id: msg.id, percent: 100, stage: 'encoding',
        } satisfies AudioWorkerResponse);

        self.postMessage({
          type: 'complete',
          id: msg.id,
          data: outputBuffer,
          format,
          durationSeconds,
        } satisfies AudioWorkerResponse, { transfer: [outputBuffer] });
      } catch (err) {
        self.postMessage({
          type: 'error', id: msg.id,
          message: err instanceof Error ? err.message : 'Audio encoding failed',
        } satisfies AudioWorkerResponse);
      }
      break;
    }
    case 'cancel': {
      cancelledJobs.add(msg.id);
      break;
    }
  }
});
