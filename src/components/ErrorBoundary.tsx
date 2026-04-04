import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private parseError(error: Error | null) {
    if (!error) return null;
    try {
      return JSON.parse(error.message);
    } catch (e) {
      return { error: error.message };
    }
  }

  public render() {
    if (this.state.hasError) {
      const errorData = this.parseError(this.state.error);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">Something went wrong</h1>
              <p className="text-slate-500 text-sm">
                {errorData.error || "An unexpected error occurred while processing your request."}
              </p>
            </div>

            {errorData.operationType && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Operation</span>
                  <span className="text-slate-900">{errorData.operationType}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Path</span>
                  <span className="text-slate-900">{errorData.path || "N/A"}</span>
                </div>
                {errorData.authInfo?.userId ? (
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>User ID</span>
                    <span className="text-slate-900 truncate ml-4">{errorData.authInfo.userId}</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    User not authenticated
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
