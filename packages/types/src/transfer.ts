import type { TransferFormat } from './database';

export interface TransferTrack {
  id: string;
  file: File;
  title: string;
  duration: number;
  format: TransferFormat;
  status: 'queued' | 'encoding' | 'transferring' | 'done' | 'error';
  encodeProgress: number;
  transferProgress: number;
  error?: string;
  encodedData?: ArrayBuffer;
}

export interface TransferQueueState {
  tracks: TransferTrack[];
  isTransferring: boolean;
  currentTrackIndex: number;
  overallProgress: number;
}
