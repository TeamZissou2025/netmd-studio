import { useState, useRef, useCallback } from 'react';
import { Upload, Music } from 'lucide-react';
import { ACCEPTED_AUDIO_EXTENSIONS } from '@netmd-studio/types';

interface DropZoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;
      if (!disabled && e.dataTransfer.files.length > 0) {
        onFilesAdded(e.dataTransfer.files);
      }
    },
    [onFilesAdded, disabled]
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className="relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
      style={
        disabled
          ? { borderColor: 'var(--border)', background: 'var(--surface-1)', opacity: 0.5, cursor: 'not-allowed' }
          : isDragging
            ? { borderColor: 'var(--pillar-transfer)', background: 'rgba(196,64,106,0.1)' }
            : { borderColor: 'var(--border)', background: 'var(--surface-0)' }
      }
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_AUDIO_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-2">
        {isDragging ? (
          <>
            <Music size={24} style={{ color: 'var(--pillar-transfer)' }} />
            <p className="text-nav font-medium" style={{ color: 'var(--pillar-transfer)' }}>Drop audio files here</p>
          </>
        ) : (
          <>
            <Upload size={24} style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-nav" style={{ color: 'var(--text-secondary)' }}>
              Drop audio files here or <span style={{ color: 'var(--accent)' }}>browse</span>
            </p>
            <p className="text-tag" style={{ color: 'var(--text-tertiary)' }}>
              MP3, FLAC, WAV, OGG, AAC, M4A
            </p>
          </>
        )}
      </div>
    </div>
  );
}
