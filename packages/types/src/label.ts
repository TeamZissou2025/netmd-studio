import type { LabelTemplateType } from './database';

export interface LabelTemplate {
  id: string;
  name: string;
  description: string | null;
  templateType: LabelTemplateType;
  canvasData: Record<string, unknown>;
  thumbnailUrl: string | null;
}

export interface TracklistItem {
  position: string;
  title: string;
  duration: string;
}

export interface AlbumMetadata {
  artistName: string;
  albumTitle: string;
  tracklist: TracklistItem[];
  coverArtUrl: string | null;
  discogsReleaseId?: number;
  musicbrainzReleaseId?: string;
}
