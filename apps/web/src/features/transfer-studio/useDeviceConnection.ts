import { useEffect, useRef, useCallback } from 'react';
import { NetMDConnection } from '@netmd-studio/netmd';
import { useTransferStore } from './store';

export function useDeviceConnection() {
  const connectionRef = useRef<NetMDConnection | null>(null);

  // Use individual selectors to avoid re-renders from unrelated state changes
  const connectionStatus = useTransferStore((s) => s.connectionStatus);
  const deviceInfo = useTransferStore((s) => s.deviceInfo);
  const toc = useTransferStore((s) => s.toc);

  useEffect(() => {
    const conn = new NetMDConnection();
    connectionRef.current = conn;

    // Use getState() for event handlers to avoid stale closures
    // and to batch updates where possible
    conn.on('onStatusChange', (status) => {
      // Only update status directly for intermediate states (connecting/error).
      // 'connected' is handled by setDeviceConnected batch,
      // 'disconnected' is handled by setDeviceDisconnected batch.
      if (status === 'connecting' || status === 'error') {
        useTransferStore.getState().setConnectionStatus(status);
      }
    });
    conn.on('onDeviceIdentified', () => {
      // No-op: device info will be batched in onConnected
    });
    conn.on('onTOCRead', (tocData) => {
      // For TOC updates after initial connection (e.g. refreshTOC, track rename),
      // we still need individual updates
      const state = useTransferStore.getState();
      if (state.connectionStatus === 'connected') {
        state.setTOC(tocData);
      }
    });
    conn.on('onDisconnect', () => {
      useTransferStore.getState().setDeviceDisconnected();
    });
    conn.on('onError', (error) => {
      console.error('[NetMD]', error);
    });
    conn.on('onConnected', (info, tocData) => {
      useTransferStore.getState().setDeviceConnected(info, tocData);
    });

    // Auto-reconnect on mount
    conn.autoReconnect();

    return () => {
      conn.disconnect();
      connectionRef.current = null;
    };
  }, []);

  const connect = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return false;
    return conn.requestDevice();
  }, []);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;
    await conn.disconnect();
  }, []);

  const refreshTOC = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;
    await conn.readTOC();
  }, []);

  const renameTrack = useCallback(async (index: number, title: string) => {
    const conn = connectionRef.current;
    if (!conn) return false;
    return conn.setTrackTitle(index, title);
  }, []);

  const renameDisc = useCallback(async (title: string) => {
    const conn = connectionRef.current;
    if (!conn) return false;
    return conn.setDiscTitle(title);
  }, []);

  const sendTrack = useCallback(
    async (data: ArrayBuffer, format: 'sp' | 'lp2' | 'lp4', title: string, onProgress?: (p: number) => void) => {
      const conn = connectionRef.current;
      if (!conn) return false;
      return conn.sendTrack(data, format, title, onProgress);
    },
    []
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
