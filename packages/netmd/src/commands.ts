import { NetMDConnection, type DiscTOC, type DiscTrack } from './connection';

// High-level NetMD command wrappers that provide a clean API
// for the Transfer Studio UI to interact with connected devices.

export interface TrackUpload {
  data: ArrayBuffer;
  format: 'sp' | 'lp2' | 'lp4';
  title: string;
}

export class NetMDCommands {
  constructor(private connection: NetMDConnection) {}

  get isConnected(): boolean {
    return this.connection.status === 'connected';
  }

  get toc(): DiscTOC | null {
    return this.connection.toc;
  }

  get tracks(): DiscTrack[] {
    return this.connection.toc?.tracks ?? [];
  }

  get discTitle(): string {
    return this.connection.toc?.title ?? '';
  }

  get freeSeconds(): number {
    const toc = this.connection.toc;
    if (!toc) return 0;
    return toc.totalSeconds - toc.usedSeconds;
  }

  async renameTrack(index: number, title: string): Promise<boolean> {
    return this.connection.setTrackTitle(index, title);
  }

  async renameDisc(title: string): Promise<boolean> {
    return this.connection.setDiscTitle(title);
  }

  async deleteTrack(index: number): Promise<boolean> {
    return this.connection.deleteTrack(index);
  }

  async uploadTrack(
    upload: TrackUpload,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    return this.connection.sendTrack(upload.data, upload.format, upload.title, onProgress);
  }

  async refreshTOC(): Promise<DiscTOC | null> {
    return this.connection.readTOC();
  }
}
