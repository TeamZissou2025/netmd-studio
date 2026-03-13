export interface DeviceInfo {
  vendorId: number;
  productId: number;
  name: string;
  manufacturer: string;
  modelNumber: string;
}

export interface ConnectedDevice {
  usbDevice: unknown;
  info: DeviceInfo;
  discTitle: string;
  trackCount: number;
  freeSpace: number;
  totalSpace: number;
}

export interface DeviceTrack {
  index: number;
  title: string;
  duration: number;
  format: 'sp' | 'lp2' | 'lp4';
  protected: boolean;
}
