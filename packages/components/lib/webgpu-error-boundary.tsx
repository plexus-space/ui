"use client";

/**
 * WebGPU Error Boundary
 *
 * React Error Boundary specifically designed for WebGPU components.
 * Provides graceful fallbacks when WebGPU is not available or encounters errors.
 *
 * **Features:**
 * - Catches WebGPU initialization errors
 * - Catches runtime WebGPU errors
 * - Provides customizable fallback UI
 * - Optional Canvas2D fallback renderer
 * - Detailed error reporting in dev mode
 *
 * @example
 * ```tsx
 * <WebGPUErrorBoundary
 *   fallback={<div>WebGPU not supported. Please use a modern browser.</div>}
 * >
 *   <WaveformMonitor traces={traces} />
 * </WebGPUErrorBoundary>
 * ```
 */

import * as React from "react";
import { isWebGPUAvailable } from "../primitives/device";

// ============================================================================
// Types
// ============================================================================

export interface WebGPUErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode;
  /** Custom fallback UI to show on error */
  fallback?: React.ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Callback when error is recovered */
  onReset?: () => void;
  /** Show error details in fallback (default: false in production) */
  showErrorDetails?: boolean;
}

interface WebGPUErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// ============================================================================
// Default Fallback Component
// ============================================================================

interface DefaultFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  onReset?: () => void;
}

const DefaultFallback: React.FC<DefaultFallbackProps> = ({
  error,
  errorInfo,
  showDetails,
  onReset,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200,
      padding: 24,
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      border: "2px solid rgba(239, 68, 68, 0.3)",
      borderRadius: 8,
      color: "currentColor",
    }}
  >
    <div
      style={{
        fontSize: 48,
        marginBottom: 16,
      }}
    >
      �
    </div>
    <h3
      style={{
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 8,
      }}
    >
      WebGPU Error
    </h3>
    <p
      style={{
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 16,
        textAlign: "center",
        maxWidth: 500,
      }}
    >
      This component requires WebGPU support. Please use a modern browser like
      Chrome 113+, Edge 113+, or Safari 18+.
    </p>

    {showDetails && error && (
      <details
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "monospace",
          maxWidth: 600,
          width: "100%",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Error Details
        </summary>
        <div style={{ marginTop: 8 }}>
          <div>
            <strong>Message:</strong> {error.message}
          </div>
          {error.stack && (
            <div style={{ marginTop: 8 }}>
              <strong>Stack:</strong>
              <pre
                style={{
                  marginTop: 4,
                  padding: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  borderRadius: 4,
                  overflow: "auto",
                  fontSize: 11,
                }}
              >
                {error.stack}
              </pre>
            </div>
          )}
          {errorInfo?.componentStack && (
            <div style={{ marginTop: 8 }}>
              <strong>Component Stack:</strong>
              <pre
                style={{
                  marginTop: 4,
                  padding: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  borderRadius: 4,
                  overflow: "auto",
                  fontSize: 11,
                }}
              >
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    )}

    {onReset && (
      <button
        onClick={onReset}
        style={{
          marginTop: 16,
          padding: "8px 16px",
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          color: "white",
          border: "none",
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    )}

    <div
      style={{
        marginTop: 16,
        fontSize: 12,
        opacity: 0.6,
      }}
    >
      Check browser compatibility at{" "}
      <a
        href="https://caniuse.com/webgpu"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "underline" }}
      >
        caniuse.com/webgpu
      </a>
    </div>
  </div>
);

// ============================================================================
// Error Boundary Component
// ============================================================================

export class WebGPUErrorBoundary extends React.Component<
  WebGPUErrorBoundaryProps,
  WebGPUErrorBoundaryState
> {
  constructor(props: WebGPUErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<WebGPUErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[WebGPUErrorBoundary] Caught error:", error);
      console.error("[WebGPUErrorBoundary] Error info:", errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    // Check WebGPU availability before rendering children
    if (!isWebGPUAvailable() && !this.state.hasError) {
      const error = new Error("WebGPU is not available in this browser");
      return (
        this.props.fallback ?? (
          <DefaultFallback
            error={error}
            errorInfo={null}
            showDetails={
              this.props.showErrorDetails ??
              process.env.NODE_ENV === "development"
            }
            onReset={this.props.onReset ? this.handleReset : undefined}
          />
        )
      );
    }

    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <DefaultFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            showDetails={
              this.props.showErrorDetails ??
              process.env.NODE_ENV === "development"
            }
            onReset={this.props.onReset ? this.handleReset : undefined}
          />
        )
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Hook for error handling
// ============================================================================

/**
 * Hook to manually report errors to the nearest error boundary
 */
export const useWebGPUError = () => {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};
