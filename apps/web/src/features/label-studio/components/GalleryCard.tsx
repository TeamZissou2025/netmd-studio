import { GitFork, Download, User } from 'lucide-react';
import { Card, Badge } from '@netmd-studio/ui';
import type { Database } from '@netmd-studio/types';

type LabelDesignRow = Database['public']['Tables']['label_designs']['Row'];

interface GalleryCardProps {
  design: LabelDesignRow;
  onClick: () => void;
}

const templateLabels: Record<string, string> = {
  jcard_front: 'Front',
  jcard_back: 'Back',
  jcard_full: 'Full',
  spine: 'Spine',
  disc_label: 'Disc',
};

export function GalleryCard({ design, onClick }: GalleryCardProps) {
  return (
    <Card hoverable className="overflow-hidden p-0 cursor-pointer" onClick={onClick}>
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-studio-black flex items-center justify-center overflow-hidden">
        {design.thumbnail_url ? (
          <img
            src={design.thumbnail_url}
            alt={design.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-studio-text-dim text-2xs">No preview</div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-studio-text truncate">{design.title}</h3>
            {design.artist_name && (
              <p className="text-2xs text-studio-text-muted truncate">
                {design.artist_name}
                {design.album_title && ` — ${design.album_title}`}
              </p>
            )}
          </div>
          <Badge variant="cyan">{templateLabels[design.template_type] ?? design.template_type}</Badge>
        </div>

        <div className="flex items-center justify-between text-2xs text-studio-text-dim">
          <div className="flex items-center gap-1">
            <User size={10} />
            <span>{new Date(design.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-0.5">
              <GitFork size={10} />
              {design.fork_count}
            </span>
            <span className="flex items-center gap-0.5">
              <Download size={10} />
              {design.download_count}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
