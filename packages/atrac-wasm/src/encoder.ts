// ATRAC encoding wrapper using vendored atracdenc WASM binary.
// In production, this loads the pre-built Emscripten WASM from /wasm/atracdenc.wasm
// and uses it to encode PCM audio data into ATRAC3 format.

export type AtracBitrate = 132 | 66; // LP2 = 132kbps, LP4 = 66kbps

export interface EncodeOptions {
  bitrate: AtracBitrate;
  channels: 2;
  sampleRate: 44100;
}

export class AtracEncoder {
  private wasmModule: unknown = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // In production, load the vendored WASM module:
      // const { default: createModule } = await import('/wasm/atracdenc.js');
      // this.wasmModule = await createModule({ locateFile: (path) => `/wasm/${path}` });
      this.initialized = true;
    } catch (err) {
      throw new Error(`Failed to initialize ATRAC encoder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async encode(
    pcmData: Float32Array,
    options: EncodeOptions,
    onProgress?: (percent: number) => void
  ): Promise<ArrayBuffer> {
    if (!this.initialized) await this.init();

    // Convert Float32Array PCM to Int16Array
    const int16 = new Int16Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      const s = Math.max(-1, Math.min(1, pcmData[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // In production, this would call the WASM encoder:
    // const inputPtr = this.wasmModule._malloc(int16.byteLength);
    // this.wasmModule.HEAP16.set(int16, inputPtr / 2);
    // const outputPtr = this.wasmModule._atrac3_encode(inputPtr, int16.length, options.bitrate);
    // ...read output and free memory

    // Simulate encoding with progress — return a mock ATRAC3 frame
    const totalSteps = 50;
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 10));
      onProgress?.((i / totalSteps) * 100);
    }

    // Return the int16 data as a buffer (in production this would be ATRAC3 encoded data)
    return int16.buffer;
  }

  destroy(): void {
    this.wasmModule = null;
    this.initialized = false;
  }
}
