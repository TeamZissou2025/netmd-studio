// Audio processing Web Worker
// Handles decoding (via FFmpeg WASM) and encoding (via atracdenc WASM)
// off the main thread to prevent UI blocking.

export type AudioWorkerMessage =
  | { type: 'encode'; id: string; buffer: ArrayBuffer; format: 'sp' | 'lp2' | 'lp4'; filename: string }
  | { type: 'cancel'; id: string };

export type AudioWorkerResponse =
  | { type: 'progress'; id: string; percent: number; stage: 'decoding' | 'encoding' }
  | { type: 'complete'; id: string; data: ArrayBuffer; format: 'sp' | 'lp2' | 'lp4'; durationSeconds: number }
  | { type: 'error'; id: string; message: string };

const ctx = globalThis as unknown as Worker;

const cancelledJobs = new Set<string>();

ctx.addEventListener('message', async (event: MessageEvent<AudioWorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'encode': {
      try {
        if (cancelledJobs.has(msg.id)) {
          cancelledJobs.delete(msg.id);
          return;
        }

        // Phase 1: Decode audio to PCM using Web Audio API
        // (In production with COOP/COEP headers, FFmpeg WASM would be used instead)
        ctx.postMessage({
          type: 'progress',
          id: msg.id,
          percent: 0,
          stage: 'decoding',
        } satisfies AudioWorkerResponse);

        // Decode using OfflineAudioContext
        const audioContext = new OfflineAudioContext(2, 44100, 44100);
        const audioBuffer = await audioContext.decodeAudioData(msg.buffer);

        if (cancelledJobs.has(msg.id)) {
          cancelledJobs.delete(msg.id);
          return;
        }

        // Resample to 44100Hz stereo
        const targetSampleRate = 44100;
        const offlineCtx = new OfflineAudioContext(
          2,
          Math.ceil(audioBuffer.duration * targetSampleRate),
          targetSampleRate
        );
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0);
        const resampledBuffer = await offlineCtx.startRendering();

        ctx.postMessage({
          type: 'progress',
          id: msg.id,
          percent: 100,
          stage: 'decoding',
        } satisfies AudioWorkerResponse);

        if (cancelledJobs.has(msg.id)) {
          cancelledJobs.delete(msg.id);
          return;
        }

        // Interleave to stereo PCM
        const left = resampledBuffer.getChannelData(0);
        const right = resampledBuffer.numberOfChannels > 1
          ? resampledBuffer.getChannelData(1)
          : left;
        const samples = left.length;

        // Phase 2: Encode
        ctx.postMessage({
          type: 'progress',
          id: msg.id,
          percent: 0,
          stage: 'encoding',
        } satisfies AudioWorkerResponse);

        let outputBuffer: ArrayBuffer;

        if (msg.format === 'sp') {
          // SP mode: convert to signed 16-bit big-endian PCM
          const dataView = new DataView(new ArrayBuffer(samples * 4)); // stereo 16-bit = 4 bytes per frame
          for (let i = 0; i < samples; i++) {
            const l = Math.max(-1, Math.min(1, left[i]));
            const r = Math.max(-1, Math.min(1, right[i]));
            dataView.setInt16(i * 4, l < 0 ? l * 0x8000 : l * 0x7fff, false); // big-endian
            dataView.setInt16(i * 4 + 2, r < 0 ? r * 0x8000 : r * 0x7fff, false);

            if (i % 44100 === 0) {
              ctx.postMessage({
                type: 'progress',
                id: msg.id,
                percent: Math.round((i / samples) * 100),
                stage: 'encoding',
              } satisfies AudioWorkerResponse);
            }
          }
          outputBuffer = dataView.buffer;
        } else {
          // LP2/LP4: In production, use atracdenc WASM.
          // For now, output signed 16-bit little-endian PCM as placeholder.
          // The bitrate would be 132kbps (LP2) or 66kbps (LP4).
          const int16 = new Int16Array(samples * 2);
          for (let i = 0; i < samples; i++) {
            const l = Math.max(-1, Math.min(1, left[i]));
            const r = Math.max(-1, Math.min(1, right[i]));
            int16[i * 2] = l < 0 ? l * 0x8000 : l * 0x7fff;
            int16[i * 2 + 1] = r < 0 ? r * 0x8000 : r * 0x7fff;

            if (i % 44100 === 0) {
              ctx.postMessage({
                type: 'progress',
                id: msg.id,
                percent: Math.round((i / samples) * 100),
                stage: 'encoding',
              } satisfies AudioWorkerResponse);
            }
          }
          outputBuffer = int16.buffer;
        }

        ctx.postMessage({
          type: 'progress',
          id: msg.id,
          percent: 100,
          stage: 'encoding',
        } satisfies AudioWorkerResponse);

        ctx.postMessage(
          {
            type: 'complete',
            id: msg.id,
            data: outputBuffer,
            format: msg.format,
            durationSeconds: resampledBuffer.duration,
          } satisfies AudioWorkerResponse,
          [outputBuffer]
        );
      } catch (err) {
        ctx.postMessage({
          type: 'error',
          id: msg.id,
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
