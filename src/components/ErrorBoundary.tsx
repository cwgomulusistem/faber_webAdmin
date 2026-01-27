'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  // For widget-specific error boundary
  entityId?: string;
  entityName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child component tree
 * Prevents single widget crash from taking down entire dashboard
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error for debugging
    console.error('[ErrorBoundary] Widget Error:', {
      entityId: this.props.entityId,
      entityName: this.props.entityName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="glass-card p-4 border-red-500/30 bg-red-900/10">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">Bileşen Hatası</span>
          </div>
          
          {this.props.entityName && (
            <p className="text-xs text-gray-400 mb-2">
              {this.props.entityName}
            </p>
          )}
          
          <p className="text-xs text-gray-500 mb-3">
            Bu bileşen yüklenirken bir hata oluştu.
          </p>
          
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 
                       transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg"
          >
            <RefreshCw size={14} />
            Yeniden Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * WidgetErrorBoundary - Specialized error boundary for IoT widgets
 * Shows a minimal error state that fits within the widget grid
 */
interface WidgetErrorBoundaryProps {
  children: ReactNode;
  entityId: string;
  entityName: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const WidgetErrorBoundary: React.FC<WidgetErrorBoundaryProps> = ({
  children,
  entityId,
  entityName,
  onError,
}) => {
  return (
    <ErrorBoundary
      entityId={entityId}
      entityName={entityName}
      onError={onError}
      fallback={
        <WidgetErrorFallback 
          entityName={entityName} 
          onRetry={() => window.location.reload()} 
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * WidgetErrorFallback - Compact error display for widgets
 */
interface WidgetErrorFallbackProps {
  entityName: string;
  onRetry?: () => void;
}

export const WidgetErrorFallback: React.FC<WidgetErrorFallbackProps> = ({ 
  entityName, 
  onRetry 
}) => {
  return (
    <div className="glass-card p-4 min-h-[120px] flex flex-col items-center justify-center 
                    border-red-500/20 bg-red-900/5">
      <AlertTriangle className="text-red-400 mb-2" size={24} />
      <p className="text-xs text-gray-400 text-center mb-2 line-clamp-1">
        {entityName}
      </p>
      <p className="text-[10px] text-gray-500 text-center mb-2">
        Yüklenemedi
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-[10px] text-indigo-400 
                     hover:text-indigo-300 transition-colors"
        >
          <RefreshCw size={12} />
          Yenile
        </button>
      )}
    </div>
  );
};

export default ErrorBoundary;
