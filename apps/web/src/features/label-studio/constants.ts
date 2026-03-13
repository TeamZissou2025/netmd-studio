import type { LabelTemplateType } from '@netmd-studio/types';

export interface TemplateConfig {
  type: LabelTemplateType;
  name: string;
  description: string;
  widthMm: number;
  heightMm: number;
  isCircle?: boolean;
}

// Physical dimensions from CLAUDE.md Appendix C
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    type: 'jcard_front',
    name: 'J-Card Front',
    description: 'Front cover — 65mm x 104mm',
    widthMm: 65,
    heightMm: 104,
  },
  {
    type: 'jcard_back',
    name: 'J-Card Back',
    description: 'Back panel with tracklist — 65mm x 104mm',
    widthMm: 65,
    heightMm: 104,
  },
  {
    type: 'jcard_full',
    name: 'J-Card Full',
    description: 'Front + spine + back unfolded — 136.7mm x 104mm',
    widthMm: 136.7,
    heightMm: 104,
  },
  {
    type: 'spine',
    name: 'Spine',
    description: 'Side spine — 6.7mm x 104mm',
    widthMm: 6.7,
    heightMm: 104,
  },
  {
    type: 'disc_label',
    name: 'Disc Label',
    description: 'Circular disc label — 64mm diameter',
    widthMm: 64,
    heightMm: 64,
    isCircle: true,
  },
];

// 300 DPI conversion: 1mm = 300/25.4 pixels ≈ 11.811 px/mm
export const MM_TO_PX_300DPI = 300 / 25.4;

// Canvas display scale (show at a reasonable size on screen)
// We work at 72 DPI for display, export at 300 DPI
export const DISPLAY_PPI = 72;
export const EXPORT_PPI = 300;
export const MM_TO_PX_DISPLAY = DISPLAY_PPI / 25.4;

// Print bleed in mm
export const BLEED_MM = 3;

// Grid spacing in mm
export const GRID_SPACING_MM = 1;

// Max undo/redo stack size
export const MAX_UNDO_STATES = 50;

export function getTemplateConfig(type: LabelTemplateType): TemplateConfig {
  return TEMPLATE_CONFIGS.find((t) => t.type === type) ?? TEMPLATE_CONFIGS[0];
}

export function mmToPxDisplay(mm: number): number {
  return Math.round(mm * MM_TO_PX_DISPLAY);
}

export function mmToPx300(mm: number): number {
  return Math.round(mm * MM_TO_PX_300DPI);
}
