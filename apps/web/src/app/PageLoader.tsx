import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-studio-cyan" />
    </div>
  );
}
