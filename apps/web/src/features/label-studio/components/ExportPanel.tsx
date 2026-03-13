import { useState } from 'react';
import { Download, FileImage, FileText, Save, Globe, Lock } from 'lucide-react';
import { Button, Input } from '@netmd-studio/ui';
import { jsPDF } from 'jspdf';
import type { LabelTemplateType } from '@netmd-studio/types';
import { getTemplateConfig, EXPORT_PPI, DISPLAY_PPI } from '../constants';

interface ExportPanelProps {
  templateType: LabelTemplateType;
  exportDataURL: (multiplier: number) => string | null;
  onSave: (params: { title: string; isPublic: boolean }) => Promise<boolean>;
  designTitle: string;
  onTitleChange: (title: string) => void;
  isSaving: boolean;
  hasDesignId: boolean;
}

export function ExportPanel({
  templateType,
  exportDataURL,
  onSave,
  designTitle,
  onTitleChange,
  isSaving,
  hasDesignId,
}: ExportPanelProps) {
  const [isPublic, setIsPublic] = useState(false);
  const config = getTemplateConfig(templateType);
  const multiplier = EXPORT_PPI / DISPLAY_PPI;

  const exportPNG = () => {
    const dataUrl = exportDataURL(multiplier);
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `${designTitle || 'label'}-300dpi.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportPDF = () => {
    const dataUrl = exportDataURL(multiplier);
    if (!dataUrl) return;

    const widthMm = config.widthMm;
    const heightMm = config.heightMm;
    const orientation = widthMm > heightMm ? 'landscape' : 'portrait';

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [widthMm, heightMm],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, widthMm, heightMm);
    pdf.save(`${designTitle || 'label'}.pdf`);
  };

  const handleSave = async () => {
    await onSave({ title: designTitle, isPublic });
  };

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-medium text-studio-text-muted">Export & Save</h3>

      <Input
        label="Design Title"
        value={designTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="My Label Design"
      />

      {/* Visibility toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPublic(!isPublic)}
          className={`flex items-center gap-1.5 h-7 px-2 rounded-studio text-2xs font-medium transition-colors ${
            isPublic
              ? 'bg-studio-cyan-muted text-studio-cyan border border-studio-cyan-border'
              : 'bg-studio-surface-hover text-studio-text-muted border border-studio-border'
          }`}
        >
          {isPublic ? <Globe size={12} /> : <Lock size={12} />}
          {isPublic ? 'Public' : 'Private'}
        </button>
        <span className="text-2xs text-studio-text-dim">
          {isPublic ? 'Visible in gallery' : 'Only you can see this'}
        </span>
      </div>

      <div className="space-y-2">
        <Button variant="primary" className="w-full" onClick={handleSave} disabled={isSaving || !designTitle.trim()}>
          <Save size={14} />
          {isSaving ? 'Saving...' : hasDesignId ? 'Update Design' : 'Save Design'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="w-full" onClick={exportPNG}>
            <FileImage size={14} />
            PNG 300 DPI
          </Button>
          <Button variant="secondary" className="w-full" onClick={exportPDF}>
            <FileText size={14} />
            PDF
          </Button>
        </div>
      </div>

      <p className="text-2xs text-studio-text-dim">
        Export dimensions: {config.widthMm}mm x {config.heightMm}mm at 300 DPI
      </p>
    </div>
  );
}
