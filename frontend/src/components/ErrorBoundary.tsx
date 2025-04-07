import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("React error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-black/90 text-white min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-xl text-red-400 mb-4">Something went wrong</h2>
          <pre className="p-4 bg-black/50 rounded border border-red-500/20 max-w-full overflow-auto text-xs">
            {this.state.error?.toString()}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;