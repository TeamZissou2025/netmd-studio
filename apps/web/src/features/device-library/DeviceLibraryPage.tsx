import { Database, Search, Filter, CheckCircle } from 'lucide-react';

export function DeviceLibraryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-studio-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
        <Database size={32} className="text-studio-warning" />
      </div>
      <h2 className="text-2xl font-semibold text-studio-text mb-2">Device Library</h2>
      <p className="text-base text-studio-text-muted max-w-md mb-8">
        Community-maintained database of MiniDisc hardware. Browse specs,
        compatibility reports, and WebUSB support status.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg">
        {[
          { icon: Database, label: 'Browse' },
          { icon: Search, label: 'Search' },
          { icon: Filter, label: 'Filter' },
          { icon: CheckCircle, label: 'Reports' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 bg-studio-surface border border-studio-border rounded-studio-lg">
            <Icon size={20} className="text-studio-text-dim" />
            <span className="text-xs text-studio-text-muted">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-studio-text-dim mt-8">Coming in Prompt 2</p>
    </div>
  );
}
