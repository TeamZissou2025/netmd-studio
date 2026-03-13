import { Eye, EyeOff, Lock, Unlock, Type, Square, Circle, Minus, Image } from 'lucide-react';
import type { Canvas, FabricObject } from 'fabric';
import { useState, useEffect, useCallback } from 'react';

interface LayersPanelProps {
  canvas: Canvas | null;
  selectedObject: FabricObject | null;
}

function getObjectIcon(obj: FabricObject) {
  const type = obj.type;
  if (type === 'i-text' || type === 'text' || type === 'textbox') return Type;
  if (type === 'rect') return Square;
  if (type === 'circle') return Circle;
  if (type === 'line') return Minus;
  if (type === 'image') return Image;
  return Square;
}

function getObjectLabel(obj: FabricObject): string {
  const type = obj.type;
  if (type === 'i-text' || type === 'text' || type === 'textbox') {
    const text = (obj as unknown as { text: string }).text ?? '';
    return text.substring(0, 20) || 'Text';
  }
  if (type === 'rect') return 'Rectangle';
  if (type === 'circle') return 'Circle';
  if (type === 'line') return 'Line';
  if (type === 'image') return 'Image';
  return 'Object';
}

export function LayersPanel({ canvas, selectedObject }: LayersPanelProps) {
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    if (!canvas) {
      setObjects([]);
      return;
    }
    // Reverse order so top-most appears first in list
    setObjects([...canvas.getObjects()].reverse());
    setTick((t) => t + 1);
  }, [canvas]);

  useEffect(() => {
    refresh();
    if (!canvas) return;
    canvas.on('object:added', refresh);
    canvas.on('object:removed', refresh);
    canvas.on('object:modified', refresh);
    return () => {
      canvas.off('object:added', refresh);
      canvas.off('object:removed', refresh);
      canvas.off('object:modified', refresh);
    };
  }, [canvas, refresh]);

  if (!canvas) return null;

  return (
    <div className="p-3">
      <h3 className="text-sm font-medium text-studio-text-muted mb-2 px-1">Layers</h3>
      {objects.length === 0 && (
        <p className="text-xs text-studio-text-dim text-center py-4">No objects on canvas</p>
      )}
      <div className="space-y-0.5">
        {objects.map((obj, idx) => {
          const Icon = getObjectIcon(obj);
          const isSelected = selectedObject === obj;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-studio cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-studio-cyan-muted border border-studio-cyan-border'
                  : 'hover:bg-studio-surface-hover border border-transparent'
              }`}
              onClick={() => {
                canvas.setActiveObject(obj);
                canvas.renderAll();
              }}
            >
              <Icon size={16} className={`flex-shrink-0 ${isSelected ? 'text-studio-cyan' : 'text-studio-text-dim'}`} />
              <span className="text-xs text-studio-text truncate flex-1">{getObjectLabel(obj)}</span>
              <button
                className="flex-shrink-0 p-0.5 text-studio-text-dim hover:text-studio-text transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  obj.set('visible', !obj.visible);
                  canvas.renderAll();
                  refresh();
                }}
                title={obj.visible !== false ? 'Hide' : 'Show'}
              >
                {obj.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                className="flex-shrink-0 p-0.5 text-studio-text-dim hover:text-studio-text transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  obj.set('selectable', !obj.selectable);
                  obj.set('evented', !obj.evented);
                  canvas.renderAll();
                  refresh();
                }}
                title={obj.selectable !== false ? 'Lock' : 'Unlock'}
              >
                {obj.selectable !== false ? <Unlock size={14} /> : <Lock size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
