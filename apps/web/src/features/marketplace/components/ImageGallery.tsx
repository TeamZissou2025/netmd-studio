import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[var(--surface-1)] border border-[var(--border)] rounded-lg flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--border)]">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Main image */}
        <div
          className="aspect-square bg-[var(--surface-0)] border border-[var(--border)] rounded-lg overflow-hidden cursor-zoom-in relative"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={images[activeIndex]}
            alt={`${alt} - image ${activeIndex + 1}`}
            className="w-full h-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--surface-0)] backdrop-blur-sm flex items-center justify-center hover:bg-[var(--surface-0)] transition-colors"
              >
                <ChevronLeft size={16} className="text-[var(--text-primary)]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % images.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--surface-0)] backdrop-blur-sm flex items-center justify-center hover:bg-[var(--surface-0)] transition-colors"
              >
                <ChevronRight size={16} className="text-[var(--text-primary)]" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-14 h-14 flex-shrink-0 rounded-md border overflow-hidden ${
                  i === activeIndex
                    ? 'border-[var(--border-accent)]'
                    : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                } transition-colors`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--surface-1)]/50 flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors"
          >
            <X size={20} className="text-[var(--text-primary)]" />
          </button>

          <img
            src={images[activeIndex]}
            alt={`${alt} - image ${activeIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--surface-1)]/50 flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors"
              >
                <ChevronLeft size={20} className="text-[var(--text-primary)]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--surface-1)]/50 flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors"
              >
                <ChevronRight size={20} className="text-[var(--text-primary)]" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-nav text-[var(--text-secondary)]">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
