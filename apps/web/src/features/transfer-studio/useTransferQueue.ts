import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import type { TransferTrack } from '@netmd-studio/types';
import { ACCEPTED_AUDIO_TYPES, ACCEPTED_AUDIO_EXTENSIONS } from '@netmd-studio/types';
import { useTransferStore } from './store';
import { useAudioPipeline } from './useAudioPipeline';
import { sendTrack } from './connection';
import { supabase } from '../../lib/supabase';

let trackIdCounter = 0;

function generateTrackId(): string {
  return `track-${Date.now()}-${++trackIdCounter}`;
}

function isValidAudioFile(file: File): boolean {
  if (ACCEPTED_AUDIO_TYPES.includes(file.type as (typeof ACCEPTED_AUDIO_TYPES)[number])) {
    return true;
  }
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_AUDIO_EXTENSIONS.includes(ext as (typeof ACCEPTED_AUDIO_EXTENSIONS)[number]);
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}

export function useTransferQueue() {
  // Use individual selectors to prevent re-renders from unrelated state changes
  const tracks = useTransferStore((s) => s.tracks);
  const isTransferring = useTransferStore((s) => s.isTransferring);
  const isPaused = useTransferStore((s) => s.isPaused);
  const currentTrackIndex = useTransferStore((s) => s.currentTrackIndex);
  const overallProgress = useTransferStore((s) => s.overallProgress);
  const selectedFormat = useTransferStore((s) => s.selectedFormat);
  const connectionStatus = useTransferStore((s) => s.connectionStatus);
  const toc = useTransferStore((s) => s.toc);
  const addTracks = useTransferStore((s) => s.addTracks);
  const removeTrack = useTransferStore((s) => s.removeTrack);
  const clearQueue = useTransferStore((s) => s.clearQueue);
  const reorderTrack = useTransferStore((s) => s.reorderTrack);
  const setIsTransferring = useTransferStore((s) => s.setIsTransferring);
  const setIsPaused = useTransferStore((s) => s.setIsPaused);
  const setCurrentTrackIndex = useTransferStore((s) => s.setCurrentTrackIndex);
  const setSelectedFormat = useTransferStore((s) => s.setSelectedFormat);

  const cancelledRef = useRef(false);
  const pausedRef = useRef(false);

  const { encodeTrack, cancelEncoding, updateTrackTransferProgress, updateTrackStatus, updateOverallProgress } = useAudioPipeline();

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const valid = fileArray.filter(isValidAudioFile);
      const rejected = fileArray.length - valid.length;

      if (rejected > 0) {
        toast.error(`${rejected} file${rejected > 1 ? 's' : ''} rejected — unsupported format`);
      }

      if (valid.length === 0) return;

      const newTracks: TransferTrack[] = valid.map((file) => ({
        id: generateTrackId(),
        file,
        title: stripExtension(file.name),
        duration: 0,
        format: selectedFormat,
        status: 'queued',
        encodeProgress: 0,
        encodeStage: 'decoding' as const,
        transferProgress: 0,
      }));

      addTracks(newTracks);
      toast.success(`Added ${valid.length} track${valid.length > 1 ? 's' : ''}`);
    },
    [selectedFormat, addTracks]
  );

  const startTransfer = useCallback(async () => {
    if (connectionStatus !== 'connected') {
      toast.error('No device connected');
      return;
    }

    const queuedTracks = useTransferStore.getState().tracks.filter((t) => t.status === 'queued');
    if (queuedTracks.length === 0) {
      toast.error('No tracks in queue');
      return;
    }

    cancelledRef.current = false;
    pausedRef.current = false;
    setIsTransferring(true);
    setIsPaused(false);

    const startTime = Date.now();
    let completedCount = 0;
    const trackDetails: Array<{ title: string; format: string; duration_seconds: number; size_bytes: number }> = [];

    for (let i = 0; i < queuedTracks.length; i++) {
      if (cancelledRef.current) break;

      // Wait while paused
      while (pausedRef.current && !cancelledRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelledRef.current) break;

      const track = queuedTracks[i];
      setCurrentTrackIndex(useTransferStore.getState().tracks.findIndex((t) => t.id === track.id));

      try {
        // Phase 1: Encode
        const { data, durationSeconds } = await encodeTrack(track.id, track.file, track.format);

        if (cancelledRef.current) break;

        // Phase 2: Transfer to device
        updateTrackStatus(track.id, 'transferring');
        const success = await sendTrack(data, track.format, track.title, (percent) => {
          updateTrackTransferProgress(track.id, percent);
          updateOverallProgress();
        });

        if (success) {
          updateTrackStatus(track.id, 'done');
          updateTrackTransferProgress(track.id, 100);
          completedCount++;
          trackDetails.push({
            title: track.title,
            format: track.format,
            duration_seconds: Math.round(durationSeconds),
            size_bytes: data.byteLength,
          });
        } else {
          updateTrackStatus(track.id, 'error');
        }
      } catch (err) {
        // Error already set by pipeline
        console.error(`Transfer failed for ${track.title}:`, err);
      }

      updateOverallProgress();
    }

    setIsTransferring(false);
    setCurrentTrackIndex(-1);

    if (completedCount > 0) {
      toast.success(`Transferred ${completedCount} track${completedCount > 1 ? 's' : ''}`);

      // Save transfer history to Supabase
      saveTransferHistory(trackDetails, startTime, completedCount);
    }
  }, [
    connectionStatus,
    encodeTrack,
    setIsTransferring,
    setIsPaused,
    setCurrentTrackIndex,
    updateTrackStatus,
    updateTrackTransferProgress,
    updateOverallProgress,
  ]);

  const pauseTransfer = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, [setIsPaused]);

  const resumeTransfer = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
  }, [setIsPaused]);

  const cancelTransfer = useCallback(() => {
    cancelledRef.current = true;
    pausedRef.current = false;
    setIsTransferring(false);
    setIsPaused(false);
    setCurrentTrackIndex(-1);

    // Reset all encoding/transferring tracks back to queued
    const current = useTransferStore.getState().tracks;
    current.forEach((t) => {
      if (t.status === 'encoding' || t.status === 'transferring') {
        cancelEncoding(t.id);
        updateTrackStatus(t.id, 'queued');
        updateTrackTransferProgress(t.id, 0);
      }
    });
  }, [setIsTransferring, setIsPaused, setCurrentTrackIndex, cancelEncoding, updateTrackStatus, updateTrackTransferProgress]);

  return {
    tracks,
    isTransferring,
    isPaused,
    currentTrackIndex,
    overallProgress,
    selectedFormat,
    toc,
    addFiles,
    removeTrack,
    clearQueue,
    reorderTrack,
    setSelectedFormat,
    startTransfer,
    pauseTransfer,
    resumeTransfer,
    cancelTransfer,
  };
}

async function saveTransferHistory(
  trackDetails: Array<{ title: string; format: string; duration_seconds: number; size_bytes: number }>,
  startTime: number,
  completedCount: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const store = useTransferStore.getState();
    const totalDuration = trackDetails.reduce((sum, t) => sum + t.duration_seconds, 0);
    const totalBytes = trackDetails.reduce((sum, t) => sum + t.size_bytes, 0);

    await supabase.from('transfer_history').insert({
      user_id: user.id,
      device_name: store.deviceInfo?.name ?? 'Unknown Device',
      disc_title: store.toc?.title ?? '',
      tracks: trackDetails,
      transfer_format: store.selectedFormat,
      total_tracks: completedCount,
      total_duration_seconds: totalDuration,
      total_bytes: totalBytes,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      success: true,
    });
  } catch (err) {
    console.error('Failed to save transfer history:', err);
  }
}
