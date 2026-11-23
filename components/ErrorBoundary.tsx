import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { auth } from '../firebase';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.reload();
    } catch (e) {
      console.error(e);
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isPermissionDenied = false;

      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.operationType && parsedError.error) {
            const rawErr = String(parsedError.error);
            isPermissionDenied = /permission|insufficient|missing or insufficient permissions/i.test(rawErr);
            errorMessage = `Database Error (${parsedError.operationType}): ${rawErr}`;
          }
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
        isPermissionDenied = /permission-denied|missing or insufficient permissions/i.test(errorMessage);
      }

      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
          <div className="bg-dark-800 border-4 border-red-500 rounded-none p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] text-center">
            <div className="w-16 h-16 bg-dark-900 border-4 border-red-500 rounded-none flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-surface-text mb-4 uppercase tracking-widest">Something went wrong</h1>
            <p className="text-surface-muted mb-6 font-mono text-sm leading-relaxed">
              {isPermissionDenied 
                ? <>
                    <strong className="text-red-500 block mb-2">Firestore Access Denied</strong>
                    Your session may not have permission to perform this database operation. Try signing out and back in, or verify your deployed <strong className="text-white">firestore.rules</strong>.
                  </>
                : "The application encountered an unexpected runtime error. Reloading usually resolves transient issues."}
            </p>
            <div className="bg-dark-900 rounded-none p-4 text-left overflow-auto max-h-48 mb-8 border-4 border-dark-600">
              <code className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                {errorMessage}
              </code>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-jenga-500 hover:bg-jenga-400 text-dark-950 font-black rounded-none transition-all border-2 border-dark-950 uppercase tracking-widest"
              >
                Reload Application
              </button>
              {isPermissionDenied && (
                <button
                  onClick={this.handleSignOut}
                  className="w-full px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-none transition-all border-2 border-dark-950 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out First
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
