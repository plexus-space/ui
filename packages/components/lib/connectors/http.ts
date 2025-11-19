/**
 * HTTP Connector
 *
 * Simple HTTP polling connector for REST APIs.
 * Automatically fetches data at a specified interval.
 *
 * @example
 * ```tsx
 * const connector = new HTTPConnector({
 *   url: 'https://api.example.com/data',
 *   pollInterval: 5000, // Poll every 5 seconds
 *   headers: {
 *     'Authorization': 'Bearer token123'
 *   }
 * });
 *
 * connector.connect();
 * connector.subscribe((data) => {
 *   setSensorData(data);
 * });
 * ```
 */

import {
  BaseConnector,
  ConnectionStatus,
  type ConnectorConfig,
} from "../connectors";

export interface HTTPConnectorConfig extends ConnectorConfig {
  /** API endpoint URL */
  url: string;
  /** Polling interval in milliseconds */
  pollInterval: number;
  /** HTTP method (default: GET) */
  method?: "GET" | "POST" | "PUT" | "PATCH";
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body (for POST/PUT/PATCH) */
  body?: any;
  /** Transform function to process response data */
  transform?: (response: any) => any;
  /** Query parameters */
  queryParams?: Record<string, string>;
}

export class HTTPConnector<TData = any> extends BaseConnector<TData> {
  private pollTimer?: ReturnType<typeof setInterval>;
  private readonly url: string;
  private readonly pollInterval: number;
  private readonly method: string;
  private readonly headers: Record<string, string>;
  private readonly body?: any;
  private readonly transform?: (response: any) => any;
  private readonly queryParams?: Record<string, string>;

  constructor(config: HTTPConnectorConfig) {
    super(config);
    this.url = config.url;
    this.pollInterval = config.pollInterval;
    this.method = config.method ?? "GET";
    this.headers = config.headers ?? {};
    this.body = config.body;
    this.transform = config.transform;
    this.queryParams = config.queryParams;
  }

  async connect(): Promise<void> {
    if (this.status === ConnectionStatus.CONNECTED) {
      return;
    }

    this.setStatus(ConnectionStatus.CONNECTING);
    this.clearReconnectTimer();

    try {
      // Perform initial fetch to validate connection
      await this.fetchData();
      this.setStatus(ConnectionStatus.CONNECTED);
      this.reconnectAttempt = 0;

      // Start polling
      this.startPolling();
    } catch (error) {
      this.emitError(
        error instanceof Error ? error.message : "Connection failed",
        "CONNECT_ERROR"
      );
      this.scheduleReconnect();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.clearReconnectTimer();
    this.stopPolling();
    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  private startPolling(): void {
    this.stopPolling();

    this.pollTimer = setInterval(async () => {
      try {
        await this.fetchData();
      } catch (error) {
        this.emitError(
          error instanceof Error ? error.message : "Fetch failed",
          "FETCH_ERROR"
        );
        // Don't disconnect on single fetch failure, just log it
      }
    }, this.pollInterval);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  private async fetchData(): Promise<void> {
    // Build URL with query params
    let fetchUrl = this.url;
    if (this.queryParams) {
      const params = new URLSearchParams(this.queryParams);
      fetchUrl = `${this.url}?${params.toString()}`;
    }

    // Prepare fetch options
    const options: RequestInit = {
      method: this.method,
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
    };

    if (this.body && this.method !== "GET") {
      options.body =
        typeof this.body === "string" ? this.body : JSON.stringify(this.body);
    }

    // Perform fetch
    const response = await fetch(fetchUrl, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse response
    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Transform if needed
    if (this.transform) {
      data = this.transform(data);
    }

    // Emit data
    this.emitData(data as TData);
  }

  /**
   * Manually trigger a fetch (useful for on-demand updates)
   */
  async refresh(): Promise<void> {
    if (this.status !== ConnectionStatus.CONNECTED) {
      throw new Error("Not connected");
    }
    await this.fetchData();
  }
}
