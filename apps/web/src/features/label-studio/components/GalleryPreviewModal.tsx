import { GitFork, Download, Calendar, X } from 'lucide-react';
import { Button, Badge } from '@netmd-studio/ui';
import type { Database } from '@netmd-studio/types';

type LabelDesignRow = Database['public']['Tables']['label_designs']['Row'];

const templateLabels: Record<string, string> = {
  jcard_front: 'J-Card Front',
  jcard_back: 'J-Card Back',
  jcard_full: 'J-Card Full',
  spine: 'Spine',
  disc_label: 'Disc Label',
};

interface GalleryPreviewModalProps {
  design: LabelDesignRow;
  onClose: () => void;
  onFork: () => void;
}

export function GalleryPreviewModal({ design, onClose, onFork }: GalleryPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-studio-surface border border-studio-border rounded-studio-xl shadow-studio-lg max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-studio-border">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-semibold text-studio-text truncate">{design.title}</h2>
            <Badge variant="cyan">{templateLabels[design.template_type]}</Badge>
          </div>
          <button onClick={onClose} className="text-studio-text-muted hover:text-studio-text transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-5">
          <div className="bg-studio-black rounded-studio-lg flex items-center justify-center p-4 mb-4 min-h-[200px]">
            {design.thumbnail_url ? (
              <img
                src={design.thumbnail_url}
                alt={design.title}
                className="max-w-full max-h-[400px] object-contain"
              />
            ) : (
              <span className="text-studio-text-dim text-sm">No preview available</span>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-2 mb-4">
            {design.artist_name && (
              <p className="text-sm text-studio-text">
                <span className="text-studio-text-muted">Artist:</span> {design.artist_name}
              </p>
            )}
            {design.album_title && (
              <p className="text-sm text-studio-text">
                <span className="text-studio-text-muted">Album:</span> {design.album_title}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-studio-text-dim">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(design.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork size={12} />
                {design.fork_count} forks
              </span>
              <span className="flex items-center gap-1">
                <Download size={12} />
                {design.download_count} downloads
              </span>
            </div>
          </div>

          {/* Tracklist */}
          {design.tracklist && Array.isArray(design.tracklist) && (design.tracklist as Array<{ position: string; title: string; duration: string }>).length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-studio-text-muted mb-1">Tracklist</h4>
              <div className="bg-studio-black rounded-studio p-2 max-h-32 overflow-y-auto">
                {(design.tracklist as Array<{ position: string; title: string; duration: string }>).map((track, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="text-2xs text-studio-text font-mono">
                      {track.position}. {track.title}
                    </span>
                    <span className="text-2xs text-studio-text-dim font-mono">{track.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={onFork}>
              <GitFork size={14} />
              Fork & Edit
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
