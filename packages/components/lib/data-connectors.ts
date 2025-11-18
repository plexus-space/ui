"use client";

/**
 * Real-time data connectors for observability platforms
 * Supports WebSocket, Server-Sent Events, MQTT, Web Serial, and HTTP polling
 */

// ============================================================================
// Types
// ============================================================================

export type DataConnectorType = "websocket" | "sse" | "serial" | "mqtt" | "polling";

export interface ConnectorConfig {
  type: DataConnectorType;
  url?: string;
  port?: string; // For serial
  baudRate?: number; // For serial
  topic?: string; // For MQTT
  interval?: number; // For polling (ms)
  headers?: Record<string, string>;
  reconnect?: boolean;
  reconnectDelay?: number; // ms
}

export interface DataPoint {
  timestamp: number;
  value: number | number[];
  metadata?: Record<string, unknown>;
}

export type DataCallback = (data: DataPoint) => void;
export type ErrorCallback = (error: Error) => void;
export type StatusCallback = (status: "connecting" | "connected" | "disconnected" | "error") => void;

// ============================================================================
// Base Connector Class
// ============================================================================

export abstract class DataConnector {
  protected config: ConnectorConfig;
  protected dataCallback?: DataCallback;
  protected errorCallback?: ErrorCallback;
  protected statusCallback?: StatusCallback;
  protected isConnected = false;

  constructor(config: ConnectorConfig) {
    this.config = {
      reconnect: true,
      reconnectDelay: 3000,
      ...config,
    };
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): void;

  onData(callback: DataCallback): this {
    this.dataCallback = callback;
    return this;
  }

  onError(callback: ErrorCallback): this {
    this.errorCallback = callback;
    return this;
  }

  onStatus(callback: StatusCallback): this {
    this.statusCallback = callback;
    return this;
  }

  protected setStatus(status: "connecting" | "connected" | "disconnected" | "error") {
    this.isConnected = status === "connected";
    this.statusCallback?.(status);
  }

  protected emitData(data: DataPoint) {
    this.dataCallback?.(data);
  }

  protected emitError(error: Error) {
    this.errorCallback?.(error);
    this.setStatus("error");
  }

  getStatus(): boolean {
    return this.isConnected;
  }
}

// ============================================================================
// WebSocket Connector
// ============================================================================

export class WebSocketConnector extends DataConnector {
  private ws?: WebSocket;
  private reconnectTimer?: NodeJS.Timeout;

  async connect(): Promise<void> {
    if (!this.config.url) {
      throw new Error("WebSocket URL is required");
    }

    this.setStatus("connecting");

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url!);

        this.ws.onopen = () => {
          this.setStatus("connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            this.emitData({
              timestamp: Date.now(),
              value: parsed.value ?? parsed,
              metadata: parsed.metadata,
            });
          } catch (err) {
            // If not JSON, treat as raw value
            this.emitData({
              timestamp: Date.now(),
              value: parseFloat(event.data),
            });
          }
        };

        this.ws.onerror = (event) => {
          this.emitError(new Error("WebSocket error"));
          reject(new Error("WebSocket connection failed"));
        };

        this.ws.onclose = () => {
          this.setStatus("disconnected");
          if (this.config.reconnect) {
            this.reconnectTimer = setTimeout(() => {
              this.connect();
            }, this.config.reconnectDelay);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
    this.setStatus("disconnected");
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

// ============================================================================
// Server-Sent Events (SSE) Connector
// ============================================================================

export class SSEConnector extends DataConnector {
  private eventSource?: EventSource;

  async connect(): Promise<void> {
    if (!this.config.url) {
      throw new Error("SSE URL is required");
    }

    this.setStatus("connecting");

    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(this.config.url!);

        this.eventSource.onopen = () => {
          this.setStatus("connected");
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            this.emitData({
              timestamp: Date.now(),
              value: parsed.value ?? parsed,
              metadata: parsed.metadata,
            });
          } catch {
            this.emitData({
              timestamp: Date.now(),
              value: parseFloat(event.data),
            });
          }
        };

        this.eventSource.onerror = () => {
          this.emitError(new Error("SSE connection error"));
          this.setStatus("error");
          reject(new Error("SSE connection failed"));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  disconnect(): void {
    this.eventSource?.close();
    this.setStatus("disconnected");
  }
}

// ============================================================================
// Web Serial Connector (for hardware sensors)
// ============================================================================

export class SerialConnector extends DataConnector {
  private port?: SerialPort;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  private reading = false;

  async connect(): Promise<void> {
    this.setStatus("connecting");

    try {
      // Request port from user
      this.port = await navigator.serial.requestPort();

      await this.port.open({
        baudRate: this.config.baudRate || 115200,
      });

      this.setStatus("connected");
      this.startReading();
    } catch (err) {
      this.emitError(err as Error);
      throw err;
    }
  }

  private async startReading() {
    if (!this.port?.readable) return;

    this.reading = true;
    this.reader = this.port.readable.getReader();
    let buffer = "";

    try {
      while (this.reading) {
        const { value, done } = await this.reader.read();
        if (done) break;

        // Convert bytes to string
        const text = new TextDecoder().decode(value);
        buffer += text;

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            // Try parsing as JSON first
            const parsed = JSON.parse(trimmed);
            this.emitData({
              timestamp: Date.now(),
              value: parsed.value ?? parsed,
              metadata: parsed.metadata,
            });
          } catch {
            // Try parsing as number
            const num = parseFloat(trimmed);
            if (!Number.isNaN(num)) {
              this.emitData({
                timestamp: Date.now(),
                value: num,
              });
            }
          }
        }
      }
    } catch (err) {
      this.emitError(err as Error);
    } finally {
      this.reader?.releaseLock();
    }
  }

  disconnect(): void {
    this.reading = false;
    this.reader?.cancel();
    this.port?.close();
    this.setStatus("disconnected");
  }
}

// ============================================================================
// HTTP Polling Connector
// ============================================================================

export class PollingConnector extends DataConnector {
  private intervalId?: NodeJS.Timeout;

  async connect(): Promise<void> {
    if (!this.config.url) {
      throw new Error("Polling URL is required");
    }

    this.setStatus("connecting");

    // Test connection
    await this.fetchData();
    this.setStatus("connected");

    // Start polling
    this.intervalId = setInterval(() => {
      this.fetchData().catch((err) => this.emitError(err));
    }, this.config.interval || 1000);
  }

  private async fetchData() {
    const response = await fetch(this.config.url!, {
      headers: this.config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    this.emitData({
      timestamp: Date.now(),
      value: data.value ?? data,
      metadata: data.metadata,
    });
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.setStatus("disconnected");
  }
}

// ============================================================================
// Connector Factory
// ============================================================================

export function createConnector(config: ConnectorConfig): DataConnector {
  switch (config.type) {
    case "websocket":
      return new WebSocketConnector(config);
    case "sse":
      return new SSEConnector(config);
    case "serial":
      return new SerialConnector(config);
    case "polling":
      return new PollingConnector(config);
    default:
      throw new Error(`Unsupported connector type: ${config.type}`);
  }
}

// ============================================================================
// Auto-detect data format and create appropriate parser
// ============================================================================

export interface DataSchema {
  type: "scalar" | "vector" | "timeseries" | "signal";
  fields: string[];
  sampleRate?: number;
  channels?: number;
}

export function detectDataSchema(samples: DataPoint[]): DataSchema {
  if (samples.length === 0) {
    return { type: "scalar", fields: [] };
  }

  const firstValue = samples[0].value;

  // Check if vector (array)
  if (Array.isArray(firstValue)) {
    return {
      type: firstValue.length > 10 ? "signal" : "vector",
      fields: firstValue.map((_, i) => `channel_${i}`),
      channels: firstValue.length,
    };
  }

  // Check if timeseries (has consistent timestamps)
  if (samples.length > 1) {
    const intervals = samples.slice(1).map((s, i) => s.timestamp - samples[i].timestamp);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const isRegular = intervals.every((i) => Math.abs(i - avgInterval) < avgInterval * 0.1);

    if (isRegular) {
      return {
        type: "timeseries",
        fields: ["value"],
        sampleRate: 1000 / avgInterval, // Hz
      };
    }
  }

  return { type: "scalar", fields: ["value"] };
}

// ============================================================================
// Pre-configured connectors for common devices
// ============================================================================

export const DEVICE_PRESETS: Record<string, Partial<ConnectorConfig>> = {
  "arduino-uno": {
    type: "serial",
    baudRate: 9600,
  },
  "esp32": {
    type: "serial",
    baudRate: 115200,
  },
  "raspberry-pi-pico": {
    type: "serial",
    baudRate: 115200,
  },
  "openbci-cyton": {
    type: "serial",
    baudRate: 115200,
  },
  "accelerometer-adxl345": {
    type: "serial",
    baudRate: 9600,
  },
};
