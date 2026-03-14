import { Disc3, LayoutTemplate, BookOpen, Minus, CircleDot } from 'lucide-react';
import { Card } from '@netmd-studio/ui';
import type { LabelTemplateType } from '@netmd-studio/types';
import { TEMPLATE_CONFIGS, type TemplateConfig } from '../constants';

const templateIcons: Record<LabelTemplateType, typeof Disc3> = {
  jcard_front: LayoutTemplate,
  jcard_back: BookOpen,
  jcard_full: LayoutTemplate,
  spine: Minus,
  disc_label: CircleDot,
};

interface TemplateSelectorProps {
  onSelect: (type: LabelTemplateType) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Disc3 size={32} className="mb-4" style={{ color: 'var(--accent)' }} />
      <h2 className="text-card-title font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Choose a Template</h2>
      <p className="text-body mb-8 max-w-md text-center" style={{ color: 'var(--text-secondary)' }}>
        Select a label type to start designing. Each template uses standard MiniDisc print dimensions.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
        {TEMPLATE_CONFIGS.map((config: TemplateConfig) => {
          const Icon = templateIcons[config.type];
          return (
            <Card
              key={config.type}
              hoverable
              className="flex flex-col items-center gap-3 p-6 text-center"
              onClick={() => onSelect(config.type)}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}>
                <Icon size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h3 className="text-body font-semibold" style={{ color: 'var(--text-primary)' }}>{config.name}</h3>
                <p className="text-label mt-1" style={{ color: 'var(--text-secondary)' }}>{config.description}</p>
              </div>
              {/* Dimension preview */}
              <div className="flex items-end justify-center mt-2">
                <div
                  style={{
                    width: config.isCircle
                      ? `${Math.min(config.widthMm * 0.7, 60)}px`
                      : `${Math.min(config.widthMm * 0.7, 80)}px`,
                    height: config.isCircle
                      ? `${Math.min(config.heightMm * 0.7, 60)}px`
                      : `${Math.min(config.heightMm * 0.7, 60)}px`,
                    borderRadius: config.isCircle ? '50%' : '2px',
                    border: '1px solid var(--border-hover)',
                    background: 'var(--surface-2)',
                  }}
                />
              </div>
              <span className="text-tag font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {config.widthMm}mm x {config.heightMm}mm
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
