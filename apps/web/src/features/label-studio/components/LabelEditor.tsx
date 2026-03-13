import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Monitor } from 'lucide-react';
import { Button } from '@netmd-studio/ui';
import type { LabelTemplateType, AlbumMetadata } from '@netmd-studio/types';
import toast from 'react-hot-toast';
import { useLabelEditor } from '../hooks/useLabelEditor';
import { useLabelDesigns } from '../hooks/useLabelDesigns';
import { getTemplateConfig, mmToPxDisplay, DISPLAY_PPI, EXPORT_PPI } from '../constants';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasOverlay } from './CanvasOverlay';
import { MetadataSearch } from './MetadataSearch';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { ExportPanel } from './ExportPanel';

interface LabelEditorProps {
  templateType: LabelTemplateType;
  onBack: () => void;
  editDesignId?: string;
}

export function LabelEditor({ templateType, onBack, editDesignId }: LabelEditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const editor = useLabelEditor(canvasElRef);
  const { saveDesign, loadDesign } = useLabelDesigns();
  const [designTitle, setDesignTitle] = useState('Untitled Label');
  const [designId, setDesignId] = useState<string | undefined>(editDesignId);
  const [isSaving, setIsSaving] = useState(false);
  const [albumMetadata, setAlbumMetadata] = useState<AlbumMetadata | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Init canvas
  useEffect(() => {
    editor.initCanvas(templateType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType]);

  // Load existing design if editing
  useEffect(() => {
    if (!editDesignId || !editor.canvas) return;
    (async () => {
      const design = await loadDesign(editDesignId);
      if (design) {
        setDesignTitle(design.title);
        setDesignId(design.id);
        if (design.artist_name || design.album_title) {
          setAlbumMetadata({
            artistName: design.artist_name ?? '',
            albumTitle: design.album_title ?? '',
            tracklist: (design.tracklist as Array<{ position: string; title: string; duration: string }>) ?? [],
            coverArtUrl: design.cover_art_url,
            discogsReleaseId: design.discogs_release_id ?? undefined,
            musicbrainzReleaseId: design.musicbrainz_release_id ?? undefined,
          });
        }
        await editor.loadCanvasJSON(design.canvas_data as Record<string, unknown>);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDesignId, editor.canvas]);

  const handleMetadataSelect = useCallback(
    async (metadata: AlbumMetadata) => {
      setAlbumMetadata(metadata);

      // Set cover art as background
      if (metadata.coverArtUrl) {
        await editor.setBackgroundImage(metadata.coverArtUrl);
      }

      // If this is a back panel type, auto-populate tracklist
      if (
        (templateType === 'jcard_back' || templateType === 'jcard_full') &&
        metadata.tracklist.length > 0
      ) {
        // Add title text
        editor.addText(`${metadata.artistName}\n${metadata.albumTitle}`, {
          fontSize: 10,
          fontFamily: 'Inter',
          fill: '#000000',
          fontWeight: 'bold',
        });

        // Add tracklist
        const trackText = metadata.tracklist
          .map((t) => `${t.position}. ${t.title}  ${t.duration}`)
          .join('\n');
        editor.addText(trackText, {
          fontSize: 7,
          fontFamily: 'JetBrains Mono',
          fill: '#333333',
        });
      } else {
        // For front/disc: add artist and title
        editor.addText(metadata.albumTitle, {
          fontSize: 14,
          fontFamily: 'Inter',
          fill: '#ffffff',
          fontWeight: 'bold',
        });
        editor.addText(metadata.artistName, {
          fontSize: 10,
          fontFamily: 'Inter',
          fill: '#eeeeee',
        });
      }

      setDesignTitle(`${metadata.artistName} — ${metadata.albumTitle}`);
      toast.success('Album metadata loaded');
    },
    [editor, templateType]
  );

  const handleSave = async (params: { title: string; isPublic: boolean }) => {
    setIsSaving(true);
    const canvasData = editor.getCanvasJSON();
    if (!canvasData) {
      setIsSaving(false);
      toast.error('Nothing to save');
      return false;
    }

    // Generate thumbnail
    const thumbnailDataUrl = editor.exportDataURL(400 / mmToPxDisplay(getTemplateConfig(templateType).widthMm));

    const result = await saveDesign({
      id: designId,
      title: params.title,
      templateType,
      canvasData: canvasData as Record<string, unknown>,
      thumbnailDataUrl: thumbnailDataUrl ?? undefined,
      isPublic: params.isPublic,
      artistName: albumMetadata?.artistName,
      albumTitle: albumMetadata?.albumTitle,
      tracklist: albumMetadata?.tracklist,
      coverArtUrl: albumMetadata?.coverArtUrl ?? undefined,
      discogsReleaseId: albumMetadata?.discogsReleaseId,
      musicbrainzReleaseId: albumMetadata?.musicbrainzReleaseId,
    });

    setIsSaving(false);
    if (result) {
      setDesignId(result.id);
      toast.success('Design saved');
      return true;
    } else {
      toast.error('Failed to save. Sign in to save designs.');
      return false;
    }
  };

  const config = getTemplateConfig(templateType);
  const canvasWidth = mmToPxDisplay(config.widthMm);
  const canvasHeight = mmToPxDisplay(config.heightMm);

  // Mobile overlay
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Monitor size={48} className="text-studio-text-dim mb-4" />
        <h2 className="text-lg font-semibold text-studio-text mb-2">Desktop Recommended</h2>
        <p className="text-sm text-studio-text-muted mb-4 max-w-sm">
          The label editor works best on larger screens. Please use a desktop or tablet for the full editing experience.
        </p>
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={14} />
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="h-8 px-2">
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-studio-text truncate">{config.name}</h2>
          <p className="text-sm text-studio-text-muted font-mono">
            {config.widthMm}mm &times; {config.heightMm}mm &mdash; {DISPLAY_PPI} DPI preview &middot; exports at {EXPORT_PPI} DPI
          </p>
        </div>
        <div className="w-80">
          <MetadataSearch onSelect={handleMetadataSelect} />
        </div>
      </div>

      {/* Toolbar */}
      <CanvasToolbar
        onAddText={() => editor.addText()}
        onAddShape={(s) => editor.addShape(s)}
        onAddImage={(url) => editor.addImage(url)}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onDelete={editor.deleteSelected}
        onToggleGrid={editor.toggleGrid}
        onToggleBleed={editor.toggleBleed}
        onMoveLayer={(d) => editor.moveLayer(d)}
        onSetBackgroundColor={(c) => editor.setBackgroundColor(c)}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        showGrid={editor.showGrid}
        showBleed={editor.showBleed}
        hasSelection={!!editor.selectedObject}
      />

      {/* Main area: Canvas + Panels */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center bg-studio-surface border border-studio-border rounded-studio-lg p-6 overflow-auto min-h-[600px]">
          <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
            <canvas ref={canvasElRef} />
            <CanvasOverlay
              templateType={templateType}
              showGrid={editor.showGrid}
              showBleed={editor.showBleed}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[280px] min-w-[280px] flex-shrink-0 bg-studio-surface border border-studio-border rounded-studio-lg overflow-y-auto max-h-[calc(100vh-14rem)]">
          <PropertiesPanel
            selectedObject={editor.selectedObject}
            onUpdate={editor.saveState}
          />
          <div className="border-t border-studio-border" />
          <LayersPanel
            canvas={editor.canvas}
            selectedObject={editor.selectedObject}
          />
          <div className="border-t border-studio-border" />
          <ExportPanel
            templateType={templateType}
            exportDataURL={editor.exportDataURL}
            onSave={handleSave}
            designTitle={designTitle}
            onTitleChange={setDesignTitle}
            isSaving={isSaving}
            hasDesignId={!!designId}
          />
        </div>
      </div>
    </div>
  );
}
