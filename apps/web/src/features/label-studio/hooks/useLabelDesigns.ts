import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import type { LabelTemplateType, Database } from '@netmd-studio/types';

type LabelDesignRow = Database['public']['Tables']['label_designs']['Row'];

interface GalleryFilters {
  templateType?: LabelTemplateType;
  sort: 'newest' | 'most_forked' | 'most_downloaded';
  search?: string;
}

export function useLabelDesigns() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<LabelDesignRow[]>([]);
  const [myDesigns, setMyDesigns] = useState<LabelDesignRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGallery = useCallback(async (filters: GalleryFilters) => {
    setLoading(true);
    let query = supabase
      .from('label_designs')
      .select('*')
      .eq('is_public', true);

    if (filters.templateType) {
      query = query.eq('template_type', filters.templateType);
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,artist_name.ilike.%${filters.search}%,album_title.ilike.%${filters.search}%`
      );
    }

    switch (filters.sort) {
      case 'most_forked':
        query = query.order('fork_count', { ascending: false });
        break;
      case 'most_downloaded':
        query = query.order('download_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.limit(50);

    const { data, error } = await query;
    if (error) console.error('Gallery fetch error:', error);
    setDesigns((data as LabelDesignRow[]) ?? []);
    setLoading(false);
  }, []);

  const fetchMyDesigns = useCallback(async () => {
    if (!user) {
      setMyDesigns([]);
      return;
    }
    const { data, error } = await supabase
      .from('label_designs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) console.error('My designs fetch error:', error);
    setMyDesigns((data as LabelDesignRow[]) ?? []);
  }, [user]);

  const saveDesign = useCallback(
    async (params: {
      id?: string;
      title: string;
      templateType: LabelTemplateType;
      canvasData: Record<string, unknown>;
      thumbnailDataUrl?: string;
      isPublic?: boolean;
      artistName?: string;
      albumTitle?: string;
      tracklist?: Array<{ position: string; title: string; duration: string }>;
      coverArtUrl?: string;
      discogsReleaseId?: number;
      musicbrainzReleaseId?: string;
      forkOf?: string;
    }): Promise<LabelDesignRow | null> => {
      if (!user) return null;

      // Upload thumbnail if provided
      let thumbnailUrl: string | null = null;
      if (params.thumbnailDataUrl) {
        const blob = await fetch(params.thumbnailDataUrl).then((r) => r.blob());
        const path = `${user.id}/labels/${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('public-assets')
          .upload(path, blob, { contentType: 'image/png', upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('public-assets').getPublicUrl(path);
          thumbnailUrl = urlData.publicUrl;
        }
      }

      const row = {
        user_id: user.id,
        title: params.title,
        template_type: params.templateType,
        canvas_data: params.canvasData as unknown as Database['public']['Tables']['label_designs']['Insert']['canvas_data'],
        thumbnail_url: thumbnailUrl,
        is_public: params.isPublic ?? false,
        artist_name: params.artistName ?? null,
        album_title: params.albumTitle ?? null,
        tracklist: (params.tracklist ?? null) as unknown as Database['public']['Tables']['label_designs']['Insert']['tracklist'],
        cover_art_url: params.coverArtUrl ?? null,
        discogs_release_id: params.discogsReleaseId ?? null,
        musicbrainz_release_id: params.musicbrainzReleaseId ?? null,
        fork_of: params.forkOf ?? null,
      };

      if (params.id) {
        const { data, error } = await supabase
          .from('label_designs')
          .update(row)
          .eq('id', params.id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) {
          console.error('Save design error:', error);
          return null;
        }
        return data as LabelDesignRow;
      } else {
        const { data, error } = await supabase
          .from('label_designs')
          .insert(row)
          .select()
          .single();
        if (error) {
          console.error('Save design error:', error);
          return null;
        }
        return data as LabelDesignRow;
      }
    },
    [user]
  );

  const forkDesign = useCallback(
    async (designId: string): Promise<LabelDesignRow | null> => {
      if (!user) return null;

      const { data, error: fetchError } = await supabase
        .from('label_designs')
        .select('*')
        .eq('id', designId)
        .single();

      if (fetchError || !data) return null;
      const original = data as LabelDesignRow;

      const forked = await saveDesign({
        title: `${original.title} (Fork)`,
        templateType: original.template_type,
        canvasData: original.canvas_data as Record<string, unknown>,
        isPublic: false,
        artistName: original.artist_name ?? undefined,
        albumTitle: original.album_title ?? undefined,
        tracklist: (original.tracklist as Array<{ position: string; title: string; duration: string }>) ?? undefined,
        coverArtUrl: original.cover_art_url ?? undefined,
        forkOf: designId,
      });

      // Increment fork count on original
      if (forked) {
        await supabase
          .from('label_designs')
          .update({ fork_count: (original.fork_count ?? 0) + 1 })
          .eq('id', designId);
      }

      return forked;
    },
    [user, saveDesign]
  );

  const deleteDesign = useCallback(
    async (designId: string) => {
      if (!user) return false;
      const { error } = await supabase
        .from('label_designs')
        .delete()
        .eq('id', designId)
        .eq('user_id', user.id);
      return !error;
    },
    [user]
  );

  const loadDesign = useCallback(async (designId: string): Promise<LabelDesignRow | null> => {
    const { data, error } = await supabase
      .from('label_designs')
      .select('*')
      .eq('id', designId)
      .single();
    if (error) return null;
    return data as LabelDesignRow;
  }, []);

  return {
    designs,
    myDesigns,
    loading,
    fetchGallery,
    fetchMyDesigns,
    saveDesign,
    forkDesign,
    deleteDesign,
    loadDesign,
  };
}
