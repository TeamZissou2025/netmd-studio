import { Disc3, Palette, Type, Image, Download } from 'lucide-react';

export function LabelStudioPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-studio-xl bg-studio-cyan-muted border border-studio-cyan-border flex items-center justify-center mb-6">
        <Disc3 size={32} className="text-studio-cyan" />
      </div>
      <h2 className="text-2xl font-semibold text-studio-text mb-2">Label Studio</h2>
      <p className="text-base text-studio-text-muted max-w-md mb-8">
        Design J-cards, spine labels, and disc labels for your MiniDisc collection.
        Search Discogs and MusicBrainz for album metadata and cover art.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg">
        {[
          { icon: Palette, label: 'Templates' },
          { icon: Type, label: 'Text Tools' },
          { icon: Image, label: 'Cover Art' },
          { icon: Download, label: 'PDF Export' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 bg-studio-surface border border-studio-border rounded-studio-lg">
            <Icon size={20} className="text-studio-text-dim" />
            <span className="text-xs text-studio-text-muted">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-studio-text-dim mt-8">Coming in Prompt 3</p>
    </div>
  );
}
