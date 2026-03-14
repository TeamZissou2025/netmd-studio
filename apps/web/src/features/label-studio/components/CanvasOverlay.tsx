import type { LabelTemplateType } from '@netmd-studio/types';
import { getTemplateConfig, mmToPxDisplay, BLEED_MM, GRID_SPACING_MM } from '../constants';

interface CanvasOverlayProps {
  templateType: LabelTemplateType;
  showGrid: boolean;
  showBleed: boolean;
}

export function CanvasOverlay({ templateType, showGrid, showBleed }: CanvasOverlayProps) {
  const config = getTemplateConfig(templateType);
  const width = mmToPxDisplay(config.widthMm);
  const height = mmToPxDisplay(config.heightMm);
  const bleedPx = mmToPxDisplay(BLEED_MM);
  const gridPx = mmToPxDisplay(GRID_SPACING_MM);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width, height }}>
      {/* Grid overlay */}
      {showGrid && (
        <svg className="absolute inset-0" width={width} height={height}>
          <defs>
            <pattern id="grid" width={gridPx} height={gridPx} patternUnits="userSpaceOnUse">
              <path
                d={`M ${gridPx} 0 L 0 0 0 ${gridPx}`}
                fill="none"
                stroke="rgba(0,212,255,0.15)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}

      {/* Bleed indicator */}
      {showBleed && (
        <div className="absolute" style={{
          top: -bleedPx,
          left: -bleedPx,
          width: width + bleedPx * 2,
          height: height + bleedPx * 2,
          border: '1px dashed rgba(255,0,102,0.5)',
          pointerEvents: 'none',
        }}>
          {/* Crop marks at corners */}
          {[
            { top: bleedPx - 1, left: -bleedPx, width: bleedPx - 2, height: 1 },
            { top: -bleedPx, left: bleedPx - 1, width: 1, height: bleedPx - 2 },
            { top: bleedPx - 1, right: -bleedPx, width: bleedPx - 2, height: 1 },
            { top: -bleedPx, right: bleedPx - 1, width: 1, height: bleedPx - 2 },
            { bottom: bleedPx - 1, left: -bleedPx, width: bleedPx - 2, height: 1 },
            { bottom: -bleedPx, left: bleedPx - 1, width: 1, height: bleedPx - 2 },
            { bottom: bleedPx - 1, right: -bleedPx, width: bleedPx - 2, height: 1 },
            { bottom: -bleedPx, right: bleedPx - 1, width: 1, height: bleedPx - 2 },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute"
              style={{ ...s as React.CSSProperties, background: 'var(--pillar-transfer)', opacity: 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
