/**
 * Singleton NetMDConnection instance and store integration.
 *
 * This module creates exactly ONE NetMDConnection for the entire app lifetime,
 * wires its events directly to the Zustand store, and exposes imperative
 * methods that any component can call without risk of duplicate connections.
 */
import toast from 'react-hot-toast';
import { NetMDConnection } from '@netmd-studio/netmd';
import { useTransferStore } from './store';

// ── singleton ──────────────────────────────────────────────
let conn: NetMDConnection | null = null;
let initialized = false;

function getConnection(): NetMDConnection {
  if (!conn) {
    conn = new NetMDConnection();
  }
  return conn;
}

/** Expose the singleton for use by the audio pipeline */
export function getConnectionInstance(): NetMDConnection {
  return getConnection();
}

/**
 * One-time wiring of NetMDConnection events → Zustand store.
 * Safe to call multiple times; only the first call takes effect.
 */
export function initConnection(): void {
  if (initialized) return;
  initialized = true;

  const c = getConnection();

  c.on('onStatusChange', (status) => {
    // Only relay 'connecting' to the store.
    // 'connected' is handled by the batched onConnected event.
    // 'disconnected' is handled by the batched onDisconnect event.
    if (status === 'connecting') {
      useTransferStore.getState().setConnectionStatus(status);
    }
  });

  c.on('onDeviceIdentified', () => {
    // Intentional no-op – included in batched onConnected.
  });

  c.on('onTOCRead', (tocData) => {
    // Post-connection TOC refreshes (rename, refresh button, etc.)
    const state = useTransferStore.getState();
    if (state.connectionStatus === 'connected') {
      state.setTOC(tocData);
    }
  });

  c.on('onConnected', (info, tocData) => {
    useTransferStore.getState().setDeviceConnected(info, tocData);
  });

  c.on('onDisconnect', () => {
    useTransferStore.getState().setDeviceDisconnected();
  });

  c.on('onError', (error) => {
    console.error('[NetMD]', error);
    toast.error(error);
  });
}

// ── public imperative API ──────────────────────────────────
// These are plain async functions, not hooks.

export async function connectDevice(): Promise<boolean> {
  initConnection();
  return getConnection().requestDevice();
}

export async function disconnectDevice(): Promise<void> {
  if (!conn) return;
  await conn.disconnect();
}

export async function refreshTOC(): Promise<void> {
  if (!conn) return;
  await conn.readTOC();
}

export async function renameTrack(index: number, title: string): Promise<boolean> {
  if (!conn) return false;
  return conn.setTrackTitle(index, title);
}

export async function renameDisc(title: string): Promise<boolean> {
  if (!conn) return false;
  return conn.setDiscTitle(title);
}

export async function prepareUpload(): Promise<boolean> {
  if (!conn) return false;
  return conn.prepareUpload();
}

export async function finalizeUpload(): Promise<void> {
  if (!conn) return;
  await conn.finalizeUpload();
}

export async function deleteTrack(index: number): Promise<boolean> {
  if (!conn) return false;
  return conn.deleteTrack(index);
}

export async function eraseDisc(): Promise<boolean> {
  if (!conn) return false;
  return conn.eraseDisc();
}

export async function sendTrack(
  data: ArrayBuffer,
  format: 'sp' | 'lp2' | 'lp4',
  title: string,
  onProgress?: (percent: number) => void,
): Promise<boolean> {
  if (!conn) return false;
  return conn.sendTrack(data, format, title, onProgress);
}
