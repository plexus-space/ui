"use client";

import * as React from "react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for GPU-accelerated components
 *
 * Catches errors from WebGPU/WebGL rendering and provides fallback UI.
 * Particularly useful for graceful degradation when GPU features fail.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ChartErrorFallback />}>
 *   <LineChart data={data} />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log GPU-specific errors
    if (
      error.message.includes("WebGPU") ||
      error.message.includes("WebGL") ||
      error.message.includes("GPU")
    ) {
      console.error("GPU Error caught by ErrorBoundary:", error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  private areResetKeysEqual(a: unknown[], b: unknown[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((key, index) => Object.is(key, b[index]));
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Default fallback UI for chart errors
 */
function DefaultErrorFallback({ error }: { error: Error | null }) {
  const isGPUError =
    error?.message.includes("WebGPU") ||
    error?.message.includes("WebGL") ||
    error?.message.includes("GPU");

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="text-center px-6 py-8 max-w-md">
        <svg
          className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Chart Rendering Error
        </h3>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {isGPUError ? (
            <>
              Your browser may not support GPU acceleration (WebGPU/WebGL2).
              <br />
              Try updating your browser or enabling hardware acceleration in
              settings.
            </>
          ) : (
            <>
              An error occurred while rendering this chart.
              <br />
              Please try refreshing the page.
            </>
          )}
        </p>

        {error && (
          <details className="text-left">
            <summary className="text-xs text-zinc-500 dark:text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
              Technical details
            </summary>
            <pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 p-3 rounded overflow-auto max-h-32 text-left text-zinc-800 dark:text-zinc-200">
              {error.message}
            </pre>
          </details>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          type="button"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

/**
 * Custom error fallback for GPU-specific errors with troubleshooting tips
 */
export function GPUErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error | null;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="text-center px-6 py-8 max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-100 dark:bg-amber-900/20 rounded-full">
          <svg
            className="h-8 w-8 text-amber-600 dark:text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          GPU Acceleration Unavailable
        </h3>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          This chart requires GPU acceleration (WebGPU or WebGL2) which is not
          available in your browser.
        </p>

        <div className="text-left bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Troubleshooting Steps:
          </h4>
          <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 dark:text-zinc-600 mt-0.5">
                1.
              </span>
              <span>
                <strong className="text-zinc-900 dark:text-zinc-100">
                  Update your browser:
                </strong>{" "}
                Chrome 113+, Edge 113+, or Safari 18+
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 dark:text-zinc-600 mt-0.5">
                2.
              </span>
              <span>
                <strong className="text-zinc-900 dark:text-zinc-100">
                  Enable hardware acceleration:
                </strong>{" "}
                Check browser settings
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 dark:text-zinc-600 mt-0.5">
                3.
              </span>
              <span>
                <strong className="text-zinc-900 dark:text-zinc-100">
                  Update GPU drivers:
                </strong>{" "}
                Visit your graphics card manufacturer's website
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 dark:text-zinc-600 mt-0.5">
                4.
              </span>
              <span>
                <strong className="text-zinc-900 dark:text-zinc-100">
                  Check compatibility:
                </strong>{" "}
                Visit{" "}
                <a
                  href="https://webgpureport.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  webgpureport.org
                </a>
              </span>
            </li>
          </ul>
        </div>

        {error && (
          <details className="text-left mb-4">
            <summary className="text-xs text-zinc-500 dark:text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 p-3 rounded overflow-auto max-h-32 text-left text-zinc-800 dark:text-zinc-200">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              type="button"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            type="button"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to use error boundary imperatively
 *
 * @example
 * ```tsx
 * const { resetError } = useErrorBoundary();
 *
 * try {
 *   await initWebGPU();
 * } catch (error) {
 *   // Error will be caught by boundary
 *   throw error;
 * }
 * ```
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    showError: setError,
    resetError,
  };
}
