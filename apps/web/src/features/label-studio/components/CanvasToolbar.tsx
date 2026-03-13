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

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-studio-surface border border-studio-border rounded-studio-lg">
      {/* Add objects */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-2 mr-1">
        <Button variant="ghost" className="h-7 w-7 p-0" title="Add text" onClick={onAddText}>
          <Type size={14} />
        </Button>
        <Button variant="ghost" className="h-7 w-7 p-0" title="Add rectangle" onClick={() => onAddShape('rect')}>
          <Square size={14} />
        </Button>
        <Button variant="ghost" className="h-7 w-7 p-0" title="Add circle" onClick={() => onAddShape('circle')}>
          <Circle size={14} />
        </Button>
        <Button variant="ghost" className="h-7 w-7 p-0" title="Add line" onClick={() => onAddShape('line')}>
          <Minus size={14} />
        </Button>
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Upload image"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={14} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Background */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-2 mr-1">
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Background color"
          onClick={() => bgColorRef.current?.click()}
        >
          <Paintbrush size={14} />
        </Button>
        <input
          ref={bgColorRef}
          type="color"
          className="invisible absolute w-0 h-0"
          defaultValue="#ffffff"
          onChange={(e) => onSetBackgroundColor(e.target.value)}
        />
      </div>

      {/* Undo/redo */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-2 mr-1">
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 size={14} />
        </Button>
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Redo (Ctrl+Shift+Z)"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 size={14} />
        </Button>
      </div>

      {/* Layer controls */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-2 mr-1">
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Bring forward"
          onClick={() => onMoveLayer('up')}
          disabled={!hasSelection}
        >
          <ArrowUp size={14} />
        </Button>
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Send backward"
          onClick={() => onMoveLayer('down')}
          disabled={!hasSelection}
        >
          <ArrowDown size={14} />
        </Button>
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Bring to front"
          onClick={() => onMoveLayer('top')}
          disabled={!hasSelection}
        >
          <ChevronsUp size={14} />
        </Button>
        <Button
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Send to back"
          onClick={() => onMoveLayer('bottom')}
          disabled={!hasSelection}
        >
          <ChevronsDown size={14} />
        </Button>
      </div>

      {/* View toggles */}
      <div className="flex items-center gap-1 border-r border-studio-border pr-2 mr-1">
        <Button
          variant={showGrid ? 'secondary' : 'ghost'}
          className="h-7 px-2 text-2xs"
          onClick={onToggleGrid}
          title="Toggle grid"
        >
          <Grid3X3 size={14} />
        </Button>
        <Button
          variant={showBleed ? 'secondary' : 'ghost'}
          className="h-7 px-2 text-2xs"
          onClick={onToggleBleed}
          title="Toggle bleed"
        >
          <Expand size={14} />
        </Button>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        className="h-7 w-7 p-0 text-studio-error"
        title="Delete selected"
        onClick={onDelete}
        disabled={!hasSelection}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
