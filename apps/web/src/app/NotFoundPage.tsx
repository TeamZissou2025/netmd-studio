import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-6xl font-bold text-studio-border mb-2 font-mono">404</div>
      <h1 className="text-xl font-semibold text-studio-text mb-2">Page not found</h1>
      <p className="text-sm text-studio-text-muted mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="h-8 px-3 text-sm rounded-studio font-medium bg-studio-surface text-studio-text-muted border border-studio-border hover:bg-studio-surface-hover transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Go back
        </button>
        <Link
          to="/"
          className="h-8 px-3 text-sm rounded-studio font-medium bg-studio-cyan text-studio-black hover:bg-studio-cyan-hover transition-colors inline-flex items-center gap-1.5"
        >
          <Home size={14} />
          Home
        </Link>
      </div>
    </div>
  );
}
