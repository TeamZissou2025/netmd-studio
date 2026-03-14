import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Select, Badge, Skeleton } from '@netmd-studio/ui';
import { useNavigate } from 'react-router';
import type { LabelTemplateType, Database } from '@netmd-studio/types';
import { useLabelDesigns } from './hooks/useLabelDesigns';
import { GalleryCard } from './components/GalleryCard';
import { GalleryPreviewModal } from './components/GalleryPreviewModal';

type LabelDesignRow = Database['public']['Tables']['label_designs']['Row'];

const templateOptions = [
  { value: '', label: 'All types' },
  { value: 'jcard_front', label: 'J-Card Front' },
  { value: 'jcard_back', label: 'J-Card Back' },
  { value: 'jcard_full', label: 'J-Card Full' },
  { value: 'spine', label: 'Spine' },
  { value: 'disc_label', label: 'Disc Label' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_forked', label: 'Most Forked' },
  { value: 'most_downloaded', label: 'Most Downloaded' },
];

export function GalleryPage() {
  const { designs, loading, fetchGallery, forkDesign } = useLabelDesigns();
  const navigate = useNavigate();
  const [templateFilter, setTemplateFilter] = useState('');
  const [sort, setSort] = useState<'newest' | 'most_forked' | 'most_downloaded'>('newest');
  const [search, setSearch] = useState('');
  const [previewDesign, setPreviewDesign] = useState<LabelDesignRow | null>(null);

  const loadGallery = useCallback(() => {
    fetchGallery({
      templateType: (templateFilter || undefined) as LabelTemplateType | undefined,
      sort,
      search: search || undefined,
    });
  }, [fetchGallery, templateFilter, sort, search]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleFork = async (designId: string) => {
    const forked = await forkDesign(designId);
    if (forked) {
      navigate(`/labels?edit=${forked.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-card-title font-semibold" style={{ color: 'var(--text-primary)' }}>Label Gallery</h1>
          <p className="text-nav mt-1" style={{ color: 'var(--text-secondary)' }}>
            Community label designs. Browse, preview, and fork.
          </p>
        </div>
        <Badge variant="cyan">{designs.length} designs</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search designs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <Select
          options={templateOptions}
          value={templateFilter}
          onChange={(e) => setTemplateFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={sortOptions}
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="w-44"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SlidersHorizontal size={32} className="mb-3" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-nav" style={{ color: 'var(--text-secondary)' }}>No public designs yet</p>
          <p className="text-tag mt-1" style={{ color: 'var(--text-tertiary)' }}>Create and share your first label design!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <GalleryCard
              key={design.id}
              design={design}
              onClick={() => setPreviewDesign(design)}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewDesign && (
        <GalleryPreviewModal
          design={previewDesign}
          onClose={() => setPreviewDesign(null)}
          onFork={() => handleFork(previewDesign.id)}
        />
      )}
    </div>
  );
}
