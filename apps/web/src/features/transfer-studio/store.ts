import { create } from 'zustand';
import type { TransferTrack, TransferQueueState, EncodingStage } from '@netmd-studio/types';
import type { TransferFormat } from '@netmd-studio/types';
import type { ConnectionStatus, DiscTOC, NetMDDeviceEntry } from '@netmd-studio/netmd';

interface DeviceState {
  connectionStatus: ConnectionStatus;
  deviceInfo: NetMDDeviceEntry | null;
  toc: DiscTOC | null;
}

interface TransferStore extends TransferQueueState, DeviceState {
  selectedFormat: TransferFormat;

  // Device actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setDeviceInfo: (info: NetMDDeviceEntry | null) => void;
  setTOC: (toc: DiscTOC | null) => void;
  setDeviceConnected: (info: NetMDDeviceEntry, toc: DiscTOC | null) => void;
  setDeviceDisconnected: () => void;

  // Queue actions
  setSelectedFormat: (format: TransferFormat) => void;
  addTracks: (tracks: TransferTrack[]) => void;
  removeTrack: (id: string) => void;
  clearQueue: () => void;
  reorderTrack: (fromIndex: number, toIndex: number) => void;
  updateTrackStatus: (id: string, status: TransferTrack['status']) => void;
  updateTrackEncodeProgress: (id: string, percent: number, stage: EncodingStage) => void;
  updateTrackTransferProgress: (id: string, percent: number) => void;
  updateTrackDuration: (id: string, duration: number) => void;
  setTrackEncodedData: (id: string, data: ArrayBuffer, size: number) => void;
  setTrackError: (id: string, error: string) => void;
  setIsTransferring: (isTransferring: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setCurrentTrackIndex: (index: number) => void;
  updateOverallProgress: () => void;
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  // Device state
  connectionStatus: 'disconnected',
  deviceInfo: null,
  toc: null,

  // Queue state
  tracks: [],
  isTransferring: false,
  isPaused: false,
  currentTrackIndex: -1,
  overallProgress: 0,
  selectedFormat: 'sp',

  // Device actions
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setDeviceInfo: (deviceInfo) => set({ deviceInfo }),
  setTOC: (toc) => set({ toc }),
  setDeviceConnected: (deviceInfo, toc) =>
    set({ connectionStatus: 'connected', deviceInfo, toc }),
  setDeviceDisconnected: () =>
    set({ connectionStatus: 'disconnected', deviceInfo: null, toc: null }),

  // Queue actions
  setSelectedFormat: (selectedFormat) =>
    set((state) => ({
      selectedFormat,
      tracks: state.tracks.map((t) =>
        t.status === 'queued' ? { ...t, format: selectedFormat, encodedData: undefined, encodedSize: undefined } : t
      ),
    })),

  addTracks: (newTracks) =>
    set((state) => ({ tracks: [...state.tracks, ...newTracks] })),

  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
    })),

  clearQueue: () =>
    set({ tracks: [], currentTrackIndex: -1, overallProgress: 0, isTransferring: false, isPaused: false }),

  reorderTrack: (fromIndex, toIndex) =>
    set((state) => {
      const tracks = [...state.tracks];
      const [removed] = tracks.splice(fromIndex, 1);
      tracks.splice(toIndex, 0, removed);
      return { tracks };
    }),

  updateTrackStatus: (id, status) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  updateTrackEncodeProgress: (id, encodeProgress, encodeStage) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, encodeProgress, encodeStage } : t)),
    })),

  updateTrackTransferProgress: (id, transferProgress) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, transferProgress } : t)),
    })),

  updateTrackDuration: (id, duration) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, duration } : t)),
    })),

  setTrackEncodedData: (id, encodedData, encodedSize) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, encodedData, encodedSize } : t)),
    })),

  setTrackError: (id, error) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, error, status: 'error' } : t)),
    })),

  setIsTransferring: (isTransferring) => set({ isTransferring }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setCurrentTrackIndex: (currentTrackIndex) => set({ currentTrackIndex }),

  updateOverallProgress: () => {
    const { tracks } = get();
    if (tracks.length === 0) {
      set({ overallProgress: 0 });
      return;
    }
    const done = tracks.filter((t) => t.status === 'done').length;
    const current = tracks.find((t) => t.status === 'encoding' || t.status === 'transferring');
    const currentProgress = current
      ? (current.encodeProgress * 0.5 + current.transferProgress * 0.5) / 100
      : 0;
    const overallProgress = ((done + currentProgress) / tracks.length) * 100;
    set({ overallProgress });
  },
}));
