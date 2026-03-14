// @ffmpeg/ffmpeg@0.6.1 module declaration (no @types available)
declare module '@ffmpeg/ffmpeg' {
    export function setLogging(enabled: boolean): void;
    export function createWorker(options?: {
        logger?: (payload: { message: string; action: string }) => void;
        corePath?: string;
        workerPath?: string;
    }): {
        load(): Promise<void>;
        write(filename: string, data: File | Uint8Array): Promise<void>;
        read(filename: string): Promise<{ data: Uint8Array }>;
        transcode(input: string, output: string, args: string): Promise<void>;
        run(args: string): Promise<void>;
        worker: Worker;
    };
}

// WebUSB API type declarations
// These types are not included in standard TypeScript DOM lib
// Ref: https://developer.chrome.com/docs/capabilities/usb

interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[];
}

interface USBDevice {
  readonly vendorId: number;
  readonly productId: number;
  readonly productName: string;
  readonly manufacturerName: string;
  readonly serialNumber: string;
  readonly configuration: USBConfiguration | null;
  readonly configurations: USBConfiguration[];
  readonly opened: boolean;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>;
  controlTransferIn(
    setup: USBControlTransferParameters,
    length: number
  ): Promise<USBInTransferResult>;
  controlTransferOut(
    setup: USBControlTransferParameters,
    data?: BufferSource
  ): Promise<USBOutTransferResult>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
  isochronousTransferIn(
    endpointNumber: number,
    packetLengths: number[]
  ): Promise<USBIsochronousInTransferResult>;
  isochronousTransferOut(
    endpointNumber: number,
    data: BufferSource,
    packetLengths: number[]
  ): Promise<USBIsochronousOutTransferResult>;
  reset(): Promise<void>;
}

interface USBConfiguration {
  readonly configurationValue: number;
  readonly configurationName: string;
  readonly interfaces: USBInterface[];
}

interface USBInterface {
  readonly interfaceNumber: number;
  readonly alternate: USBAlternateInterface;
  readonly alternates: USBAlternateInterface[];
  readonly claimed: boolean;
}

interface USBAlternateInterface {
  readonly alternateSetting: number;
  readonly interfaceClass: number;
  readonly interfaceSubclass: number;
  readonly interfaceProtocol: number;
  readonly interfaceName: string;
  readonly endpoints: USBEndpoint[];
}

interface USBEndpoint {
  readonly endpointNumber: number;
  readonly direction: USBDirection;
  readonly type: USBEndpointType;
  readonly packetSize: number;
}

type USBDirection = 'in' | 'out';
type USBEndpointType = 'bulk' | 'interrupt' | 'isochronous';
type USBTransferStatus = 'ok' | 'stall' | 'babble';
type USBRequestType = 'standard' | 'class' | 'vendor';
type USBRecipient = 'device' | 'interface' | 'endpoint' | 'other';

interface USBControlTransferParameters {
  requestType: USBRequestType;
  recipient: USBRecipient;
  request: number;
  value: number;
  index: number;
}

interface USBInTransferResult {
  readonly data: DataView | undefined;
  readonly status: USBTransferStatus;
}

interface USBOutTransferResult {
  readonly bytesWritten: number;
  readonly status: USBTransferStatus;
}

interface USBIsochronousInTransferResult {
  readonly data: DataView | undefined;
  readonly packets: USBIsochronousInTransferPacket[];
}

interface USBIsochronousOutTransferResult {
  readonly packets: USBIsochronousOutTransferPacket[];
}

interface USBIsochronousInTransferPacket {
  readonly data: DataView | undefined;
  readonly status: USBTransferStatus;
}

interface USBIsochronousOutTransferPacket {
  readonly bytesWritten: number;
  readonly status: USBTransferStatus;
}

interface USBConnectionEvent extends Event {
  readonly device: USBDevice;
}

interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (event: USBConnectionEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (event: USBConnectionEvent) => void,
    options?: boolean | EventListenerOptions
  ): void;
}

interface Navigator {
  readonly usb: USB;
}
