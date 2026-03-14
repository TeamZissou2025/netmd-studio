/**
 * Vendored from Web MiniDisc Pro (asivery/webminidisc) — src/utils.ts
 * Only the functions needed by the transfer pipeline.
 * NO MODIFICATIONS except removing unused imports/functions.
 */
import { Mutex } from 'async-mutex';
import { Disc, Group, Track } from './netmd-service';

export function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function getPublicPathFor(script: string) {
    return `${import.meta.env.BASE_URL}wasm/${script}`;
}

export function isSequential(numbers: number[]) {
    if (numbers.length === 0) return true;
    let last = numbers[0];
    for (const num of numbers) {
        if (num === last) {
            ++last;
        } else return false;
    }
    return true;
}

export function recomputeGroupsAfterTrackMove(disc: Disc, trackIndex: number, targetIndex: number) {
    // Used for moving tracks in netmd-mock and deleting
    let offset = trackIndex > targetIndex ? 1 : -1;
    const deleteMode = targetIndex === -1;

    if (deleteMode) {
        offset = -1;
        targetIndex = disc.trackCount;
    }

    const boundsStart = Math.min(trackIndex, targetIndex);
    const boundsEnd = Math.max(trackIndex, targetIndex);

    const allTracks = disc.groups
        .map(n => n.tracks)
        .reduce((a, b) => a.concat(b), [])
        .sort((a, b) => a.index - b.index)
        .filter(n => !deleteMode || n.index !== trackIndex);

    const groupBoundaries: {
        name: string | null;
        fullWidthName: string | null;
        start: number;
        end: number;
    }[] = disc.groups
        .filter(n => n.title !== null)
        .map(group => ({
            name: group.title,
            fullWidthName: group.fullWidthTitle,
            start: group.tracks[0].index,
            end: group.tracks[0].index + group.tracks.length - 1,
        })); // Convert to a format better for shifting

    let anyChanges = false;

    for (const group of groupBoundaries) {
        if (group.start > boundsStart && group.start <= boundsEnd) {
            group.start += offset;
            anyChanges = true;
        }
        if (group.end >= boundsStart && group.end < boundsEnd) {
            group.end += offset;
            anyChanges = true;
        }
    }

    if (!anyChanges) return disc;

    const newDisc: Disc = { ...disc };

    // Convert back
    newDisc.groups = groupBoundaries
        .map(n => ({
            title: n.name,
            fullWidthTitle: n.fullWidthName,
            index: n.start,
            tracks: allTracks.slice(n.start, n.end + 1),
        }))
        .filter(n => n.tracks.length > 0);

    // Convert ungrouped tracks
    const allGrouped = newDisc.groups.map(n => n.tracks).reduce((a, b) => a.concat(b), []);
    const ungrouped = allTracks.filter(n => !allGrouped.includes(n));

    // Fix all the track indexes
    if (deleteMode) {
        for (let i = 0; i < allTracks.length; i++) {
            allTracks[i].index = i;
        }
    }

    if (ungrouped.length) newDisc.groups.unshift({ title: null, fullWidthTitle: null, index: 0, tracks: ungrouped });

    return newDisc;
}

export function asyncMutex(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // This is meant to be used only with classes having a "mutex" instance property
    const oldValue = descriptor.value;
    descriptor.value = async function (...args: any) {
        const mutex = (this as any).mutex as Mutex;
        const release = await mutex.acquire();
        try {
            return await oldValue.apply(this, args);
        } finally {
            release();
        }
    };
    return descriptor;
}
