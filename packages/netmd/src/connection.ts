/**
 * NetMD Connection — Thin adapter over Web MiniDisc Pro's NetMDUSBService.
 *
 * This creates the SAME service class Web MiniDisc Pro creates, and calls
 * the SAME upload method with the SAME parameters. The code path from
 * prepareUpload → upload → finalizeUpload is IDENTICAL to what runs when
 * a user clicks upload in Web MiniDisc Pro.
 */
import {
  NetMDUSBService,
  AtracdencAudioExportService,
  type Codec,
  type Disc as WMDDisc,
  type Track as WMDTrack,
  type AudioExportService,
  type ExportParams,
} from './vendor';
import { identifyDevice, type NetMDDeviceEntry } from './devices';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DiscTOC {
  title: string;
  fullWidthTitle: string;
  trackCount: number;
  usedSeconds: number;
  freeSeconds: number;
  totalSeconds: number;
  writable: boolean;
  writeProtected: boolean;
  tracks: DiscTrack[];
}

export interface DiscTrack {
  index: number;
  title: string;
  fullWidthTitle: string;
  durationSeconds: number;
  encoding: 'sp' | 'lp2' | 'lp4';
  channel: number;
}

export interface NetMDConnectionEvents {
  onStatusChange: (status: ConnectionStatus) => void;
  onDeviceIdentified: (device: NetMDDeviceEntry) => void;
  onTOCRead: (toc: DiscTOC) => void;
  onConnected: (device: NetMDDeviceEntry, toc: DiscTOC | null) => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
}

/**
 * Convert WMD Disc type to our DiscTOC.
 *
 * WMD's convertDiscToWMD divides netmd-js raw frame counts by 512 to get
 * seconds for disc.left and disc.total. However, disc.used is NOT divided
 * by 512 (it passes through via object spread unchanged). This is a quirk
 * of WMD's convertDiscToWMD implementation.
 *
 * To get correct used seconds, we compute: total - left (both in seconds).
 * Track durations are in seconds (WMD divides by 512 in convertTrackToWMD).
 */
function convertDisc(disc: WMDDisc): DiscTOC {
  const tracks: DiscTrack[] = [];
  for (const group of disc.groups) {
    for (const track of group.tracks) {
      tracks.push(convertTrack(track));
    }
  }
  tracks.sort((a, b) => a.index - b.index);

  // disc.left and disc.total are in SP-equivalent seconds (divided by 512
  // in WMD's convertDiscToWMD). disc.used is NOT divided — it's still raw
  // frames. Compute usedSeconds from the two correct values instead.
  const totalSeconds = disc.total;
  const freeSeconds = disc.left;
  const usedSeconds = Math.max(0, totalSeconds - freeSeconds);

  console.log('[NetMD] Disc capacity: total=%ds (%s), used=%ds (%s), free=%ds (%s), tracks=%d',
    totalSeconds, formatTime(totalSeconds),
    usedSeconds, formatTime(usedSeconds),
    freeSeconds, formatTime(freeSeconds),
    tracks.length);

  return {
    title: disc.title,
    fullWidthTitle: disc.fullWidthTitle,
    trackCount: disc.trackCount,
    usedSeconds,
    freeSeconds,
    totalSeconds,
    writable: disc.writable,
    writeProtected: disc.writeProtected,
    tracks,
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function convertTrack(track: WMDTrack): DiscTrack {
  let encoding: 'sp' | 'lp2' | 'lp4';
  if (track.encoding.codec.startsWith('SP')) {
    encoding = 'sp';
  } else if (track.encoding.bitrate === 132) {
    encoding = 'lp2';
  } else {
    encoding = 'lp4';
  }

  const title = track.title ?? '';
  if (!title && track.index === 0) {
    console.log('[NetMD] Track %d title is empty (raw: %o, fullWidth: %o)', track.index, track.title, track.fullWidthTitle);
  }

  return {
    index: track.index,
    title,
    fullWidthTitle: track.fullWidthTitle ?? '',
    durationSeconds: track.duration,
    encoding,
    channel: track.channel,
  };
}

/** Map our format strings to WMD Codec objects — the SAME values Web MiniDisc Pro uses */
function formatToCodec(format: 'sp' | 'lp2' | 'lp4'): Codec {
  switch (format) {
    case 'sp':
      return { codec: 'SPS', bitrate: 292 };
    case 'lp2':
      return { codec: 'AT3', bitrate: 132 };
    case 'lp4':
      return { codec: 'AT3', bitrate: 66 };
  }
}

/** Connection timeout in milliseconds */
const CONNECTION_TIMEOUT_MS = 10_000;

export class NetMDConnection {
  /** The EXACT same service class Web MiniDisc Pro uses */
  private service: NetMDUSBService;
  /** Audio export service — same as Web MiniDisc Pro's atracdenc pipeline */
  private audioExport: AtracdencAudioExportService;

  private events: Partial<NetMDConnectionEvents> = {};
  private _status: ConnectionStatus = 'disconnected';
  private _deviceInfo: NetMDDeviceEntry | null = null;
  private _toc: DiscTOC | null = null;
  private _connecting = false;
  /** Set to true by abortConnection() to cancel an in-flight connection */
  private _aborted = false;

  constructor() {
    this.service = new NetMDUSBService({ debug: true });
    this.audioExport = new AtracdencAudioExportService();
  }

  get status(): ConnectionStatus { return this._status; }
  get deviceInfo(): NetMDDeviceEntry | null { return this._deviceInfo; }
  get toc(): DiscTOC | null { return this._toc; }

  on<K extends keyof NetMDConnectionEvents>(event: K, handler: NetMDConnectionEvents[K]): void {
    this.events[event] = handler;
  }

  private setStatus(status: ConnectionStatus): void {
    this._status = status;
    this.events.onStatusChange?.(status);
  }

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  /**
   * Abort an in-flight connection attempt.
   * Returns the UI to "disconnected" immediately.
   */
  abortConnection(): void {
    if (!this._connecting) return;
    console.log('[NetMD] Connection aborted by user');
    this._aborted = true;
    this._connecting = false;
    this._resetToDisconnected();
  }

  /** Reset all connection state to disconnected. UI updates immediately. */
  private _resetToDisconnected(): void {
    navigator.usb.removeEventListener('disconnect', this.handleDisconnect);
    this._deviceInfo = null;
    this._toc = null;
    this._status = 'disconnected';
    this.events.onDisconnect?.();
  }

  /**
   * Open browser device picker. Uses NetMDUSBService.pair() — the SAME
   * method Web MiniDisc Pro calls when a user clicks "Connect".
   *
   * Handles all edge cases:
   * - User cancels picker → NotFoundError → silent return to disconnected
   * - Device unresponsive → 10s timeout → error message
   * - User clicks Cancel button → abortConnection() sets _aborted flag
   */
  async requestDevice(): Promise<boolean> {
    if (!NetMDConnection.isSupported()) {
      this.events.onError?.('WebUSB is not supported in this browser');
      return false;
    }
    if (this._connecting) return false;
    if (this._status === 'connected') return true;

    this._connecting = true;
    this._aborted = false;
    try {
      this.setStatus('connecting');

      // This is what WMD calls — openNewDevice internally.
      // If user cancels the browser picker, pair() throws NotFoundError.
      const paired = await this.service.pair();
      if (!paired || this._aborted) {
        this.setStatus('disconnected');
        return false;
      }

      return await this.initializeDevice();
    } catch (err) {
      // User cancelled the browser device picker — silent return, no error toast
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        console.log('[NetMD] Device picker cancelled by user');
        this.setStatus('disconnected');
        return false;
      }
      console.error('[NetMD] requestDevice failed:', err);
      this.setStatus('error');
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to request device');
      return false;
    } finally {
      this._connecting = false;
    }
  }

  /**
   * Reconnect to previously paired device. Uses NetMDUSBService.connect() —
   * the SAME method Web MiniDisc Pro calls for auto-reconnect.
   */
  async reconnectPaired(): Promise<boolean> {
    if (!NetMDConnection.isSupported()) return false;
    if (this._connecting) return false;
    if (this._status === 'connected') return true;

    this._connecting = true;
    this._aborted = false;
    try {
      this.setStatus('connecting');

      const connected = await this.service.connect();
      if (!connected || this._aborted) {
        this.setStatus('disconnected');
        return false;
      }

      return await this.initializeDevice();
    } catch (err) {
      console.error('[NetMD] reconnectPaired failed:', err);
      this.setStatus('disconnected');
      return false;
    } finally {
      this._connecting = false;
    }
  }

  private async initializeDevice(): Promise<boolean> {
    try {
      // Race device init against a timeout
      const result = await Promise.race([
        this._doInitializeDevice(),
        this._connectionTimeout(),
      ]);
      return result;
    } catch (err) {
      if (this._aborted) {
        // User cancelled during init — already reset by abortConnection()
        return false;
      }
      console.error('[NetMD] initializeDevice failed:', err);
      this.setStatus('error');
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to initialize device');
      return false;
    }
  }

  /** Timeout promise that rejects after CONNECTION_TIMEOUT_MS */
  private _connectionTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        if (this._connecting && !this._aborted) {
          reject(new Error('Connection timed out. Make sure your device is powered on and connected via USB.'));
        }
      }, CONNECTION_TIMEOUT_MS);
    });
  }

  private async _doInitializeDevice(): Promise<boolean> {
    const vendorId = this.service.getVendorId();
    const productId = this.service.getProductId();
    const deviceName = await this.service.getDeviceName();

    if (this._aborted) return false;

    this._deviceInfo = identifyDevice(vendorId, productId) ?? {
      vendorId,
      productId,
      name: deviceName || 'Unknown NetMD Device',
      manufacturer: 'Unknown',
      modelNumber: 'Unknown',
      isHiMD: false,
    };

    console.log('[NetMD] Device: %s (VID=%s PID=%s)',
      this._deviceInfo.name,
      vendorId.toString(16).padStart(4, '0'),
      productId.toString(16).padStart(4, '0'));

    navigator.usb.addEventListener('disconnect', this.handleDisconnect);

    if (this._aborted) return false;

    // Read TOC using the SAME listContent call WMD uses
    const disc = await this.service.listContent(true);

    if (this._aborted) return false;

    this._toc = convertDisc(disc);

    this._status = 'connected';
    this.events.onConnected?.(this._deviceInfo, this._toc);
    return true;
  }

  private handleDisconnect = (event: USBConnectionEvent): void => {
    if (this.service.isDeviceConnected(event.device)) {
      console.log('[NetMD] Device physically disconnected');
      this._connecting = false;
      this._aborted = true;
      this._resetToDisconnected();
    }
  };

  async readTOC(): Promise<DiscTOC | null> {
    try {
      const disc = await this.service.listContent(true);
      this._toc = convertDisc(disc);
      if (this._status === 'connected') {
        this.events.onTOCRead?.(this._toc);
      }
      return this._toc;
    } catch (err) {
      console.error('[NetMD] readTOC failed:', err);
      return null;
    }
  }

  async setTrackTitle(trackIndex: number, title: string): Promise<boolean> {
    try {
      await this.service.renameTrack(trackIndex, title);
      const disc = await this.service.listContent(false);
      this._toc = convertDisc(disc);
      this.events.onTOCRead?.(this._toc);
      return true;
    } catch (err) {
      console.error('[NetMD] setTrackTitle failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to rename track');
      return false;
    }
  }

  async setDiscTitle(title: string): Promise<boolean> {
    try {
      await this.service.renameDisc(title);
      const disc = await this.service.listContent(false);
      this._toc = convertDisc(disc);
      this.events.onTOCRead?.(this._toc);
      return true;
    } catch (err) {
      console.error('[NetMD] setDiscTitle failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to rename disc');
      return false;
    }
  }

  async deleteTrack(trackIndex: number): Promise<boolean> {
    try {
      await this.service.deleteTracks([trackIndex]);
      const disc = await this.service.listContent(true);
      this._toc = convertDisc(disc);
      this.events.onTOCRead?.(this._toc);
      return true;
    } catch (err) {
      console.error('[NetMD] deleteTrack failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to delete track');
      return false;
    }
  }

  async eraseDisc(): Promise<boolean> {
    try {
      await this.service.wipeDisc();
      const disc = await this.service.listContent(true);
      this._toc = convertDisc(disc);
      this.events.onTOCRead?.(this._toc);
      return true;
    } catch (err) {
      console.error('[NetMD] eraseDisc failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to erase disc');
      return false;
    }
  }

  /**
   * Prepare device for upload batch. Calls NetMDUSBService.prepareUpload() —
   * the IDENTICAL call Web MiniDisc Pro makes.
   */
  async prepareUpload(): Promise<boolean> {
    try {
      await this.service.prepareUpload();
      console.log('[NetMD] Upload session initialized');
      return true;
    } catch (err) {
      console.error('[NetMD] prepareUpload failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to prepare upload');
      return false;
    }
  }

  /**
   * Finalize upload session. Calls NetMDUSBService.finalizeUpload() —
   * the IDENTICAL call Web MiniDisc Pro makes.
   */
  async finalizeUpload(): Promise<void> {
    try {
      await this.service.finalizeUpload();
      console.log('[NetMD] Upload session finalized');
    } catch (err) {
      console.warn('[NetMD] finalizeUpload failed (non-fatal):', err);
    }

    // Refresh TOC
    try {
      const disc = await this.service.listContent(true);
      this._toc = convertDisc(disc);
      this.events.onTOCRead?.(this._toc);
    } catch (err) {
      console.warn('[NetMD] TOC re-read after finalize failed:', err);
    }
  }

  /**
   * Encode an audio file using the SAME pipeline Web MiniDisc Pro uses:
   * - SP: FFmpeg WASM decode → s16be PCM (Wireformat.pcm)
   * - LP2: FFmpeg WASM decode → WAV → atracdenc WASM → ATRAC3 132kbps
   * - LP4: FFmpeg WASM decode → WAV → atracdenc WASM → ATRAC3 66kbps
   *
   * Returns raw encoded bytes ready for upload().
   */
  async encodeAudio(
    file: File,
    format: 'sp' | 'lp2' | 'lp4',
    onProgress?: (progress: { state: number; total: number }) => void
  ): Promise<ArrayBuffer> {
    const exportService = new AtracdencAudioExportService();
    await exportService.init();
    await exportService.prepare(file);

    const codec = formatToCodec(format);
    let exportFormat: ExportParams['format'];

    if (codec.codec === 'SPS' || codec.codec === 'SPM') {
      exportFormat = { codec: 'PCM', bitrate: 1411 };
    } else {
      exportFormat = { codec: codec.codec as 'AT3', bitrate: codec.bitrate };
    }

    const exportParams: ExportParams = {
      format: exportFormat,
      enableReplayGain: false,
      lastInBatch: true,
    };

    const result = await exportService.export(exportParams, onProgress ?? (() => {}));

    // The export returns an ArrayBuffer. Verify it's correctly sized.
    // MDTrack uses data.byteLength to compute frameCount and totalSize,
    // so an incorrect byteLength would cause the device to reject.
    console.log('[NetMD] Encoded %s: %d bytes (%s mode)',
      file.name, result.byteLength, format.toUpperCase());

    // Sanity check: SP PCM should be a multiple of sample frame (4 bytes = 2ch × 16bit)
    if (format === 'sp' && result.byteLength % 4 !== 0) {
      console.warn('[NetMD] SP PCM data length %d is not a multiple of 4 bytes', result.byteLength);
    }

    return result;
  }

  /**
   * Upload a single track. Calls NetMDUSBService.upload() with the EXACT
   * same parameters Web MiniDisc Pro passes.
   *
   * The data MUST already be encoded via encodeAudio():
   * - SP: raw s16be PCM (Wireformat.pcm, DiscFormat.spStereo)
   * - LP2: raw ATRAC3 132kbps (Wireformat.lp2, DiscFormat.lp2)
   * - LP4: raw ATRAC3 66kbps (Wireformat.lp4, DiscFormat.lp4)
   */
  async sendTrack(
    data: ArrayBuffer,
    format: 'sp' | 'lp2' | 'lp4',
    title: string,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    const codec = formatToCodec(format);

    // Frame sizes from netmd-js FrameSize mapping:
    // Wireformat.pcm (0) → 2048, Wireformat.lp2 (0x94) → 192, Wireformat.lp4 (0xa8) → 96
    const frameSize = format === 'sp' ? 2048 : format === 'lp2' ? 192 : 96;
    const paddedSize = data.byteLength + (data.byteLength % frameSize === 0 ? 0 : frameSize - (data.byteLength % frameSize));
    const frameCount = paddedSize / frameSize;
    const totalBytes = paddedSize + 24; // netmd-js adds 24 bytes for packet header

    // Estimate track duration from data size
    const trackDurationSec = format === 'sp'
      ? data.byteLength / 176400 // 44100 Hz × 2 ch × 2 bytes
      : data.byteLength / ((format === 'lp2' ? 132000 : 66000) / 8);

    console.log('[NetMD] sendTrack: title=%s, format=%s, codec=%o', title, format, codec);
    console.log('[NetMD]   data=%d bytes, paddedSize=%d, frameSize=%d, frames=%d',
      data.byteLength, paddedSize, frameSize, frameCount);
    console.log('[NetMD]   estimated duration=%s', formatTime(trackDurationSec));

    // Check disc capacity. Device reports free space in SP-equivalent seconds.
    // Convert to the selected format's duration using bitrate ratio.
    if (this._toc) {
      const spFreeSeconds = this._toc.freeSeconds;
      const bitrate = format === 'sp' ? 292 : format === 'lp2' ? 132 : 66;
      const freeForFormat = spFreeSeconds * (292 / bitrate);
      console.log('[NetMD]   disc free=%s (%s SP), track needs=%s',
        formatTime(freeForFormat), formatTime(spFreeSeconds), formatTime(trackDurationSec));
      // Only block if the track clearly exceeds free space (30s tolerance for
      // rounding between our duration estimate and device-reported capacity)
      if (trackDurationSec > freeForFormat + 30) {
        const msg = `Not enough disc space: track is ${formatTime(trackDurationSec)} but only ${formatTime(freeForFormat)} free (${format.toUpperCase()})`;
        console.error('[NetMD]', msg);
        this.events.onError?.(msg);
        return false;
      }
    }

    // Verify the MDSession is initialized (prepareUpload must be called first)
    if (!this.service.currentSession) {
      const msg = 'Cannot upload: no active MDSession. Call prepareUpload() first.';
      console.error('[NetMD]', msg);
      this.events.onError?.(msg);
      return false;
    }

    try {
      await this.service.upload(
        title,
        '', // fullWidthTitle — empty is fine, sanitized by netmd-js
        data,
        codec,
        ({ written, encrypted, total }) => {
          if (total > 0) {
            const percent = ((written + encrypted) / (total * 2)) * 100;
            onProgress?.(Math.min(percent, 100));
          }
        }
      );
      console.log('[NetMD] sendTrack complete: %s', title);
      return true;
    } catch (err) {
      console.error('[NetMD] sendTrack failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Transfer failed');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // Update state FIRST so UI responds immediately
    this._connecting = false;
    this._aborted = true;
    this._resetToDisconnected();

    // Then clean up USB resources in the background
    try {
      await this.service.finalize();
    } catch { /* ignore */ }
  }
}

/**
 * Convert disc free time from SP-equivalent seconds to the given format.
 * Uses actual bitrate ratio (not integer floor) for accurate capacity display:
 *   SP  (292kbps): factor = 1     → 80 min
 *   LP2 (132kbps): factor = 2.21  → ~177 min
 *   LP4 (66kbps):  factor = 4.42  → ~354 min
 */
export function convertCapacityForFormat(spSeconds: number, format: 'sp' | 'lp2' | 'lp4'): number {
  const bitrate = format === 'sp' ? 292 : format === 'lp2' ? 132 : 66;
  return spSeconds * (292 / bitrate);
}
