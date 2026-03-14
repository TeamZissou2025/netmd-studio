import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-6xl font-bold font-mono mb-2" style={{ color: 'var(--border-hover)' }}>404</div>
      <h1 className="text-studio-title font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Page not found</h1>
      <p className="text-body mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="h-9 px-4 text-nav rounded-md font-medium inline-flex items-center gap-1.5 transition-colors"
          style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft size={14} /> Go back
        </button>
        <Link
          to="/"
          className="h-9 px-4 text-nav rounded-md font-medium inline-flex items-center gap-1.5 transition-colors"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <Home size={14} /> Home
        </Link>
      </div>
    </div>
  );
}
