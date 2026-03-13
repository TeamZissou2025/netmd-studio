import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

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

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-studio-black flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-studio-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-studio-error" />
            </div>
            <h1 className="text-2xl font-semibold text-studio-text mb-2">Something went wrong</h1>
            <p className="text-sm text-studio-text-muted mb-6">
              An unexpected error occurred. Please try again or reload the page.
            </p>
            {this.state.error && (
              <pre className="text-2xs text-studio-text-dim bg-studio-surface border border-studio-border rounded-studio p-3 mb-6 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="h-8 px-3 text-sm rounded-studio font-medium bg-studio-cyan text-studio-black hover:bg-studio-cyan-hover transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                Try again
              </button>
              <button
                onClick={this.handleReload}
                className="h-8 px-3 text-sm rounded-studio font-medium bg-studio-surface text-studio-text-muted border border-studio-border hover:bg-studio-surface-hover transition-colors inline-flex items-center gap-1.5"
              >
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
