// Audio processing Web Worker
// Handles decoding and encoding off the main thread to prevent UI blocking.
// Decodes audio via OfflineAudioContext, encodes to PCM (SP) or placeholder ATRAC3 (LP2/LP4).

type AudioWorkerMessage =
  | { type: 'encode'; id: string; buffer: ArrayBuffer; format: 'sp' | 'lp2' | 'lp4'; filename: string }
  | { type: 'cancel'; id: string };

type AudioWorkerResponse =
  | { type: 'progress'; id: string; percent: number; stage: 'decoding' | 'encoding' }
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

        // Phase 1: Decode audio to PCM
        self.postMessage({
          type: 'progress', id: msg.id, percent: 0, stage: 'decoding',
        } satisfies AudioWorkerResponse);

        const audioContext = new OfflineAudioContext(2, 44100, 44100);
        const audioBuffer = await audioContext.decodeAudioData(msg.buffer);

        if (cancelledJobs.has(msg.id)) { cancelledJobs.delete(msg.id); return; }

        // Resample to 44100Hz stereo
        const offlineCtx = new OfflineAudioContext(
          2,
          Math.ceil(audioBuffer.duration * 44100),
          44100
        );
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0);
        const resampledBuffer = await offlineCtx.startRendering();

        self.postMessage({
          type: 'progress', id: msg.id, percent: 100, stage: 'decoding',
        } satisfies AudioWorkerResponse);

        if (cancelledJobs.has(msg.id)) { cancelledJobs.delete(msg.id); return; }

        const left = resampledBuffer.getChannelData(0);
        const right = resampledBuffer.numberOfChannels > 1 ? resampledBuffer.getChannelData(1) : left;
        const samples = left.length;

        // Phase 2: Encode
        self.postMessage({
          type: 'progress', id: msg.id, percent: 0, stage: 'encoding',
        } satisfies AudioWorkerResponse);

        let outputBuffer: ArrayBuffer;

        if (msg.format === 'sp') {
          // SP: signed 16-bit big-endian PCM (s16be wireformat for netmd-js)
          const dataView = new DataView(new ArrayBuffer(samples * 4));
          for (let i = 0; i < samples; i++) {
            const l = Math.max(-1, Math.min(1, left[i]));
            const r = Math.max(-1, Math.min(1, right[i]));
            dataView.setInt16(i * 4, l < 0 ? l * 0x8000 : l * 0x7fff, false);
            dataView.setInt16(i * 4 + 2, r < 0 ? r * 0x8000 : r * 0x7fff, false);
            if (i % 44100 === 0) {
              self.postMessage({
                type: 'progress', id: msg.id, percent: Math.round((i / samples) * 100), stage: 'encoding',
              } satisfies AudioWorkerResponse);
            }
          }
          outputBuffer = dataView.buffer;
        } else {
          // LP2/LP4: In production, atracdenc WASM encodes to ATRAC3.
          // For now, output s16le PCM as a placeholder.
          const int16 = new Int16Array(samples * 2);
          for (let i = 0; i < samples; i++) {
            const l = Math.max(-1, Math.min(1, left[i]));
            const r = Math.max(-1, Math.min(1, right[i]));
            int16[i * 2] = l < 0 ? l * 0x8000 : l * 0x7fff;
            int16[i * 2 + 1] = r < 0 ? r * 0x8000 : r * 0x7fff;
            if (i % 44100 === 0) {
              self.postMessage({
                type: 'progress', id: msg.id, percent: Math.round((i / samples) * 100), stage: 'encoding',
              } satisfies AudioWorkerResponse);
            }
          }
          outputBuffer = int16.buffer;
        }

        self.postMessage({
          type: 'progress', id: msg.id, percent: 100, stage: 'encoding',
        } satisfies AudioWorkerResponse);

        self.postMessage({
          type: 'complete',
          id: msg.id,
          data: outputBuffer,
          format: msg.format,
          durationSeconds: resampledBuffer.duration,
        } satisfies AudioWorkerResponse, { transfer: [outputBuffer] });
      } catch (err) {
        self.postMessage({
          type: 'error', id: msg.id,
          message: err instanceof Error ? err.message : 'Audio processing failed',
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
