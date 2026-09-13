import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[50vh] text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-retro-cream">दृश्य लोड करने में समस्या आई</h3>
          <p className="text-xs text-white/60 max-w-xs">
            कृपया पुनः प्रयास करें या अन्य खोज शब्द का उपयोग करें।
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>पुनः प्रयास करें (Retry)</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}