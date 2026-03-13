import { NETMD_DEVICE_FILTERS, identifyDevice, type NetMDDeviceEntry } from './devices';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DiscTOC {
  title: string;
  trackCount: number;
  usedSeconds: number;
  totalSeconds: number;
  tracks: DiscTrack[];
}

export interface DiscTrack {
  index: number;
  title: string;
  durationSeconds: number;
  encoding: 'sp' | 'lp2' | 'lp4';
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
const MD_80_TOTAL_SECONDS = 4800; // 80 minutes
const SP_CAPACITY_SECONDS = MD_80_TOTAL_SECONDS;
const LP2_CAPACITY_SECONDS = MD_80_TOTAL_SECONDS * 2;
const LP4_CAPACITY_SECONDS = MD_80_TOTAL_SECONDS * 4;

export function getCapacityForFormat(format: 'sp' | 'lp2' | 'lp4'): number {
  switch (format) {
    case 'sp': return SP_CAPACITY_SECONDS;
    case 'lp2': return LP2_CAPACITY_SECONDS;
    case 'lp4': return LP4_CAPACITY_SECONDS;
  }
}

export class NetMDConnection {
  private usbDevice: USBDevice | null = null;
  private events: Partial<NetMDConnectionEvents> = {};
  private _status: ConnectionStatus = 'disconnected';
  private _deviceInfo: NetMDDeviceEntry | null = null;
  private _toc: DiscTOC | null = null;

  get status(): ConnectionStatus {
    return this._status;
  }

  get deviceInfo(): NetMDDeviceEntry | null {
    return this._deviceInfo;
  }

  get toc(): DiscTOC | null {
    return this._toc;
  }

  get device(): USBDevice | null {
    return this.usbDevice;
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

  async requestDevice(): Promise<boolean> {
    if (!NetMDConnection.isSupported()) {
      this.events.onError?.('WebUSB is not supported in this browser');
      return false;
    }

    try {
      this.setStatus('connecting');
      const device = await navigator.usb.requestDevice({ filters: NETMD_DEVICE_FILTERS });
      return await this.connectDevice(device);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        // User cancelled device picker — not an error
        this.setStatus('disconnected');
        return false;
      }
      this.setStatus('error');
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to request device');
      return false;
    }
  }

  async autoReconnect(): Promise<boolean> {
    if (!NetMDConnection.isSupported()) return false;

    try {
      const devices = await navigator.usb.getDevices();
      if (devices.length === 0) return false;

      // Try to connect to the first previously-authorized device
      for (const device of devices) {
        const entry = identifyDevice(device.vendorId, device.productId);
        if (entry) {
          return await this.connectDevice(device);
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private async connectDevice(device: USBDevice): Promise<boolean> {
    try {
      this.setStatus('connecting');
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      this.usbDevice = device;
      this._deviceInfo = identifyDevice(device.vendorId, device.productId) ?? {
        vendorId: device.vendorId,
        productId: device.productId,
        name: device.productName || 'Unknown NetMD Device',
        manufacturer: device.manufacturerName || 'Unknown',
        modelNumber: 'Unknown',
        isHiMD: false,
      };

      // Listen for disconnect
      navigator.usb.addEventListener('disconnect', this.handleDisconnect);

      // Read disc TOC (sets this._toc internally)
      await this.readTOC();

      // Fire a single batched event with all connection data at once.
      // This avoids multiple rapid state updates that cause UI jitter.
      this._status = 'connected';
      this.events.onConnected?.(this._deviceInfo, this._toc);

      return true;
    } catch (err) {
      this.setStatus('error');
      this.events.onError?.(err instanceof Error ? err.message : 'Failed to connect to device');
      return false;
    }
  }

  private handleDisconnect = (event: USBConnectionEvent): void => {
    if (event.device === this.usbDevice) {
      this.usbDevice = null;
      this._deviceInfo = null;
      this._toc = null;
      this._status = 'disconnected';
      // Fire a single disconnect event — the listener handles clearing all state at once
      this.events.onDisconnect?.();
    }
  };

  async readTOC(): Promise<DiscTOC | null> {
    if (!this.usbDevice) return null;

    // Track whether this is a post-connection refresh or initial read
    const isRefresh = this._status === 'connected';

    try {
      // In a real implementation, this would use netmd-js to read the disc TOC.
      // For now, we simulate the TOC structure.
      const result = await this.usbDevice.controlTransferIn(
        { requestType: 'vendor', recipient: 'interface', request: 0x01, value: 0, index: 0 },
        64
      );

      if (result.status === 'ok') {
        this._toc = {
          title: '',
          trackCount: 0,
          usedSeconds: 0,
          totalSeconds: SP_CAPACITY_SECONDS,
          tracks: [],
        };
        // Only fire onTOCRead for post-connection refreshes.
        // During initial connection, TOC is included in the batched onConnected event.
        if (isRefresh) {
          this.events.onTOCRead?.(this._toc);
        }
        return this._toc;
      }

      return null;
    } catch {
      this._toc = {
        title: '',
        trackCount: 0,
        usedSeconds: 0,
        totalSeconds: SP_CAPACITY_SECONDS,
        tracks: [],
      };
      if (isRefresh) {
        this.events.onTOCRead?.(this._toc);
      }
      return this._toc;
    }
  }

  async setTrackTitle(trackIndex: number, title: string): Promise<boolean> {
    if (!this.usbDevice || !this._toc) return false;

    try {
      // In production, this uses netmd-js: session.setTrackTitle(trackIndex, title)
      // For now, update local TOC state
      const track = this._toc.tracks.find((t) => t.index === trackIndex);
      if (track) {
        track.title = title;
        this.events.onTOCRead?.(this._toc);
      }
      return true;
    } catch {
      return false;
    }
  }

  async setDiscTitle(title: string): Promise<boolean> {
    if (!this.usbDevice || !this._toc) return false;

    try {
      this._toc.title = title;
      this.events.onTOCRead?.(this._toc);
      return true;
    } catch {
      return false;
    }
  }

  async sendTrack(
    data: ArrayBuffer,
    format: 'sp' | 'lp2' | 'lp4',
    title: string,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    if (!this.usbDevice) return false;

    try {
      // In production, this would use netmd-js:
      // const netmd = new NetMD(this.usbDevice);
      // const factory = await NetMDFactory.make(netmd);
      // const session = new MDSession(factory);
      // await session.pair();
      // await session.sendTrack(wireformat, data, title, progressCallback);
      // await session.unpair();

      // Simulate transfer with progress
      const totalChunks = 100;
      for (let i = 0; i <= totalChunks; i++) {
        await new Promise((r) => setTimeout(r, 20));
        onProgress?.((i / totalChunks) * 100);
      }

      // Add track to local TOC
      if (this._toc) {
        const durationSeconds = Math.floor(data.byteLength / (44100 * 2 * 2)); // rough estimate
        this._toc.tracks.push({
          index: this._toc.trackCount,
          title,
          durationSeconds,
          encoding: format,
          isProtected: false,
        });
        this._toc.trackCount++;
        this._toc.usedSeconds += durationSeconds;
        this.events.onTOCRead?.(this._toc);
      }

      return true;
    } catch (err) {
      this.events.onError?.(err instanceof Error ? err.message : 'Transfer failed');
      return false;
    }
  }

  async deleteTrack(trackIndex: number): Promise<boolean> {
    if (!this.usbDevice || !this._toc) return false;

    try {
      const track = this._toc.tracks.find((t) => t.index === trackIndex);
      if (track) {
        this._toc.tracks = this._toc.tracks.filter((t) => t.index !== trackIndex);
        this._toc.trackCount--;
        this._toc.usedSeconds -= track.durationSeconds;
        // Reindex remaining tracks
        this._toc.tracks.forEach((t, i) => { t.index = i; });
        this.events.onTOCRead?.(this._toc);
      }
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.usbDevice) {
      try {
        navigator.usb.removeEventListener('disconnect', this.handleDisconnect);
        await this.usbDevice.releaseInterface(0);
        await this.usbDevice.close();
      } catch {
        // Device may already be disconnected
      }
      this.usbDevice = null;
      this._deviceInfo = null;
      this._toc = null;
      this._status = 'disconnected';
      // Fire single disconnect event to clear all state at once in the store
      this.events.onDisconnect?.();
    }
  }
}
