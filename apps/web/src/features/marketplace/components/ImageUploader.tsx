import { useCallback, useRef } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

async function resizeAndConvert(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      // Try WebP first, fall back to JPEG
      const webp = canvas.toDataURL('image/webp', 0.85);
      if (webp.startsWith('data:image/webp')) {
        resolve(webp);
      } else {
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function ImageUploader({ images, onChange, maxImages = 8 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const fileArray = Array.from(files).slice(0, remaining);
      const validFiles = fileArray.filter((f) => f.type.startsWith('image/'));

      if (validFiles.length === 0) {
        toast.error('Only image files are accepted');
        return;
      }

      try {
        const processed = await Promise.all(validFiles.map((f) => resizeAndConvert(f)));
        onChange([...images, ...processed]);
      } catch {
        toast.error('Failed to process one or more images');
      }
    },
    [images, onChange, maxImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const next = [...images];
    const [dragged] = next.splice(dragItem.current, 1);
    next.splice(dragOver.current, 0, dragged);
    dragItem.current = null;
    dragOver.current = null;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-nav font-medium text-[var(--text-secondary)]">
        Images ({images.length}/{maxImages})
      </span>

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--border-hover)] transition-colors"
        >
          <Upload size={24} className="text-[var(--text-tertiary)]" />
          <p className="text-nav text-[var(--text-secondary)]">Drop images here or click to upload</p>
          <p className="text-tag text-[var(--text-tertiary)]">JPG, PNG, WebP. Max 1200px wide. Auto-converted to WebP.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => (dragItem.current = i)}
              onDragEnter={() => (dragOver.current = i)}
              onDragEnd={handleDragSort}
              onDragOver={(e) => e.preventDefault()}
              className="relative aspect-square rounded-md border border-[var(--border)] overflow-hidden group cursor-grab active:cursor-grabbing"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <GripVertical size={14} className="text-white/80" />
              </div>
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--error)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} className="text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-tag bg-[var(--surface-0)] text-[var(--accent)] px-1 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
