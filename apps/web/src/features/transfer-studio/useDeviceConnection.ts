import { useCallback } from 'react';
import { NetMDConnection } from '@netmd-studio/netmd';
import { useTransferStore } from './store';
import {
  connectDevice,
  disconnectDevice,
  refreshTOC as refreshTOCAction,
  renameTrack as renameTrackAction,
  renameDisc as renameDiscAction,
  sendTrack as sendTrackAction,
} from './connection';

/**
 * Thin accessor hook — reads device state from the Zustand store and
 * exposes imperative actions that delegate to the singleton connection.
 *
 * This hook creates NO NetMDConnection instance and has NO useEffect.
 * All connection lifecycle is managed by the singleton in connection.ts
 * and initialised once in TransferStudioPage.
 */
export function useDeviceConnection() {
  const connectionStatus = useTransferStore((s) => s.connectionStatus);
  const deviceInfo = useTransferStore((s) => s.deviceInfo);
  const toc = useTransferStore((s) => s.toc);

  const connect = useCallback(() => connectDevice(), []);
  const disconnect = useCallback(() => disconnectDevice(), []);
  const refreshTOC = useCallback(() => refreshTOCAction(), []);
  const renameTrack = useCallback(
    (index: number, title: string) => renameTrackAction(index, title),
    [],
  );
  const renameDisc = useCallback(
    (title: string) => renameDiscAction(title),
    [],
  );
  const sendTrack = useCallback(
    (data: ArrayBuffer, format: 'sp' | 'lp2' | 'lp4', title: string, onProgress?: (p: number) => void) =>
      sendTrackAction(data, format, title, onProgress),
    [],
  );

  return {
    connectionStatus,
    deviceInfo,
    toc,
    isSupported: NetMDConnection.isSupported(),
    connect,
    disconnect,
    refreshTOC,
    renameTrack,
    renameDisc,
    sendTrack,
  };
}
