/**
 * NetMD Connection Layer
 *
 * Adapted from Web MiniDisc Pro (asivery/webminidisc) patterns.
 * Uses netmd-js openNewDevice() / openPairedDevice() which handle
 * the full USB lifecycle (requestDevice + open + selectConfiguration +
 * claimInterface) internally. No raw WebUSB calls.
 *
 * Manual connect only — no auto-reconnect.
 */
import {
  openNewDevice,
  openPairedDevice,
  listContent,
  renameDisc as njsRenameDisc,
  prepareDownload,
  MDSession,
  MDTrack,
  Wireformat,
  Encoding,
  TrackFlag,
  type NetMDInterface,
  type Disc as NJSDisc,
  type Track as NJSTrack,
} from 'netmd-js';
import { makeGetAsyncPacketIteratorOnWorkerThread } from 'netmd-js/dist/web-encrypt-worker';
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
  isProtected: boolean;
}

export interface NetMDConnectionEvents {
  onStatusChange: (status: ConnectionStatus) => void;
  onDeviceIdentified: (device: NetMDDeviceEntry) => void;
  onTOCRead: (toc: DiscTOC) => void;
  onConnected: (device: NetMDDeviceEntry, toc: DiscTOC | null) => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
}

// Capacity in seconds for an 80-minute standard MD disc
const MD_80_TOTAL_SECONDS = 4800;
const SP_CAPACITY_SECONDS = MD_80_TOTAL_SECONDS;
const LP2_CAPACITY_SECONDS = MD_80_TOTAL_SECONDS * 2;
const LP4_CAPACITY_SECONDS = MD_80_TOTAL_SECONDS * 4;

// netmd-js uses 512-byte frames for duration. 1 second = 512 frames in SP.
const FRAMES_PER_SECOND = 512;

export function getCapacityForFormat(format: 'sp' | 'lp2' | 'lp4'): number {
  switch (format) {
    case 'sp': return SP_CAPACITY_SECONDS;
    case 'lp2': return LP2_CAPACITY_SECONDS;
    case 'lp4': return LP4_CAPACITY_SECONDS;
  }
}

/** Map netmd-js Wireformat enum to our format string */
const WIREFORMAT_MAP: Record<'sp' | 'lp2' | 'lp4', Wireformat> = {
  sp: Wireformat.pcm,
  lp2: Wireformat.lp2,
  lp4: Wireformat.lp4,
};

/** Map netmd-js Encoding enum to our format string */
function encodingToFormat(encoding: Encoding): 'sp' | 'lp2' | 'lp4' {
  switch (encoding) {
    case Encoding.sp: return 'sp';
    case Encoding.lp2: return 'lp2';
    case Encoding.lp4: return 'lp4';
    default: return 'sp';
  }
}

/** Convert netmd-js Disc to our DiscTOC */
function convertDisc(disc: NJSDisc): DiscTOC {
  const tracks: DiscTrack[] = [];
  for (const group of disc.groups) {
    for (const track of group.tracks) {
      tracks.push(convertTrack(track));
    }
  }
  tracks.sort((a, b) => a.index - b.index);

  const usedSeconds = Math.ceil(disc.used / FRAMES_PER_SECOND);
  const totalSeconds = Math.ceil(disc.total / FRAMES_PER_SECOND);
  const freeSeconds = Math.ceil(disc.left / FRAMES_PER_SECOND);

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

/** Convert a netmd-js Track to our DiscTrack */
function convertTrack(track: NJSTrack): DiscTrack {
  return {
    index: track.index,
    title: track.title ?? '',
    fullWidthTitle: track.fullWidthTitle ?? '',
    durationSeconds: Math.ceil(track.duration / FRAMES_PER_SECOND),
    encoding: encodingToFormat(track.encoding),
    channel: track.channel,
    isProtected: track.protected === TrackFlag.protected,
  };
}

export class NetMDConnection {
  private netmdInterface: NetMDInterface | null = null;
  private currentSession: MDSession | null = null;
  private cachedDisc: NJSDisc | null = null;
  private events: Partial<NetMDConnectionEvents> = {};
  private _status: ConnectionStatus = 'disconnected';
  private _deviceInfo: NetMDDeviceEntry | null = null;
  private _toc: DiscTOC | null = null;
  private _connecting = false;

  get status(): ConnectionStatus {
    return this._status;
  }

  get deviceInfo(): NetMDDeviceEntry | null {
    return this._deviceInfo;
  }

  get toc(): DiscTOC | null {
    return this._toc;
  }

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
   * Open the browser's device picker and connect to a new device.
   * Uses netmd-js openNewDevice() which handles requestDevice + open +
   * selectConfiguration + claimInterface internally.
   */
  async requestDevice(): Promise<boolean> {
    if (!NetMDConnection.isSupported()) {
      this.events.onError?.('WebUSB is not supported in this browser');
      return false;
    }

    if (this._connecting) {
      console.warn('[NetMD] requestDevice blocked — connection already in progress');
      return false;
    }

    if (this._status === 'connected') {
      return true;
    }

    this._connecting = true;
    try {
      console.log('[NetMD] requestDevice — opening device picker');
      this.setStatus('connecting');

      // netmd-js handles the entire USB lifecycle:
      // requestDevice({filters}) → device.open() → selectConfiguration(1) → claimInterface(0)
      const iface = await openNewDevice(navigator.usb);
      if (iface === null) {
        // User cancelled the device picker
        console.log('[NetMD] Device picker cancelled by user');
        this.setStatus('disconnected');
        return false;
      }

      return await this.initializeDevice(iface);
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
   * Reconnect to a previously paired device without showing the picker.
   * Uses netmd-js openPairedDevice() which calls getDevices() + open +
   * selectConfiguration + claimInterface internally.
   *
   * This is NOT called automatically. It's available for explicit
   * "reconnect" button use only.
   */
  async reconnectPaired(): Promise<boolean> {
    if (!NetMDConnection.isSupported()) return false;

    if (this._connecting) {
      console.warn('[NetMD] reconnectPaired blocked — connection already in progress');
      return false;
    }

    if (this._status === 'connected') {
      return true;
    }

    this._connecting = true;
    try {
      console.log('[NetMD] reconnectPaired — checking for previously paired devices');
      this.setStatus('connecting');

      const iface = await openPairedDevice(navigator.usb);
      if (iface === null) {
        console.log('[NetMD] No previously paired device found');
        this.setStatus('disconnected');
        return false;
      }

      return await this.initializeDevice(iface);
    } catch (err) {
      console.error('[NetMD] reconnectPaired failed:', err);
      this.setStatus('disconnected');
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to reconnect to device');
      return false;
    } finally {
      this._connecting = false;
    }
  }

  /**
   * Initialize a connected device: identify it, read the TOC, and
   * fire the batched onConnected event.
   */
  private async initializeDevice(iface: NetMDInterface): Promise<boolean> {
    try {
      this.netmdInterface = iface;

      // Identify the device from its USB IDs
      const vendorId = iface.netMd.getVendor();
      const productId = iface.netMd.getProduct();
      const deviceName = iface.netMd.getDeviceName();

      this._deviceInfo = identifyDevice(vendorId, productId) ?? {
        vendorId,
        productId,
        name: deviceName || 'Unknown NetMD Device',
        manufacturer: 'Unknown',
        modelNumber: 'Unknown',
        isHiMD: false,
      };

      console.log('[NetMD] Device identified: %s (VID=%s PID=%s)',
        this._deviceInfo.name,
        vendorId.toString(16).padStart(4, '0'),
        productId.toString(16).padStart(4, '0'));

      // Listen for USB disconnect events
      navigator.usb.addEventListener('disconnect', this.handleDisconnect);

      // Read the disc TOC
      console.log('[NetMD] Reading disc TOC...');
      await this.readTOCInternal(true);
      console.log('[NetMD] TOC read complete: %d tracks', this._toc?.trackCount ?? 0);

      // Fire a single batched event with all connection data
      this._status = 'connected';
      this.events.onConnected?.(this._deviceInfo, this._toc);
      console.log('[NetMD] Connection complete: %s', this._deviceInfo.name);

      return true;
    } catch (err) {
      console.error('[NetMD] initializeDevice failed:', err);
      await this.cleanupDevice();
      this.setStatus('disconnected');
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to initialize device');
      return false;
    }
  }

  private handleDisconnect = (event: USBConnectionEvent): void => {
    // Check if the disconnected device is ours
    if (this.netmdInterface && this.netmdInterface.netMd.isDeviceConnected(event.device)) {
      console.log('[NetMD] USB disconnect event for %s', this._deviceInfo?.name ?? 'unknown');
      navigator.usb.removeEventListener('disconnect', this.handleDisconnect);
      this.netmdInterface = null;
      this.currentSession = null;
      this.cachedDisc = null;
      this._deviceInfo = null;
      this._toc = null;
      this._connecting = false;
      this._status = 'disconnected';
      this.events.onDisconnect?.();
    }
  };

  /**
   * Read the disc TOC using netmd-js listContent().
   * Caches the raw netmd-js Disc for subsequent operations.
   */
  private async readTOCInternal(dropCache = false): Promise<DiscTOC | null> {
    if (!this.netmdInterface) return null;

    if (dropCache || !this.cachedDisc) {
      this.cachedDisc = await listContent(this.netmdInterface);
    }

    this._toc = convertDisc(this.cachedDisc);
    return this._toc;
  }

  /**
   * Public TOC refresh — reads from device and fires onTOCRead event.
   */
  async readTOC(): Promise<DiscTOC | null> {
    if (!this.netmdInterface) return null;

    const isRefresh = this._status === 'connected';
    const toc = await this.readTOCInternal(true);

    if (isRefresh && toc) {
      this.events.onTOCRead?.(toc);
    }

    return toc;
  }

  /**
   * Rename a track on the disc using netmd-js.
   */
  async setTrackTitle(trackIndex: number, title: string): Promise<boolean> {
    if (!this.netmdInterface) return false;

    try {
      await this.netmdInterface.setTrackTitle(trackIndex, title);

      // Update cache
      if (this.cachedDisc) {
        for (const group of this.cachedDisc.groups) {
          for (const track of group.tracks) {
            if (track.index === trackIndex) {
              track.title = title;
            }
          }
        }
        this._toc = convertDisc(this.cachedDisc);
        this.events.onTOCRead?.(this._toc);
      }

      return true;
    } catch (err) {
      console.error('[NetMD] setTrackTitle failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to rename track');
      return false;
    }
  }

  /**
   * Rename the disc using netmd-js.
   */
  async setDiscTitle(title: string): Promise<boolean> {
    if (!this.netmdInterface) return false;

    try {
      await njsRenameDisc(this.netmdInterface, title);

      // Update cache
      if (this.cachedDisc) {
        this.cachedDisc.title = title;
        this._toc = convertDisc(this.cachedDisc);
        this.events.onTOCRead?.(this._toc);
      }

      return true;
    } catch (err) {
      console.error('[NetMD] setDiscTitle failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to rename disc');
      return false;
    }
  }

  /**
   * Delete a track from the disc using netmd-js.
   */
  async deleteTrack(trackIndex: number): Promise<boolean> {
    if (!this.netmdInterface) return false;

    try {
      await this.netmdInterface.eraseTrack(trackIndex);

      // Drop the cache and re-read since track indices shift
      this.cachedDisc = null;
      await this.readTOCInternal(true);
      if (this._toc) {
        this.events.onTOCRead?.(this._toc);
      }

      return true;
    } catch (err) {
      console.error('[NetMD] deleteTrack failed:', err);
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to delete track');
      return false;
    }
  }

  /**
   * Prepare the device for a batch of track uploads.
   *
   * Following Web MiniDisc Pro's pattern exactly:
   *   prepareUpload() once → upload() per track → finalizeUpload() once
   *
   * This opens a single MDSession that persists across all tracks in the batch.
   * Call sendTrack() for each track, then call finalizeUpload() when done.
   */
  async prepareUpload(): Promise<boolean> {
    if (!this.netmdInterface) return false;

    try {
      await prepareDownload(this.netmdInterface);
      const session = new MDSession(this.netmdInterface);
      this.currentSession = session;
      await session.init();
      console.log('[NetMD] Upload session initialized');
      return true;
    } catch (err) {
      console.error('[NetMD] prepareUpload failed:', err);
      this.currentSession = null;
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to prepare upload session');
      return false;
    }
  }

  /**
   * Finalize the upload session. MUST be called after all tracks are sent,
   * even if a transfer failed. This closes the MDSession and releases the
   * device so it's ready for the next batch without a power cycle.
   */
  async finalizeUpload(): Promise<void> {
    try {
      if (this.currentSession) {
        await this.currentSession.close();
        console.log('[NetMD] Session closed');
      }
    } catch (err) {
      console.warn('[NetMD] session.close() failed (non-fatal):', err);
    }

    try {
      if (this.netmdInterface) {
        await this.netmdInterface.release();
        console.log('[NetMD] Interface released');
      }
    } catch (err) {
      console.warn('[NetMD] release() failed (non-fatal):', err);
    }

    this.currentSession = null;

    // Re-read TOC to reflect any new tracks
    this.cachedDisc = null;
    try {
      await this.readTOCInternal(true);
      if (this._toc) {
        this.events.onTOCRead?.(this._toc);
      }
    } catch (err) {
      console.warn('[NetMD] TOC re-read after finalize failed (non-fatal):', err);
    }
  }

  /**
   * Upload a single track within an active upload session.
   *
   * MUST be called between prepareUpload() and finalizeUpload().
   * For convenience, if no session is active, this method will open and
   * close one automatically (single-track mode), but callers transferring
   * multiple tracks should use the batch API for reliability.
   */
  async sendTrack(
    data: ArrayBuffer,
    format: 'sp' | 'lp2' | 'lp4',
    title: string,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    if (!this.netmdInterface) return false;

    // If no session is active, run in single-track mode with full lifecycle
    const isSingleTrackMode = this.currentSession === null;
    if (isSingleTrackMode) {
      const prepared = await this.prepareUpload();
      if (!prepared) return false;
    }

    let encryptWorker: Worker | null = null;

    try {
      const wireformat = WIREFORMAT_MAP[format];
      const total = data.byteLength;
      let written = 0;
      let encrypted = 0;

      // Create a fresh encryption worker per track (matches Web MiniDisc Pro)
      encryptWorker = new Worker(
        new URL('./encrypt-worker.ts', import.meta.url),
        { type: 'module' }
      );

      const encryptIterator = makeGetAsyncPacketIteratorOnWorkerThread(
        encryptWorker,
        ({ encryptedBytes }) => {
          encrypted = encryptedBytes;
          if (total > 0) {
            const percent = ((written + encrypted) / (total * 2)) * 100;
            onProgress?.(Math.min(percent, 100));
          }
        }
      );

      // Create the MDTrack with title, wireformat, and encryption iterator
      const mdTrack = new MDTrack(title, wireformat, data, 0x400, '', encryptIterator);

      // Send to device with progress callback
      await this.currentSession!.downloadTrack(mdTrack, (progress) => {
        written = progress.writtenBytes;
        if (total > 0) {
          const percent = ((written + encrypted) / (total * 2)) * 100;
          onProgress?.(Math.min(percent, 100));
        }
      });

      // Terminate worker after this track (fresh worker per track)
      encryptWorker.terminate();
      encryptWorker = null;

      // Drop cached content so next TOC read is fresh
      this.cachedDisc = null;

      return true;
    } catch (err) {
      console.error('[NetMD] sendTrack failed:', err);
      encryptWorker?.terminate();

      // Attempt session recovery on "Rejected" errors
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('rejected')) {
        console.warn('[NetMD] Device rejected transfer — attempting session recovery');
        await this.recoverSession();
      }

      this.events.onError?.(err instanceof Error ? err.message : 'Transfer failed');
      return false;
    } finally {
      // In single-track mode, always finalize even on failure
      if (isSingleTrackMode) {
        await this.finalizeUpload();
      }
    }
  }

  /**
   * Attempt to recover from a "Rejected" device state by tearing down
   * and re-initializing the session. This avoids requiring a power cycle.
   */
  private async recoverSession(): Promise<boolean> {
    console.log('[NetMD] Recovering session...');

    // Tear down the current session
    try {
      if (this.currentSession) {
        await this.currentSession.close();
      }
    } catch { /* ignore — session may already be dead */ }

    try {
      if (this.netmdInterface) {
        await this.netmdInterface.release();
      }
    } catch { /* ignore */ }

    this.currentSession = null;

    // Wait for the device firmware to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to re-read TOC to confirm the device is responsive
    try {
      if (this.netmdInterface) {
        this.cachedDisc = null;
        await this.readTOCInternal(true);
        console.log('[NetMD] Session recovery successful — device responsive');
        return true;
      }
    } catch (err) {
      console.error('[NetMD] Session recovery failed — device may need power cycle:', err);
    }

    return false;
  }

  /**
   * Cleanly disconnect from the device.
   */
  async disconnect(): Promise<void> {
    console.log('[NetMD] disconnect() called');
    await this.cleanupDevice();
    this._status = 'disconnected';
    this.events.onDisconnect?.();
  }

  private async cleanupDevice(): Promise<void> {
    navigator.usb.removeEventListener('disconnect', this.handleDisconnect);

    if (this.currentSession) {
      try {
        await this.currentSession.close();
      } catch { /* ignore */ }
      this.currentSession = null;
    }

    if (this.netmdInterface) {
      try {
        await this.netmdInterface.netMd.finalize();
      } catch { /* ignore */ }
      this.netmdInterface = null;
    }

    this.cachedDisc = null;
    this._deviceInfo = null;
    this._toc = null;
    this._connecting = false;
  }
}
