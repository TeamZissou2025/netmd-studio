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
  DefaultMinidiscSpec,
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

const mdSpec = new DefaultMinidiscSpec();

/**
 * Convert WMD Disc type to our DiscTOC.
 *
 * WMD's convertDiscToWMD divides netmd-js raw byte counts by 512 to get
 * "WMD frames." Because netmd-js stores time as (seconds * 512 + subframes),
 * dividing by 512 gives seconds (with minor rounding from subframes).
 *
 * disc.used, disc.left, disc.total are ALL in seconds (after WMD conversion).
 * Track durations are also in seconds (after WMD conversion).
 */
function convertDisc(disc: WMDDisc): DiscTOC {
  const tracks: DiscTrack[] = [];
  for (const group of disc.groups) {
    for (const track of group.tracks) {
      tracks.push(convertTrack(track));
    }
  }
  tracks.sort((a, b) => a.index - b.index);

  // disc.total, disc.used, disc.left are all in seconds after WMD's
  // convertDiscToWMD divides netmd-js raw frames by 512.
  // Use the device-reported values directly — they come from getDiscCapacity()
  // which returns the actual hardware-reported used/total/left times.
  const totalSeconds = disc.total;
  const usedSeconds = disc.used;
  const freeSeconds = disc.left;

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

  return {
    index: track.index,
    title: track.title ?? '',
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
   * Open browser device picker. Uses NetMDUSBService.pair() — the SAME
   * method Web MiniDisc Pro calls when a user clicks "Connect".
   */
  async requestDevice(): Promise<boolean> {
    if (!NetMDConnection.isSupported()) {
      this.events.onError?.('WebUSB is not supported in this browser');
      return false;
    }
    if (this._connecting) return false;
    if (this._status === 'connected') return true;

    this._connecting = true;
    try {
      this.setStatus('connecting');

      // This is what WMD calls — openNewDevice internally
      const paired = await this.service.pair();
      if (!paired) {
        this.setStatus('disconnected');
        return false;
      }

      return await this.initializeDevice();
    } catch (err) {
      console.error('[NetMD] requestDevice failed:', err);
      this.setStatus('disconnected');
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
    try {
      this.setStatus('connecting');

      const connected = await this.service.connect();
      if (!connected) {
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
      const vendorId = this.service.getVendorId();
      const productId = this.service.getProductId();
      const deviceName = await this.service.getDeviceName();

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

      // Read TOC using the SAME listContent call WMD uses
      const disc = await this.service.listContent(true);
      this._toc = convertDisc(disc);

      this._status = 'connected';
      this.events.onConnected?.(this._deviceInfo, this._toc);
      return true;
    } catch (err) {
      console.error('[NetMD] initializeDevice failed:', err);
      this.setStatus('disconnected');
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to initialize device');
      return false;
    }
  }

  private handleDisconnect = (event: USBConnectionEvent): void => {
    if (this.service.isDeviceConnected(event.device)) {
      navigator.usb.removeEventListener('disconnect', this.handleDisconnect);
      this._deviceInfo = null;
      this._toc = null;
      this._connecting = false;
      this._status = 'disconnected';
      this.events.onDisconnect?.();
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

    // Check disc capacity using device-reported free space (disc.left from getDiscCapacity)
    if (this._toc) {
      const freeSeconds = this._toc.freeSeconds;
      console.log('[NetMD]   disc free=%s, track needs=%s',
        formatTime(freeSeconds), formatTime(trackDurationSec));
      // Only block if the track clearly exceeds free space (30s tolerance for
      // rounding between our duration estimate and device-reported capacity)
      if (trackDurationSec > freeSeconds + 30) {
        const msg = `Not enough disc space: track is ${formatTime(trackDurationSec)} but only ${formatTime(freeSeconds)} free`;
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
    navigator.usb.removeEventListener('disconnect', this.handleDisconnect);
    try {
      await this.service.finalize();
    } catch { /* ignore */ }
    this._deviceInfo = null;
    this._toc = null;
    this._connecting = false;
    this._status = 'disconnected';
    this.events.onDisconnect?.();
  }
}

/**
 * Convert disc free time from SP-equivalent seconds to the given format.
 * Uses the SAME formula as WMD's DefaultMinidiscSpec.translateDefaultMeasuringModeTo:
 *   floor(292 / bitrate) * spDuration
 *
 * SP (292kbps): factor = 1 → 80 min
 * LP2 (132kbps): factor = floor(292/132) = 2 → 160 min
 * LP4 (66kbps): factor = floor(292/66) = 4 → 320 min
 */
export function convertCapacityForFormat(spSeconds: number, format: 'sp' | 'lp2' | 'lp4'): number {
  const codec = formatToCodec(format);
  return mdSpec.translateDefaultMeasuringModeTo(codec, spSeconds);
}
