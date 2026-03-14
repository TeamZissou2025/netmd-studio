/**
 * Vendor barrel — re-exports from Web MiniDisc Pro's service layer.
 */
export {
    NetMDUSBService,
    DefaultMinidiscSpec,
    WireformatDict,
    convertDiscToWMD,
    convertDiscToNJS,
    convertTrackToWMD,
    convertTrackToNJS,
    Capability,
    type Codec,
    type CodecFamily,
    type Disc,
    type Track,
    type Group,
    type MinidiscSpec,
    type DeviceStatus,
    type TitleParameter,
} from './netmd-service';

export {
    AtracdencAudioExportService,
} from './atracdenc-export';

export {
    DefaultFfmpegAudioExportService,
    type AudioExportService,
    type ExportParams,
} from './audio-export';

export { AtracdencProcess } from './atracdenc-worker';
