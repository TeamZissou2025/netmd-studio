import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = () => { this.setState({ hasError: false, error: null }); window.location.href = '/'; };
  handleRetry = () => { this.setState({ hasError: false, error: null }); };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--surface-0)' }}>
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(212,55,28,0.1)', border: '1px solid rgba(212,55,28,0.2)' }}>
              <AlertTriangle size={32} style={{ color: 'var(--error)' }} />
            </div>
            <h1 className="text-card-title font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h1>
            <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
              An unexpected error occurred. Please try again or reload the page.
            </p>
            {this.state.error && (
              <pre className="text-tag font-mono p-3 mb-6 text-left overflow-x-auto max-h-32 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}>
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button onClick={this.handleRetry} className="h-9 px-4 text-nav rounded-md font-medium inline-flex items-center gap-1.5 transition-colors" style={{ background: 'var(--accent)', color: 'white' }}>
                <RefreshCw size={14} /> Try again
              </button>
              <button onClick={this.handleReload} className="h-9 px-4 text-nav rounded-md font-medium inline-flex items-center gap-1.5 transition-colors" style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
