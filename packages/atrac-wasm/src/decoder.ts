// FFmpeg WASM audio decoder wrapper.
// Decodes any supported audio format (MP3, FLAC, WAV, OGG, AAC, M4A)
// to raw PCM (44100Hz, 16-bit, stereo).

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

    try {
      // In production, load FFmpeg WASM:
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

    // In production, this would:
    // 1. Write the input file to FFmpeg's virtual filesystem
    // 2. Run: ffmpeg -i input.ext -f f32le -acodec pcm_f32le -ac 2 -ar 44100 output.raw
    // 3. Read the output PCM data
    // 4. Return as Float32Array

    // For now, simulate decoding with a Web Audio API fallback
    // which works for most formats in modern browsers
    try {
      const audioContext = new OfflineAudioContext(2, 44100, 44100);
      const audioBuffer = await audioContext.decodeAudioData(fileData.slice(0));

      onProgress?.(50);

      // Resample to 44100 Hz stereo if needed
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

      // Interleave stereo channels into a single Float32Array
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
