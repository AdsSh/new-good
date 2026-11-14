
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PermitFlow runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div role="alert" className="bg-white dark:bg-[#161F30] rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-800 p-8 sm:p-10">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6">
                <span aria-hidden="true" className="material-icons-outlined text-3xl">error_outline</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                Something went wrong
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md inline-flex items-center justify-center gap-2"
                >
                  <span aria-hidden="true" className="material-icons-outlined text-sm">refresh</span>
                  Refresh Page
                </button>
                <a
                  href="/"
                  className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span aria-hidden="true" className="material-icons-outlined text-sm">home</span>
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
