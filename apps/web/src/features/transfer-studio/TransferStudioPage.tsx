import { Usb, Disc3, Music, Zap } from 'lucide-react';

export function TransferStudioPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-studio-xl bg-studio-magenta-muted border border-studio-magenta/20 flex items-center justify-center mb-6">
        <Usb size={32} className="text-studio-magenta" />
      </div>
      <h2 className="text-2xl font-semibold text-studio-text mb-2">Transfer Studio</h2>
      <p className="text-base text-studio-text-muted max-w-md mb-8">
        Transfer audio to your MiniDisc player via WebUSB. Supports SP, LP2, and LP4
        encoding with client-side ATRAC compression.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg">
        {[
          { icon: Usb, label: 'WebUSB' },
          { icon: Music, label: 'Audio Queue' },
          { icon: Disc3, label: 'Disc TOC' },
          { icon: Zap, label: 'ATRAC Encode' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 bg-studio-surface border border-studio-border rounded-studio-lg">
            <Icon size={20} className="text-studio-text-dim" />
            <span className="text-xs text-studio-text-muted">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-studio-text-dim mt-8">Coming in Prompt 4</p>
    </div>
  );
}
