/**
 * WebSocket Connector
 *
 * Simple real-time data streaming via WebSocket.
 * Perfect for Raspberry Pi sensors, IoT devices, and real-time telemetry.
 *
 * @example
 * ```tsx
 * const connector = new WebSocketConnector({
 *   url: 'ws://raspberrypi.local:8080/sensors',
 *   autoReconnect: true
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

export interface WebSocketConnectorConfig extends ConnectorConfig {
  /** WebSocket URL (ws:// or wss://) */
  url: string;
  /** Optional protocols */
  protocols?: string | string[];
  /** Optional headers (for authorization, etc.) */
  headers?: Record<string, string>;
  /** Heartbeat interval in milliseconds (0 = disabled) */
  heartbeatInterval?: number;
  /** Custom heartbeat message (default: 'ping') */
  heartbeatMessage?: string;
}

export class WebSocketConnector<TData = any> extends BaseConnector<TData> {
  private ws: WebSocket | null = null;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private readonly url: string;
  private readonly protocols?: string | string[];
  private readonly headers?: Record<string, string>;
  private readonly heartbeatInterval: number;
  private readonly heartbeatMessage: string;

  constructor(config: WebSocketConnectorConfig) {
    super(config);
    this.url = config.url;
    this.protocols = config.protocols;
    this.headers = config.headers;
    this.heartbeatInterval = config.heartbeatInterval ?? 30000; // 30s default
    this.heartbeatMessage = config.heartbeatMessage ?? "ping";
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setStatus(ConnectionStatus.CONNECTING);
    this.clearReconnectTimer();

    try {
      // Create WebSocket connection
      this.ws = new WebSocket(this.url, this.protocols);

      // Set up event handlers
      this.ws.onopen = () => {
        this.setStatus(ConnectionStatus.CONNECTED);
        this.reconnectAttempt = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          // Parse JSON data
          const data = JSON.parse(event.data) as TData;
          this.emitData(data);
        } catch (error) {
          // If not JSON, emit raw data
          this.emitData(event.data as TData);
        }
      };

      this.ws.onerror = (event) => {
        this.emitError("WebSocket error", "WS_ERROR");
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (event.wasClean) {
          this.setStatus(ConnectionStatus.DISCONNECTED);
        } else {
          this.emitError(
            `Connection closed unexpectedly: ${event.reason || "Unknown"}`,
            "WS_CLOSE"
          );
          this.scheduleReconnect();
        }
      };

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) {
          reject(new Error("WebSocket not initialized"));
          return;
        }

        const onOpen = () => {
          this.ws?.removeEventListener("open", onOpen);
          this.ws?.removeEventListener("error", onError);
          resolve();
        };

        const onError = () => {
          this.ws?.removeEventListener("open", onOpen);
          this.ws?.removeEventListener("error", onError);
          reject(new Error("Failed to connect"));
        };

        this.ws.addEventListener("open", onOpen);
        this.ws.addEventListener("error", onError);
      });
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
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Send data to the WebSocket server
   */
  send(data: any): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const message = typeof data === "string" ? data : JSON.stringify(data);
    this.ws.send(message);
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval <= 0) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(this.heartbeatMessage);
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }
}
