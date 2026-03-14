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
        className="rounded-xl max-w-2xl w-full mx-4"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-studio-title font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{design.title}</h2>
            <Badge variant="cyan">{templateLabels[design.template_type]}</Badge>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-5">
          <div className="rounded-lg flex items-center justify-center p-4 mb-4 min-h-[200px]" style={{ background: 'var(--surface-0)' }}>
            {design.thumbnail_url ? (
              <img
                src={design.thumbnail_url}
                alt={design.title}
                className="max-w-full max-h-[400px] object-contain"
              />
            ) : (
              <span className="text-nav" style={{ color: 'var(--text-tertiary)' }}>No preview available</span>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-2 mb-4">
            {design.artist_name && (
              <p className="text-nav" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Artist:</span> {design.artist_name}
              </p>
            )}
            {design.album_title && (
              <p className="text-nav" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Album:</span> {design.album_title}
              </p>
            )}
            <div className="flex items-center gap-4 text-label" style={{ color: 'var(--text-tertiary)' }}>
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
              <h4 className="text-label font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tracklist</h4>
              <div className="rounded-md p-2 max-h-32 overflow-y-auto" style={{ background: 'var(--surface-0)' }}>
                {(design.tracklist as Array<{ position: string; title: string; duration: string }>).map((track, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="text-tag font-mono" style={{ color: 'var(--text-primary)' }}>
                      {track.position}. {track.title}
                    </span>
                    <span className="text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>{track.duration}</span>
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
