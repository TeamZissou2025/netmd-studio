import { useState, useCallback } from 'react';
import type { AlbumMetadata, TracklistItem } from '@netmd-studio/types';

interface MusicBrainzRelease {
  id: string;
  title: string;
  'artist-credit'?: Array<{ name: string }>;
  date?: string;
  'release-group'?: { 'primary-type'?: string };
  media?: Array<{
    tracks?: Array<{
      number: string;
      title: string;
      length?: number;
    }>;
  }>;
}

interface DiscogsResult {
  id: number;
  title: string;
  year?: string;
  thumb?: string;
  cover_image?: string;
  type: string;
}

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  year?: string;
  thumbnailUrl?: string;
  source: 'musicbrainz' | 'discogs';
  sourceId: string | number;
}

export function useMetadataSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try MusicBrainz first
      const mbRes = await fetch(`/api/musicbrainz/search?q=${encodeURIComponent(query)}&type=release`);
      if (mbRes.ok) {
        const mbData = await mbRes.json();
        const releases: MusicBrainzRelease[] = mbData.releases ?? [];
        if (releases.length > 0) {
          setResults(
            releases.map((r) => ({
              id: `mb-${r.id}`,
              title: r.title,
              artist: r['artist-credit']?.map((a) => a.name).join(', ') ?? 'Unknown',
              year: r.date?.substring(0, 4),
              source: 'musicbrainz' as const,
              sourceId: r.id,
            }))
          );
          setLoading(false);
          return;
        }
      }

      // Fallback to Discogs
      const dcRes = await fetch(`/api/discogs/search?q=${encodeURIComponent(query)}&type=release`);
      if (dcRes.ok) {
        const dcData = await dcRes.json();
        const items: DiscogsResult[] = dcData.results ?? [];
        setResults(
          items
            .filter((r) => r.type === 'release' || r.type === 'master')
            .map((r) => {
              const [artist, ...titleParts] = r.title.split(' - ');
              return {
                id: `dc-${r.id}`,
                title: titleParts.join(' - ') || r.title,
                artist: artist ?? 'Unknown',
                year: r.year,
                thumbnailUrl: r.thumb,
                source: 'discogs' as const,
                sourceId: r.id,
              };
            })
        );
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Metadata search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlbumDetails = useCallback(async (result: SearchResult): Promise<AlbumMetadata | null> => {
    try {
      if (result.source === 'musicbrainz') {
        // Fetch release with recordings
        const res = await fetch(
          `/api/musicbrainz/search?q=reid:${result.sourceId}&type=release`
        );
        if (!res.ok) {
          // Return basic metadata
          return {
            artistName: result.artist,
            albumTitle: result.title,
            tracklist: [],
            coverArtUrl: null,
            musicbrainzReleaseId: result.sourceId as string,
          };
        }

        // Fetch cover art from Cover Art Archive
        let coverArtUrl: string | null = null;
        try {
          const caaRes = await fetch(
            `https://coverartarchive.org/release/${result.sourceId}`,
            { headers: { Accept: 'application/json' } }
          );
          if (caaRes.ok) {
            const caaData = await caaRes.json();
            const front = caaData.images?.find((img: { front: boolean }) => img.front);
            coverArtUrl = front?.thumbnails?.large ?? front?.image ?? null;
          }
        } catch {
          // Cover art not available — that's fine
        }

        // Try to get track listing from a direct lookup
        let tracklist: TracklistItem[] = [];
        try {
          // Use a direct release lookup
          const releaseUrl = `https://musicbrainz.org/ws/2/release/${result.sourceId}?inc=recordings&fmt=json`;
          const releaseRes = await fetch(releaseUrl, {
            headers: {
              'User-Agent': 'NetMDStudio/1.0.0 (https://netmd.studio)',
              Accept: 'application/json',
            },
          });
          if (releaseRes.ok) {
            const releaseData = await releaseRes.json();
            const media = releaseData.media ?? [];
            for (const medium of media) {
              const tracks = medium.tracks ?? [];
              for (const track of tracks) {
                const durationSec = track.length ? Math.round(track.length / 1000) : 0;
                const mins = Math.floor(durationSec / 60);
                const secs = durationSec % 60;
                tracklist.push({
                  position: track.number ?? String(tracklist.length + 1),
                  title: track.title,
                  duration: `${mins}:${String(secs).padStart(2, '0')}`,
                });
              }
            }
          }
        } catch {
          // tracklist not available
        }

        return {
          artistName: result.artist,
          albumTitle: result.title,
          tracklist,
          coverArtUrl,
          musicbrainzReleaseId: result.sourceId as string,
        };
      } else {
        // Discogs — fetch release details
        let coverArtUrl: string | null = result.thumbnailUrl ?? null;
        let tracklist: TracklistItem[] = [];

        try {
          const res = await fetch(
            `https://api.discogs.com/releases/${result.sourceId}`,
            {
              headers: {
                'User-Agent': 'NetMDStudio/1.0.0 +https://netmd.studio',
                Accept: 'application/json',
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            coverArtUrl = data.images?.[0]?.uri ?? coverArtUrl;
            tracklist = (data.tracklist ?? []).map(
              (t: { position: string; title: string; duration: string }) => ({
                position: t.position,
                title: t.title,
                duration: t.duration || '0:00',
              })
            );
          }
        } catch {
          // Details not available
        }

        return {
          artistName: result.artist,
          albumTitle: result.title,
          tracklist,
          coverArtUrl,
          discogsReleaseId: result.sourceId as number,
        };
      }
    } catch (err) {
      console.error('Failed to fetch album details:', err);
      return null;
    }
  }, []);

  return { results, loading, error, search, fetchAlbumDetails, setResults };
}
