import {
  Type,
  Square,
  Circle,
  Minus,
  Image,
  Undo2,
  Redo2,
  Trash2,
  Grid3X3,
  Expand,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Paintbrush,
} from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import { useRef } from 'react';

interface CanvasToolbarProps {
  onAddText: () => void;
  onAddShape: (shape: 'rect' | 'circle' | 'line') => void;
  onAddImage: (url: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onToggleGrid: () => void;
  onToggleBleed: () => void;
  onMoveLayer: (dir: 'up' | 'down' | 'top' | 'bottom') => void;
  onSetBackgroundColor: (color: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  showBleed: boolean;
  hasSelection: boolean;
}

export function CanvasToolbar({
  onAddText,
  onAddShape,
  onAddImage,
  onUndo,
  onRedo,
  onDelete,
  onToggleGrid,
  onToggleBleed,
  onMoveLayer,
  onSetBackgroundColor,
  canUndo,
  canRedo,
  showGrid,
  showBleed,
  hasSelection,
}: CanvasToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgColorRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAddImage(url);
    e.target.value = '';
  };

  const toolBtnClass = (active?: boolean) =>
    `h-9 min-w-[3rem] px-2 flex flex-col items-center justify-center gap-0.5 rounded-studio transition-colors ${
      active
        ? 'bg-studio-cyan-muted text-studio-cyan border border-studio-cyan-border'
        : 'text-studio-text-muted hover:text-studio-text hover:bg-studio-surface-hover border border-transparent'
    }`;

  const disabledClass = 'opacity-30 pointer-events-none';

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-studio-surface border border-studio-border rounded-studio-lg">
      {/* Add objects */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-3 mr-2">
        <button className={toolBtnClass()} title="Add text" onClick={onAddText}>
          <Type size={20} />
          <span className="text-2xs leading-none">Text</span>
        </button>
        <button className={toolBtnClass()} title="Add rectangle" onClick={() => onAddShape('rect')}>
          <Square size={20} />
          <span className="text-2xs leading-none">Rect</span>
        </button>
        <button className={toolBtnClass()} title="Add circle" onClick={() => onAddShape('circle')}>
          <Circle size={20} />
          <span className="text-2xs leading-none">Circle</span>
        </button>
        <button className={toolBtnClass()} title="Add line" onClick={() => onAddShape('line')}>
          <Minus size={20} />
          <span className="text-2xs leading-none">Line</span>
        </button>
        <button
          className={toolBtnClass()}
          title="Upload image"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
          <span className="text-2xs leading-none">Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Background */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-3 mr-2">
        <button
          className={toolBtnClass()}
          title="Background color"
          onClick={() => bgColorRef.current?.click()}
        >
          <Paintbrush size={20} />
          <span className="text-2xs leading-none">Fill</span>
        </button>
        <input
          ref={bgColorRef}
          type="color"
          className="invisible absolute w-0 h-0"
          defaultValue="#ffffff"
          onChange={(e) => onSetBackgroundColor(e.target.value)}
        />
      </div>

      {/* Undo/redo */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-3 mr-2">
        <button
          className={`${toolBtnClass()} ${!canUndo ? disabledClass : ''}`}
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
        >
          <Undo2 size={20} />
          <span className="text-2xs leading-none">Undo</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!canRedo ? disabledClass : ''}`}
          title="Redo (Ctrl+Shift+Z)"
          onClick={onRedo}
        >
          <Redo2 size={20} />
          <span className="text-2xs leading-none">Redo</span>
        </button>
      </div>

      {/* Layer controls */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-3 mr-2">
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          title="Bring forward"
          onClick={() => onMoveLayer('up')}
        >
          <ArrowUp size={20} />
          <span className="text-2xs leading-none">Fwd</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          title="Send backward"
          onClick={() => onMoveLayer('down')}
        >
          <ArrowDown size={20} />
          <span className="text-2xs leading-none">Back</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          title="Bring to front"
          onClick={() => onMoveLayer('top')}
        >
          <ChevronsUp size={20} />
          <span className="text-2xs leading-none">Top</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          title="Send to back"
          onClick={() => onMoveLayer('bottom')}
        >
          <ChevronsDown size={20} />
          <span className="text-2xs leading-none">Bottom</span>
        </button>
      </div>

      {/* View toggles */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-3 mr-2">
        <button
          className={toolBtnClass(showGrid)}
          onClick={onToggleGrid}
          title="Toggle grid"
        >
          <Grid3X3 size={20} />
          <span className="text-2xs leading-none">Grid</span>
        </button>
        <button
          className={toolBtnClass(showBleed)}
          onClick={onToggleBleed}
          title="Toggle bleed"
        >
          <Expand size={20} />
          <span className="text-2xs leading-none">Bleed</span>
        </button>
      </div>

      {/* Delete */}
      <button
        className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''} ${hasSelection ? '!text-studio-error hover:!text-studio-error' : ''}`}
        title="Delete selected"
        onClick={onDelete}
      >
        <Trash2 size={20} />
        <span className="text-2xs leading-none">Delete</span>
      </button>
    </div>
  );
}
