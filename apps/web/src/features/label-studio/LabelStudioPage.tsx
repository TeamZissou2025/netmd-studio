import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Disc3, BookOpen, ShoppingBag } from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import type { LabelTemplateType } from '@netmd-studio/types';
import { TemplateSelector } from './components/TemplateSelector';
import { LabelEditor } from './components/LabelEditor';
import { SEOHead } from '../../app/SEOHead';

export function LabelStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplateType | null>(null);
  const editDesignId = searchParams.get('edit') ?? undefined;

  // If editing an existing design, go straight to editor
  useEffect(() => {
    if (editDesignId && !selectedTemplate) {
      // Default to jcard_front, the editor will load the correct type from the design
      setSelectedTemplate('jcard_front');
    }
  }, [editDesignId, selectedTemplate]);

  const handleSelectTemplate = (type: LabelTemplateType) => {
    setSelectedTemplate(type);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    // Clear edit param
    if (editDesignId) {
      setSearchParams({});
    }
  };

  return (
    <div>
      <SEOHead title="Label Studio" description="Design J-cards, spine labels, and disc labels for your MiniDisc collection." />
      {/* Navigation bar */}
      {!selectedTemplate && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}>
              <Disc3 size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 className="text-card-title font-semibold" style={{ color: 'var(--text-primary)' }}>Label Studio</h1>
              <p className="text-nav" style={{ color: 'var(--text-secondary)' }}>
                Design J-cards, spine labels, and disc labels for your MiniDisc collection.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/marketplace?search=disc+custom">
              <Button variant="ghost">
                <ShoppingBag size={14} />
                Marketplace
              </Button>
            </Link>
            <Link to="/labels/gallery">
              <Button variant="secondary">
                <BookOpen size={14} />
                Gallery
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      {selectedTemplate ? (
        <LabelEditor
          templateType={selectedTemplate}
          onBack={handleBack}
          editDesignId={editDesignId}
        />
      ) : (
        <TemplateSelector onSelect={handleSelectTemplate} />
      )}
    </div>
  );
}
