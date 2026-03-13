import { useEffect, useRef, useCallback } from 'react';
import { NetMDConnection } from '@netmd-studio/netmd';
import { useTransferStore } from './store';

export function useDeviceConnection() {
  const connectionRef = useRef<NetMDConnection | null>(null);
  const {
    connectionStatus,
    deviceInfo,
    toc,
    setConnectionStatus,
    setDeviceInfo,
    setTOC,
  } = useTransferStore();

  useEffect(() => {
    const conn = new NetMDConnection();
    connectionRef.current = conn;

    conn.on('onStatusChange', (status) => setConnectionStatus(status));
    conn.on('onDeviceIdentified', (info) => setDeviceInfo(info));
    conn.on('onTOCRead', (tocData) => setTOC(tocData));
    conn.on('onDisconnect', () => {
      setDeviceInfo(null);
      setTOC(null);
    });
    conn.on('onError', (error) => {
      console.error('[NetMD]', error);
    });

    // Auto-reconnect on mount
    conn.autoReconnect();

    return () => {
      conn.disconnect();
      connectionRef.current = null;
    };
  }, [setConnectionStatus, setDeviceInfo, setTOC]);

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
