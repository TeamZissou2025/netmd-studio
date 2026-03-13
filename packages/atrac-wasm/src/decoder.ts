// Audio decoder wrapper.
// Decodes any browser-supported audio format (MP3, FLAC, WAV, OGG, AAC, M4A)
// to raw PCM (44100Hz, 16-bit, stereo).
//
// IMPORTANT: This class uses OfflineAudioContext which is ONLY available on the
// main thread. Do NOT use this class inside a Web Worker.

export interface DecodedAudio {
  pcmData: Float32Array;
  sampleRate: number;
  channels: number;
  durationSeconds: number;
}

export class AudioDecoder {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    // Verify we're on the main thread where OfflineAudioContext is available
    if (typeof OfflineAudioContext === 'undefined') {
      throw new Error(
        'AudioDecoder requires OfflineAudioContext which is only available on the main thread. ' +
        'Do not use this class inside a Web Worker.'
      );
    }

    try {
      // In production, load FFmpeg WASM for broader format support:
      // const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      // this.ffmpeg = new FFmpeg();
      // await this.ffmpeg.load({
      //   coreURL: '/wasm/ffmpeg-core.js',
      //   wasmURL: '/wasm/ffmpeg-core.wasm',
      // });
      this.initialized = true;
    } catch (err) {
      throw new Error(`Failed to initialize audio decoder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async decode(
    fileData: ArrayBuffer,
    filename: string,
    onProgress?: (percent: number) => void
  ): Promise<DecodedAudio> {
    if (!this.initialized) await this.init();

    try {
      // Step 1: Decode compressed audio using the browser's built-in decoder
      const audioContext = new OfflineAudioContext(2, 44100, 44100);
      const audioBuffer = await audioContext.decodeAudioData(fileData.slice(0));

      onProgress?.(50);

      // Step 2: Resample to 44100 Hz stereo if needed
      const targetSampleRate = 44100;
      const targetChannels = 2;

      let resampledBuffer: AudioBuffer;
      if (audioBuffer.sampleRate !== targetSampleRate || audioBuffer.numberOfChannels !== targetChannels) {
        const offlineCtx = new OfflineAudioContext(
          targetChannels,
          Math.ceil(audioBuffer.duration * targetSampleRate),
          targetSampleRate
        );
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0);
        resampledBuffer = await offlineCtx.startRendering();
      } else {
        resampledBuffer = audioBuffer;
      }

      // Step 3: Interleave stereo channels into a single Float32Array
      const left = resampledBuffer.getChannelData(0);
      const right = resampledBuffer.numberOfChannels > 1
        ? resampledBuffer.getChannelData(1)
        : left;
      const interleaved = new Float32Array(left.length * 2);
      for (let i = 0; i < left.length; i++) {
        interleaved[i * 2] = left[i];
        interleaved[i * 2 + 1] = right[i];
      }

      onProgress?.(100);

      return {
        pcmData: interleaved,
        sampleRate: targetSampleRate,
        channels: targetChannels,
        durationSeconds: resampledBuffer.duration,
      };
    } catch {
      throw new Error(`Failed to decode audio file: ${filename}`);
    }
  }

  destroy(): void {
    this.initialized = false;
  }
}
