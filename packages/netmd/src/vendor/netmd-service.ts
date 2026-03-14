/**
 * Vendored from Web MiniDisc Pro (asivery/webminidisc) — src/services/interfaces/netmd.ts
 *
 * This is the EXACT service class that Web MiniDisc Pro uses for device communication.
 * Only modifications: import paths adjusted, factory/exploit code removed (not needed
 * for basic SP/LP2/LP4 transfers), himd-js types replaced with string literal.
 *
 * The upload pipeline (prepareUpload → upload → finalizeUpload) is BYTE-FOR-BYTE
 * identical to Web MiniDisc Pro.
 */
import {
    openNewDevice,
    NetMDInterface,
    Disc as NetMDDisc,
    listContent,
    openPairedDevice,
    Wireformat,
    MDTrack,
    getDeviceStatus,
    DeviceStatus as NetMDDeviceStatus,
    Group as NetMDGroup,
    renameDisc,
    DiscFormat,
    DiscFlag,
    rewriteDiscGroups,
    MDSession,
    prepareDownload,
    Track as NetMDTrack,
    Encoding,
    TrackFlag,
    getRemainingCharactersForTitles,
    getCellsForTitle,
    upload,
} from 'netmd-js';
import { makeGetAsyncPacketIteratorOnWorkerThread } from 'netmd-js/dist/web-encrypt-worker';
import { Logger } from 'netmd-js/dist/logger';
import { sanitizeHalfWidthTitle, sanitizeFullWidthTitle } from 'netmd-js/dist/utils';
import { asyncMutex, sleep, isSequential, recomputeGroupsAfterTrackMove } from './utils';
import { Mutex } from 'async-mutex';
import EncryptWorker from 'netmd-js/dist/web-encrypt-worker?worker';

export enum Capability {
    contentList,
    playbackControl,
    metadataEdit,
    trackUpload,
    trackDownload,
    discEject,
    factoryMode,
    himdTitles,
    fullWidthSupport,
    nativeMonoUpload,
    himdFormat,
}

export type CodecFamily = 'SPS' | 'SPM' | 'AT3' | 'A3+' | 'PCM' | 'MP3';

export interface Codec {
    codec: CodecFamily;
    bitrate: number;
}

export interface Track {
    index: number;
    title: string | null;
    fullWidthTitle: string | null;
    duration: number;
    channel: number;
    encoding: Codec;
    protected: TrackFlag;

    album?: string;
    artist?: string;
}

export interface Group {
    index: number;
    title: string | null;
    fullWidthTitle: string | null;
    tracks: Track[];
}

export interface Disc {
    title: string;
    fullWidthTitle: string;
    writable: boolean;
    writeProtected: boolean;
    used: number;
    left: number;
    total: number;
    trackCount: number;
    groups: Group[];
}

export interface MinidiscSpec {
    readonly availableFormats: { codec: CodecFamily; defaultBitrate: number; userFriendlyName?: string; availableBitrates: number[] }[];
    readonly defaultFormat: [number, number];
    readonly specName: string;
    readonly measurementUnits: 'bytes' | 'frames';
    sanitizeHalfWidthTitle(title: string): string;
    sanitizeFullWidthTitle(title: string): string;
    getRemainingCharactersForTitles(disc: Disc): { halfWidth: number; fullWidth: number };
    getCharactersForTitle(track: Track): { halfWidth: number; fullWidth: number };
    translateDefaultMeasuringModeTo(mode: Codec, defaultMeasuringModeDuration: number): number;
    translateToDefaultMeasuringModeFrom(mode: Codec, durationInMode: number): number;
}

export type DeviceStatus = NetMDDeviceStatus & { canBeFlushed?: boolean };

export const WireformatDict: { [k: string]: Wireformat } = {
    SP: Wireformat.pcm,
    LP2: Wireformat.lp2,
    LP105: Wireformat.l105kbps,
    LP4: Wireformat.lp4,
};

export type TitleParameter = string | { title?: string; album?: string; artist?: string };

export class DefaultMinidiscSpec implements MinidiscSpec {
    public readonly availableFormats = [
        { codec: 'SPS' as CodecFamily, defaultBitrate: 292, userFriendlyName: 'SP', availableBitrates: [292] },
        { codec: 'SPM' as CodecFamily, defaultBitrate: 146, userFriendlyName: 'MONO', availableBitrates: [146] },
        { codec: 'AT3' as CodecFamily, defaultBitrate: 132, userFriendlyName: 'LP2', availableBitrates: [132] },
        { codec: 'AT3' as CodecFamily, defaultBitrate: 66, userFriendlyName: 'LP4', availableBitrates: [66] },
    ];
    public readonly defaultFormat = [0, 0] as [number, number];
    public readonly specName = 'MD';
    public readonly measurementUnits = 'frames' as const;

    sanitizeHalfWidthTitle(title: string): string {
        return sanitizeHalfWidthTitle(title);
    }
    sanitizeFullWidthTitle(title: string): string {
        return sanitizeFullWidthTitle(title);
    }

    getRemainingCharactersForTitles(disc: Disc) {
        return getRemainingCharactersForTitles(convertDiscToNJS(disc));
    }

    getCharactersForTitle(track: Track) {
        const { halfWidth, fullWidth } = getCellsForTitle(convertTrackToNJS(track));
        return {
            halfWidth: halfWidth * 7,
            fullWidth: fullWidth * 7,
        };
    }

    translateDefaultMeasuringModeTo(mode: Codec, defaultMeasuringModeDuration: number): number {
        return Math.floor(292 / mode.bitrate) * defaultMeasuringModeDuration;
    }
    translateToDefaultMeasuringModeFrom(mode: Codec, durationInMode: number): number {
        return durationInMode / Math.floor(292 / mode.bitrate);
    }
}

// Compatibility methods — convert between WMD types and netmd-js types
export function convertDiscToWMD(source: NetMDDisc): Disc {
    return {
        ...source,
        left: Math.ceil(source.left / 512),
        total: Math.ceil(source.total / 512),
        groups: source.groups.map(convertGroupToWMD),
    };
}

export function convertDiscToNJS(source: Disc): NetMDDisc {
    return {
        ...source,
        left: source.left * 512,
        total: source.total * 512,
        groups: source.groups.map(convertGroupToNJS),
    };
}

export function convertGroupToWMD(source: NetMDGroup): Group {
    return {
        ...source,
        tracks: source.tracks.map(convertTrackToWMD),
    };
}

export function convertGroupToNJS(source: Group): NetMDGroup {
    return {
        ...source,
        tracks: source.tracks.map(convertTrackToNJS),
    };
}

export function convertTrackToWMD(source: NetMDTrack) {
    return {
        ...source,
        duration: Math.ceil(source.duration / 512),
        encoding: {
            [Encoding.sp]: source.channel === 1 ? { codec: 'SPM', bitrate: 146 } : { codec: 'SPS', bitrate: 292 },
            [Encoding.lp2]: { codec: 'AT3', bitrate: 132 },
            [Encoding.lp4]: { codec: 'AT3', bitrate: 66 },
        }[source.encoding]! as Codec,
    };
}

export function convertTrackToNJS(source: Track): NetMDTrack {
    return {
        ...source,
        duration: source.duration * 512,
        encoding: source.encoding.codec.startsWith('SP') ? Encoding.sp : source.encoding.bitrate === 132 ? Encoding.lp2 : Encoding.lp4,
    };
}

export class NetMDUSBService {
    mutex: Mutex = new Mutex();
    private netmdInterface?: NetMDInterface;
    private logger?: Logger;
    private cachedContentList?: Disc;
    public statusMonitorTimer: any;
    public currentSession?: MDSession;

    constructor({ debug = false }: { debug: boolean }) {
        if (debug) {
            const _fn = (...args: any) => {
                if (args && args[0] && args[0].method) {
                    console.log(...args);
                }
            };
            this.logger = {
                debug: _fn,
                info: _fn,
                warn: _fn,
                error: _fn,
                child: () => this.logger!,
            };
        }
    }

    @asyncMutex
    async getServiceCapabilities() {
        const basic = [Capability.contentList, Capability.playbackControl, Capability.fullWidthSupport];
        try {
            const flags = (await this.netmdInterface?.getDiscFlags()) ?? 0;
            if ((flags & DiscFlag.writeProtected) === 0) {
                return [...basic, Capability.trackUpload, Capability.metadataEdit];
            }
        } catch (err) {}
        return basic;
    }

    private async listContentUsingCache() {
        if (!this.cachedContentList) {
            console.log("There's no cached version of the TOC, caching");
            this.cachedContentList = convertDiscToWMD(await listContent(this.netmdInterface!));
        } else {
            console.log("There's a cached TOC available.");
        }
        return JSON.parse(JSON.stringify(this.cachedContentList)) as Disc;
    }

    protected dropCachedContentList() {
        console.log('Cached TOC Dropped');
        this.cachedContentList = undefined;
    }

    async pair() {
        this.dropCachedContentList();
        const iface = await openNewDevice(navigator.usb, this.logger);
        if (iface === null) {
            return false;
        }
        this.netmdInterface = iface;
        return true;
    }

    async connect() {
        this.dropCachedContentList();
        const iface = await openPairedDevice(navigator.usb, this.logger);
        if (iface === null) {
            return false;
        }
        this.netmdInterface = iface;
        return true;
    }

    @asyncMutex
    async listContent(dropCache: boolean = false) {
        if (dropCache) this.dropCachedContentList();
        return await this.listContentUsingCache();
    }

    @asyncMutex
    async getDeviceStatus() {
        return await getDeviceStatus(this.netmdInterface!);
    }

    @asyncMutex
    async getDeviceName() {
        return this.netmdInterface!.netMd.getDeviceName();
    }

    getVendorId(): number {
        return this.netmdInterface?.netMd.getVendor() ?? 0;
    }

    getProductId(): number {
        return this.netmdInterface?.netMd.getProduct() ?? 0;
    }

    @asyncMutex
    async finalize() {
        await this.netmdInterface!.netMd.finalize();
        this.dropCachedContentList();
    }

    @asyncMutex
    async rewriteGroups(groups: Group[]) {
        const disc = await this.listContentUsingCache();
        disc.groups = groups;
        this.cachedContentList = disc;
        await rewriteDiscGroups(this.netmdInterface!, convertDiscToNJS(disc));
    }

    @asyncMutex
    async renameTrack(index: number, title: string, fullWidthTitle?: string) {
        title = sanitizeHalfWidthTitle(title);
        await this.netmdInterface!.setTrackTitle(index, title);
        if (fullWidthTitle !== undefined) {
            await this.netmdInterface!.setTrackTitle(index, sanitizeFullWidthTitle(fullWidthTitle), true);
        }
        const disc = await this.listContentUsingCache();
        for (const group of disc.groups) {
            for (const track of group.tracks) {
                if (track.index === index) {
                    track.title = title;
                    if (fullWidthTitle !== undefined) {
                        track.fullWidthTitle = fullWidthTitle;
                    }
                }
            }
        }
        this.cachedContentList = disc;
    }

    @asyncMutex
    async renameDisc(newName: string, newFullWidthName?: string) {
        await renameDisc(this.netmdInterface!, newName, newFullWidthName);
        const disc = await this.listContentUsingCache();
        disc.title = newName;
        if (newFullWidthName !== undefined) {
            disc.fullWidthTitle = newFullWidthName;
        }
        this.cachedContentList = disc;
    }

    @asyncMutex
    async deleteTracks(indexes: number[]) {
        try {
            // await this.netmdInterface!.stop();
        } catch (ex) {}
        indexes = indexes.sort((a, b) => a - b);
        indexes.reverse();
        let content = await this.listContentUsingCache();
        for (const index of indexes) {
            // Attempt to get panasonics working correctly (MyNameIsX)
            await this.netmdInterface?.getTrackTitle(index, false);
            await this.netmdInterface?.getTrackCount();
            content = recomputeGroupsAfterTrackMove(content, index, -1);
            await this.netmdInterface!.eraseTrack(index);
            await sleep(100);
        }
        await rewriteDiscGroups(this.netmdInterface!, convertDiscToNJS(content));
        this.dropCachedContentList();
    }

    @asyncMutex
    async wipeDisc() {
        try {
            await this.netmdInterface!.stop();
        } catch (ex) { /* empty */ }
        await this.netmdInterface!.eraseDisc();
        this.dropCachedContentList();
    }

    @asyncMutex
    async ejectDisc() {
        await this.netmdInterface!.ejectDisc();
        this.dropCachedContentList();
    }

    @asyncMutex
    async wipeDiscTitleInfo() {
        await this.netmdInterface!.setDiscTitle('');
        await this.netmdInterface!.setDiscTitle('', true);
        this.dropCachedContentList();
    }

    @asyncMutex
    async moveTrack(src: number, dst: number, updateGroups?: boolean) {
        await this.netmdInterface!.moveTrack(src, dst);

        const content = await this.listContentUsingCache();
        if (updateGroups === undefined || updateGroups) {
            await rewriteDiscGroups(this.netmdInterface!, convertDiscToNJS(recomputeGroupsAfterTrackMove(content, src, dst)));
        }
        for (const group of content.groups) {
            for (const track of group.tracks) {
                if (track.index === dst) {
                    track.index = src;
                } else if (track.index === src) {
                    track.index = dst;
                }
            }
            group.tracks.sort((a, b) => a.index - b.index);
        }
        this.cachedContentList = content;
    }

    @asyncMutex
    async prepareUpload() {
        await prepareDownload(this.netmdInterface!);
        this.currentSession = new MDSession(this.netmdInterface!);
        await this.currentSession.init();
    }

    @asyncMutex
    async finalizeUpload() {
        await this.currentSession!.close();
        await this.netmdInterface!.release();
        this.currentSession = undefined;
        this.dropCachedContentList();
    }

    getWorkerForUpload(): [Worker, typeof makeGetAsyncPacketIteratorOnWorkerThread] {
        return [new EncryptWorker(), makeGetAsyncPacketIteratorOnWorkerThread];
    }

    @asyncMutex
    async upload(
        title: string,
        fullWidthTitle: string,
        data: ArrayBuffer,
        _format: Codec,
        progressCallback: (progress: { written: number; encrypted: number; total: number }) => void
    ) {
        // This is NetMD - only 4 options supported.
        let format;
        if(_format.codec === 'AT3') {
            format = _format.bitrate === 66 ? 'LP4' : 'LP2';
        } else if(_format.codec == 'SPS' || _format.codec === 'SPM') {
            format = "SP"
        } else throw new Error('Invalid format for NetMD upload');
        if (this.currentSession === undefined) {
            throw new Error('Cannot upload without initializing a session first');
        }
        const total = data.byteLength;
        let written = 0;
        let encrypted = 0;
        function updateProgress() {
            progressCallback({ written, encrypted, total });
        }

        const [w, creator] = this.getWorkerForUpload();

        const webWorkerAsyncPacketIterator = creator(w, ({ encryptedBytes }: { encryptedBytes: number }) => {
            encrypted = encryptedBytes;
            updateProgress();
        });

        const halfWidthTitle = sanitizeHalfWidthTitle(title);
        fullWidthTitle = sanitizeFullWidthTitle(fullWidthTitle);
        const mdTrack = new MDTrack(halfWidthTitle, WireformatDict[format], data, 0x400, fullWidthTitle, webWorkerAsyncPacketIterator);

        await this.currentSession.downloadTrack(mdTrack, ({ writtenBytes }) => {
            written = writtenBytes;
            updateProgress();
        }, _format.codec === 'SPM' ? DiscFormat.spMono : undefined);

        w.terminate();
        this.dropCachedContentList();
    }

    @asyncMutex
    async download(index: number, progressCallback: (progress: { read: number; total: number }) => void) {
        const [format, data] = await upload(this.netmdInterface!, index, ({ readBytes, totalBytes }) => {
            progressCallback({ read: readBytes, total: totalBytes });
        });
        const extension = format === DiscFormat.spMono || format === DiscFormat.spStereo ? 'aea' : 'wav';
        return { extension, data };
    }

    @asyncMutex
    async play() {
        await this.netmdInterface!.play();
    }
    @asyncMutex
    async pause() {
        await this.netmdInterface!.pause();
    }
    @asyncMutex
    async stop() {
        await this.netmdInterface!.stop();
    }
    @asyncMutex
    async next() {
        await this.netmdInterface!.nextTrack();
    }
    @asyncMutex
    async prev() {
        await this.netmdInterface!.previousTrack();
    }

    @asyncMutex
    async gotoTrack(index: number) {
        await this.netmdInterface!.gotoTrack(index);
    }

    @asyncMutex
    async gotoTime(index: number, h: number, m: number, s: number, f: number) {
        await this.netmdInterface!.gotoTime(index, h, m, s, f);
    }

    @asyncMutex
    async getPosition() {
        return await this.netmdInterface!.getPosition();
    }

    isDeviceConnected(device: USBDevice){
        return this.netmdInterface?.netMd.isDeviceConnected(device) ?? false;
    }
}
