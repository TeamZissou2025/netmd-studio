import type { TransferFormat } from './database';

export type TransferTrackStatus = 'queued' | 'encoding' | 'transferring' | 'done' | 'error';
export type EncodingStage = 'decoding' | 'encoding';

export interface TransferTrack {
  id: string;
  file: File;
  title: string;
  artist?: string;
  duration: number; // seconds, 0 if not yet decoded
  format: TransferFormat;
  status: TransferTrackStatus;
  encodeProgress: number; // 0-100
  encodeStage: EncodingStage;
  transferProgress: number; // 0-100
  error?: string;
  encodedData?: ArrayBuffer;
  encodedSize?: number; // bytes
}

export interface TransferQueueState {
  tracks: TransferTrack[];
  isTransferring: boolean;
  isPaused: boolean;
  currentTrackIndex: number;
  overallProgress: number;
  transferSpeed?: string; // e.g. "32x"
  estimatedTimeRemaining?: number; // seconds
}

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',         // MP3
  'audio/flac',         // FLAC
  'audio/wav',          // WAV
  'audio/x-wav',        // WAV alt
  'audio/ogg',          // OGG
  'audio/aac',          // AAC
  'audio/mp4',          // M4A
  'audio/x-m4a',        // M4A alt
] as const;

export const ACCEPTED_AUDIO_EXTENSIONS = [
  '.mp3', '.flac', '.wav', '.ogg', '.aac', '.m4a',
] as const;

// Disc capacity constants (80-minute standard MD)
export const MD_80_CAPACITY = {
  sp: { totalSeconds: 4800, label: '80 min' },
  lp2: { totalSeconds: 9600, label: '160 min' },
  lp4: { totalSeconds: 19200, label: '320 min' },
} as const;

// Bitrate estimates for file size calculation
export const FORMAT_BITRATES = {
  sp: 292, // kbps — ATRAC1
  lp2: 132, // kbps — ATRAC3
  lp4: 66,  // kbps — ATRAC3 joint stereo
} as const;

export function estimateEncodedSize(durationSeconds: number, format: TransferFormat): number {
  const bitrateKbps = FORMAT_BITRATES[format];
  return Math.ceil((bitrateKbps * 1000 * durationSeconds) / 8);
}
