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
    `h-9 min-w-[3rem] px-2 flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors ${
      active
        ? 'border'
        : 'hover:opacity-90 border border-transparent'
    }`;

  const toolBtnStyle = (active?: boolean): React.CSSProperties =>
    active
      ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--border-accent)' }
      : { color: 'var(--text-secondary)' };

  const disabledClass = 'opacity-30 pointer-events-none';

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      {/* Add objects */}
      <div className="flex items-center gap-1 pr-3 mr-2" style={{ borderRight: '1px solid var(--border)' }}>
        <button className={toolBtnClass()} style={toolBtnStyle()} title="Add text" onClick={onAddText}>
          <Type size={20} />
          <span className="text-tag leading-none">Text</span>
        </button>
        <button className={toolBtnClass()} style={toolBtnStyle()} title="Add rectangle" onClick={() => onAddShape('rect')}>
          <Square size={20} />
          <span className="text-tag leading-none">Rect</span>
        </button>
        <button className={toolBtnClass()} style={toolBtnStyle()} title="Add circle" onClick={() => onAddShape('circle')}>
          <Circle size={20} />
          <span className="text-tag leading-none">Circle</span>
        </button>
        <button className={toolBtnClass()} style={toolBtnStyle()} title="Add line" onClick={() => onAddShape('line')}>
          <Minus size={20} />
          <span className="text-tag leading-none">Line</span>
        </button>
        <button
          className={toolBtnClass()}
          style={toolBtnStyle()}
          title="Upload image"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
          <span className="text-tag leading-none">Image</span>
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
      <div className="flex items-center gap-1 pr-3 mr-2" style={{ borderRight: '1px solid var(--border)' }}>
        <button
          className={toolBtnClass()}
          style={toolBtnStyle()}
          title="Background color"
          onClick={() => bgColorRef.current?.click()}
        >
          <Paintbrush size={20} />
          <span className="text-tag leading-none">Fill</span>
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
      <div className="flex items-center gap-1 pr-3 mr-2" style={{ borderRight: '1px solid var(--border)' }}>
        <button
          className={`${toolBtnClass()} ${!canUndo ? disabledClass : ''}`}
          style={toolBtnStyle()}
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
        >
          <Undo2 size={20} />
          <span className="text-tag leading-none">Undo</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!canRedo ? disabledClass : ''}`}
          style={toolBtnStyle()}
          title="Redo (Ctrl+Shift+Z)"
          onClick={onRedo}
        >
          <Redo2 size={20} />
          <span className="text-tag leading-none">Redo</span>
        </button>
      </div>

      {/* Layer controls */}
      <div className="flex items-center gap-1 pr-3 mr-2" style={{ borderRight: '1px solid var(--border)' }}>
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          style={toolBtnStyle()}
          title="Bring forward"
          onClick={() => onMoveLayer('up')}
        >
          <ArrowUp size={20} />
          <span className="text-tag leading-none">Fwd</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          style={toolBtnStyle()}
          title="Send backward"
          onClick={() => onMoveLayer('down')}
        >
          <ArrowDown size={20} />
          <span className="text-tag leading-none">Back</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          style={toolBtnStyle()}
          title="Bring to front"
          onClick={() => onMoveLayer('top')}
        >
          <ChevronsUp size={20} />
          <span className="text-tag leading-none">Top</span>
        </button>
        <button
          className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
          style={toolBtnStyle()}
          title="Send to back"
          onClick={() => onMoveLayer('bottom')}
        >
          <ChevronsDown size={20} />
          <span className="text-tag leading-none">Bottom</span>
        </button>
      </div>

      {/* View toggles */}
      <div className="flex items-center gap-1 pr-3 mr-2" style={{ borderRight: '1px solid var(--border)' }}>
        <button
          className={toolBtnClass(showGrid)}
          style={toolBtnStyle(showGrid)}
          onClick={onToggleGrid}
          title="Toggle grid"
        >
          <Grid3X3 size={20} />
          <span className="text-tag leading-none">Grid</span>
        </button>
        <button
          className={toolBtnClass(showBleed)}
          style={toolBtnStyle(showBleed)}
          onClick={onToggleBleed}
          title="Toggle bleed"
        >
          <Expand size={20} />
          <span className="text-tag leading-none">Bleed</span>
        </button>
      </div>

      {/* Delete */}
      <button
        className={`${toolBtnClass()} ${!hasSelection ? disabledClass : ''}`}
        style={hasSelection ? { color: 'var(--error)' } : toolBtnStyle()}
        title="Delete selected"
        onClick={onDelete}
      >
        <Trash2 size={20} />
        <span className="text-tag leading-none">Delete</span>
      </button>
    </div>
  );
}
