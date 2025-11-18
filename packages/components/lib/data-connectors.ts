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

export interface DataConnector {
  connect: () => Promise<void>;
  disconnect: () => void;
  onData: (callback: DataCallback) => DataConnector;
  onError: (callback: ErrorCallback) => DataConnector;
  onStatus: (callback: StatusCallback) => DataConnector;
  getStatus: () => boolean;
  send?: (data: unknown) => void; // For WebSocket
}

// ============================================================================
// WebSocket Connector
// ============================================================================

export const createWebSocketConnector = (
  config: ConnectorConfig
): DataConnector => {
  const finalConfig = {
    reconnect: true,
    reconnectDelay: 3000,
    ...config,
  };

  let ws: WebSocket | undefined;
  let reconnectTimer: NodeJS.Timeout | undefined;
  let dataCallback: DataCallback | undefined;
  let errorCallback: ErrorCallback | undefined;
  let statusCallback: StatusCallback | undefined;
  let isConnected = false;

  const setStatus = (status: "connecting" | "connected" | "disconnected" | "error") => {
    isConnected = status === "connected";
    statusCallback?.(status);
  };

  const emitData = (data: DataPoint) => {
    dataCallback?.(data);
  };

  const emitError = (error: Error) => {
    errorCallback?.(error);
    setStatus("error");
  };

  const connect = async (): Promise<void> => {
    if (!finalConfig.url) {
      throw new Error("WebSocket URL is required");
    }

    setStatus("connecting");

    return new Promise((resolve, reject) => {
      try {
        ws = new WebSocket(finalConfig.url!);

        ws.onopen = () => {
          setStatus("connected");
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            emitData({
              timestamp: Date.now(),
              value: parsed.value ?? parsed,
              metadata: parsed.metadata,
            });
          } catch {
            // If not JSON, treat as raw value
            emitData({
              timestamp: Date.now(),
              value: parseFloat(event.data),
            });
          }
        };

        ws.onerror = () => {
          emitError(new Error("WebSocket error"));
          reject(new Error("WebSocket connection failed"));
        };

        ws.onclose = () => {
          setStatus("disconnected");
          if (finalConfig.reconnect) {
            reconnectTimer = setTimeout(() => {
              connect();
            }, finalConfig.reconnectDelay);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  };

  const disconnect = (): void => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    ws?.close();
    setStatus("disconnected");
  };

  const send = (data: unknown): void => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  return {
    connect,
    disconnect,
    send,
    onData: (callback) => {
      dataCallback = callback;
      return connector;
    },
    onError: (callback) => {
      errorCallback = callback;
      return connector;
    },
    onStatus: (callback) => {
      statusCallback = callback;
      return connector;
    },
    getStatus: () => isConnected,
  };

  const connector = {
    connect,
    disconnect,
    send,
    onData: (callback: DataCallback) => {
      dataCallback = callback;
      return connector;
    },
    onError: (callback: ErrorCallback) => {
      errorCallback = callback;
      return connector;
    },
    onStatus: (callback: StatusCallback) => {
      statusCallback = callback;
      return connector;
    },
    getStatus: () => isConnected,
  };

  return connector;
};

// ============================================================================
// Server-Sent Events (SSE) Connector
// ============================================================================

export const createSSEConnector = (config: ConnectorConfig): DataConnector => {
  const finalConfig = {
    reconnect: true,
    reconnectDelay: 3000,
    ...config,
  };

  let eventSource: EventSource | undefined;
  let dataCallback: DataCallback | undefined;
  let errorCallback: ErrorCallback | undefined;
  let statusCallback: StatusCallback | undefined;
  let isConnected = false;

  const setStatus = (status: "connecting" | "connected" | "disconnected" | "error") => {
    isConnected = status === "connected";
    statusCallback?.(status);
  };

  const emitData = (data: DataPoint) => {
    dataCallback?.(data);
  };

  const emitError = (error: Error) => {
    errorCallback?.(error);
    setStatus("error");
  };

  const connect = async (): Promise<void> => {
    if (!finalConfig.url) {
      throw new Error("SSE URL is required");
    }

    setStatus("connecting");

    return new Promise((resolve, reject) => {
      try {
        eventSource = new EventSource(finalConfig.url!);

        eventSource.onopen = () => {
          setStatus("connected");
          resolve();
        };

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            emitData({
              timestamp: Date.now(),
              value: parsed.value ?? parsed,
              metadata: parsed.metadata,
            });
          } catch {
            emitData({
              timestamp: Date.now(),
              value: parseFloat(event.data),
            });
          }
        };

        eventSource.onerror = () => {
          emitError(new Error("SSE connection error"));
          setStatus("error");
          reject(new Error("SSE connection failed"));
        };
      } catch (err) {
        reject(err);
      }
    });
  };

  const disconnect = (): void => {
    eventSource?.close();
    setStatus("disconnected");
  };

  const connector: DataConnector = {
    connect,
    disconnect,
    onData: (callback) => {
      dataCallback = callback;
      return connector;
    },
    onError: (callback) => {
      errorCallback = callback;
      return connector;
    },
    onStatus: (callback) => {
      statusCallback = callback;
      return connector;
    },
    getStatus: () => isConnected,
  };

  return connector;
};

// ============================================================================
// Web Serial Connector (for hardware sensors)
// ============================================================================

export const createSerialConnector = (config: ConnectorConfig): DataConnector => {
  const finalConfig = {
    reconnect: true,
    reconnectDelay: 3000,
    baudRate: 115200,
    ...config,
  };

  let port: SerialPort | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let reading = false;
  let dataCallback: DataCallback | undefined;
  let errorCallback: ErrorCallback | undefined;
  let statusCallback: StatusCallback | undefined;
  let isConnected = false;

  const setStatus = (status: "connecting" | "connected" | "disconnected" | "error") => {
    isConnected = status === "connected";
    statusCallback?.(status);
  };

  const emitData = (data: DataPoint) => {
    dataCallback?.(data);
  };

  const emitError = (error: Error) => {
    errorCallback?.(error);
    setStatus("error");
  };

  const startReading = async () => {
    if (!port?.readable) return;

    reading = true;
    reader = port.readable.getReader();
    let buffer = "";

    try {
      while (reading) {
        const { value, done } = await reader.read();
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
            emitData({
              timestamp: Date.now(),
              value: parsed.value ?? parsed,
              metadata: parsed.metadata,
            });
          } catch {
            // Try parsing as number
            const num = parseFloat(trimmed);
            if (!Number.isNaN(num)) {
              emitData({
                timestamp: Date.now(),
                value: num,
              });
            }
          }
        }
      }
    } catch (err) {
      emitError(err as Error);
    } finally {
      reader?.releaseLock();
    }
  };

  const connect = async (): Promise<void> => {
    setStatus("connecting");

    try {
      // Request port from user
      port = await navigator.serial.requestPort();

      await port.open({
        baudRate: finalConfig.baudRate,
      });

      setStatus("connected");
      startReading();
    } catch (err) {
      emitError(err as Error);
      throw err;
    }
  };

  const disconnect = (): void => {
    reading = false;
    reader?.cancel();
    port?.close();
    setStatus("disconnected");
  };

  const connector: DataConnector = {
    connect,
    disconnect,
    onData: (callback) => {
      dataCallback = callback;
      return connector;
    },
    onError: (callback) => {
      errorCallback = callback;
      return connector;
    },
    onStatus: (callback) => {
      statusCallback = callback;
      return connector;
    },
    getStatus: () => isConnected,
  };

  return connector;
};

// ============================================================================
// HTTP Polling Connector
// ============================================================================

export const createPollingConnector = (config: ConnectorConfig): DataConnector => {
  const finalConfig = {
    reconnect: true,
    reconnectDelay: 3000,
    interval: 1000,
    ...config,
  };

  let intervalId: NodeJS.Timeout | undefined;
  let dataCallback: DataCallback | undefined;
  let errorCallback: ErrorCallback | undefined;
  let statusCallback: StatusCallback | undefined;
  let isConnected = false;

  const setStatus = (status: "connecting" | "connected" | "disconnected" | "error") => {
    isConnected = status === "connected";
    statusCallback?.(status);
  };

  const emitData = (data: DataPoint) => {
    dataCallback?.(data);
  };

  const emitError = (error: Error) => {
    errorCallback?.(error);
  };

  const fetchData = async () => {
    const response = await fetch(finalConfig.url!, {
      headers: finalConfig.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    emitData({
      timestamp: Date.now(),
      value: data.value ?? data,
      metadata: data.metadata,
    });
  };

  const connect = async (): Promise<void> => {
    if (!finalConfig.url) {
      throw new Error("Polling URL is required");
    }

    setStatus("connecting");

    // Test connection
    await fetchData();
    setStatus("connected");

    // Start polling
    intervalId = setInterval(() => {
      fetchData().catch((err) => emitError(err));
    }, finalConfig.interval);
  };

  const disconnect = (): void => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setStatus("disconnected");
  };

  const connector: DataConnector = {
    connect,
    disconnect,
    onData: (callback) => {
      dataCallback = callback;
      return connector;
    },
    onError: (callback) => {
      errorCallback = callback;
      return connector;
    },
    onStatus: (callback) => {
      statusCallback = callback;
      return connector;
    },
    getStatus: () => isConnected,
  };

  return connector;
};

// ============================================================================
// Connector Factory
// ============================================================================

export const createConnector = (config: ConnectorConfig): DataConnector => {
  switch (config.type) {
    case "websocket":
      return createWebSocketConnector(config);
    case "sse":
      return createSSEConnector(config);
    case "serial":
      return createSerialConnector(config);
    case "polling":
      return createPollingConnector(config);
    default:
      throw new Error(`Unsupported connector type: ${config.type}`);
  }
};

// ============================================================================
// Auto-detect data format and create appropriate parser
// ============================================================================

export interface DataSchema {
  type: "scalar" | "vector" | "timeseries" | "signal";
  fields: string[];
  sampleRate?: number;
  channels?: number;
}

export const detectDataSchema = (samples: DataPoint[]): DataSchema => {
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
};

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
