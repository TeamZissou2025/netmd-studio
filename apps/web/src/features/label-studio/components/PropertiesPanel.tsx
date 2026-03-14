import { useEffect, useState, useCallback } from 'react';
import { Input } from '@netmd-studio/ui';
import type { FabricObject, IText } from 'fabric';

const FONT_OPTIONS = [
  'Inter',
  'JetBrains Mono',
  'Georgia',
  'Courier New',
  'Arial Black',
  'Impact',
];

const FONT_WEIGHTS = [
  { value: 'normal', label: '400' },
  { value: 'bold', label: '700' },
];

interface PropertiesPanelProps {
  selectedObject: FabricObject | null;
  onUpdate: () => void;
}

export function PropertiesPanel({ selectedObject, onUpdate }: PropertiesPanelProps) {
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  // Refresh when selection changes
  useEffect(() => {
    refresh();
  }, [selectedObject, refresh]);

  if (!selectedObject) {
    return (
      <div className="p-4">
        <h3 className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>Properties</h3>
        <p className="text-label text-center py-4" style={{ color: 'var(--text-tertiary)' }}>Select an object to edit its properties</p>
      </div>
    );
  }

  const isText = selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox';
  const textObj = isText ? (selectedObject as unknown as IText) : null;

  const updateProp = (key: string, value: unknown) => {
    selectedObject.set(key as keyof FabricObject, value as never);
    selectedObject.canvas?.renderAll();
    onUpdate();
    refresh();
  };

  return (
    <div className="p-4 space-y-3 text-label">
      <h3 className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>Properties</h3>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="X"
          type="number"
          value={Math.round(selectedObject.left ?? 0)}
          onChange={(e) => updateProp('left', Number(e.target.value))}
          className="text-label h-7"
        />
        <Input
          label="Y"
          type="number"
          value={Math.round(selectedObject.top ?? 0)}
          onChange={(e) => updateProp('top', Number(e.target.value))}
          className="text-label h-7"
        />
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Width"
          type="number"
          value={Math.round((selectedObject.width ?? 0) * (selectedObject.scaleX ?? 1))}
          onChange={(e) => {
            const w = Number(e.target.value);
            updateProp('scaleX', w / (selectedObject.width ?? 1));
          }}
          className="text-label h-7"
        />
        <Input
          label="Height"
          type="number"
          value={Math.round((selectedObject.height ?? 0) * (selectedObject.scaleY ?? 1))}
          onChange={(e) => {
            const h = Number(e.target.value);
            updateProp('scaleY', h / (selectedObject.height ?? 1));
          }}
          className="text-label h-7"
        />
      </div>

      {/* Rotation + Opacity */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Angle"
          type="number"
          value={Math.round(selectedObject.angle ?? 0)}
          onChange={(e) => updateProp('angle', Number(e.target.value))}
          className="text-label h-7"
        />
        <div className="flex flex-col gap-1">
          <label className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={selectedObject.opacity ?? 1}
            onChange={(e) => updateProp('opacity', Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: 'var(--border)', accentColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Fill + Stroke */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>Fill</label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={String(selectedObject.fill ?? '#000000')}
              onChange={(e) => updateProp('fill', e.target.value)}
              className="w-7 h-7 rounded bg-transparent cursor-pointer"
              style={{ border: '1px solid var(--border)' }}
            />
            <input
              type="text"
              value={String(selectedObject.fill ?? '#000000')}
              onChange={(e) => updateProp('fill', e.target.value)}
              className="flex-1 h-7 rounded-md px-2 text-tag font-mono outline-none"
              style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>Stroke</label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={String(selectedObject.stroke ?? '#000000')}
              onChange={(e) => updateProp('stroke', e.target.value)}
              className="w-7 h-7 rounded bg-transparent cursor-pointer"
              style={{ border: '1px solid var(--border)' }}
            />
            <Input
              type="number"
              value={selectedObject.strokeWidth ?? 0}
              onChange={(e) => updateProp('strokeWidth', Number(e.target.value))}
              className="text-tag h-7 w-14"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Text properties */}
      {textObj && (
        <>
          <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <h4 className="text-nav font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Text</h4>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>Font</label>
            <select
              value={textObj.fontFamily ?? 'Inter'}
              onChange={(e) => updateProp('fontFamily', e.target.value)}
              className="h-7 rounded-md px-2 text-label outline-none appearance-none"
              style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Size"
              type="number"
              value={textObj.fontSize ?? 16}
              onChange={(e) => updateProp('fontSize', Number(e.target.value))}
              className="text-label h-7"
              min={4}
              max={200}
            />
            <div className="flex flex-col gap-1">
              <label className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>Weight</label>
              <select
                value={String(textObj.fontWeight ?? 'normal')}
                onChange={(e) => updateProp('fontWeight', e.target.value)}
                className="h-7 rounded-md px-2 text-label outline-none appearance-none"
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                {FONT_WEIGHTS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              className="h-7 rounded-md text-label font-medium transition-colors border"
              style={
                textObj.textAlign === 'left'
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--border-accent)' }
                  : { background: 'var(--surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
              }
              onClick={() => updateProp('textAlign', 'left')}
            >
              Left
            </button>
            <button
              className="h-7 rounded-md text-label font-medium transition-colors border"
              style={
                textObj.textAlign === 'center'
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--border-accent)' }
                  : { background: 'var(--surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
              }
              onClick={() => updateProp('textAlign', 'center')}
            >
              Center
            </button>
            <button
              className="h-7 rounded-md text-label font-medium transition-colors border"
              style={
                textObj.textAlign === 'right'
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--border-accent)' }
                  : { background: 'var(--surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
              }
              onClick={() => updateProp('textAlign', 'right')}
            >
              Right
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Letter Spacing"
              type="number"
              value={textObj.charSpacing ?? 0}
              onChange={(e) => updateProp('charSpacing', Number(e.target.value))}
              className="text-label h-7"
              step={10}
            />
            <Input
              label="Line Height"
              type="number"
              value={textObj.lineHeight ?? 1.2}
              onChange={(e) => updateProp('lineHeight', Number(e.target.value))}
              className="text-label h-7"
              step={0.1}
              min={0.5}
              max={3}
            />
          </div>
        </>
      )}
    </div>
  );
}
