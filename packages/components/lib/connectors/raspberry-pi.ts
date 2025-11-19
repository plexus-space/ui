/**
 * Raspberry Pi Connector
 *
 * Dead-simple connector for Raspberry Pi sensors.
 * Automatically handles common sensor data formats.
 *
 * @example "2 clicks" connection:
 * ```tsx
 * // Step 1: Create connector
 * const pi = new RaspberryPiConnector({
 *   host: 'raspberrypi.local', // or IP address
 *   port: 8080
 * });
 *
 * // Step 2: Connect and use
 * pi.connect();
 * pi.subscribe((data) => setSensorData(data));
 * ```
 *
 * Works with the companion Python script on your Pi:
 * ```python
 * # On Raspberry Pi: sensor_server.py
 * from flask import Flask
 * from flask_cors import CORS
 * import json
 * import time
 *
 * app = Flask(__name__)
 * CORS(app)
 *
 * @app.route('/sensors')
 * def get_sensors():
 *     return json.dumps({
 *         'timestamp': time.time(),
 *         'temperature': read_temperature(),
 *         'humidity': read_humidity(),
 *         'pressure': read_pressure()
 *     })
 *
 * if __name__ == '__main__':
 *     app.run(host='0.0.0.0', port=8080)
 * ```
 */

import { HTTPConnector, type HTTPConnectorConfig } from "./http";
import { WebSocketConnector, type WebSocketConnectorConfig } from "./websocket";
import type { Connector, ConnectorConfig } from "../connectors";

export type RaspberryPiProtocol = "http" | "websocket";

export interface RaspberryPiConnectorConfig extends ConnectorConfig {
  /** Raspberry Pi hostname or IP address */
  host: string;
  /** Port number (default: 8080) */
  port?: number;
  /** Protocol to use (default: 'http') */
  protocol?: RaspberryPiProtocol;
  /** Endpoint path (default: '/sensors') */
  path?: string;
  /** Polling interval for HTTP (default: 1000ms) */
  pollInterval?: number;
  /** Use HTTPS/WSS (default: false) */
  secure?: boolean;
  /** Optional authentication token */
  authToken?: string;
}

/**
 * High-level Raspberry Pi connector that auto-configures based on protocol
 */
export class RaspberryPiConnector<TData = any> implements Connector<TData> {
  private innerConnector: Connector<TData>;

  constructor(config: RaspberryPiConnectorConfig) {
    const {
      host,
      port = 8080,
      protocol = "http",
      path = "/sensors",
      pollInterval = 1000,
      secure = false,
      authToken,
      ...baseConfig
    } = config;

    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    if (protocol === "websocket") {
      // WebSocket mode
      const wsProtocol = secure ? "wss" : "ws";
      const url = `${wsProtocol}://${host}:${port}${path}`;

      this.innerConnector = new WebSocketConnector<TData>({
        url,
        headers,
        ...baseConfig,
      } as WebSocketConnectorConfig);
    } else {
      // HTTP polling mode (default)
      const httpProtocol = secure ? "https" : "http";
      const url = `${httpProtocol}://${host}:${port}${path}`;

      this.innerConnector = new HTTPConnector<TData>({
        url,
        pollInterval,
        headers,
        ...baseConfig,
      } as HTTPConnectorConfig);
    }
  }

  connect(): Promise<void> {
    return this.innerConnector.connect();
  }

  disconnect(): Promise<void> {
    return this.innerConnector.disconnect();
  }

  subscribe(callback: (data: TData) => void): () => void {
    return this.innerConnector.subscribe(callback);
  }

  onStatusChange(
    callback: (status: import("../connectors").ConnectionStatus) => void
  ): () => void {
    return this.innerConnector.onStatusChange(callback);
  }

  onError(
    callback: (error: import("../connectors").ConnectionError) => void
  ): () => void {
    return this.innerConnector.onError(callback);
  }

  getStatus(): import("../connectors").ConnectionStatus {
    return this.innerConnector.getStatus();
  }

  getLastError(): import("../connectors").ConnectionError | null {
    return this.innerConnector.getLastError();
  }
}

/**
 * Quick start helper - creates and connects a Pi connector in one line
 */
export async function connectToPi<TData = any>(
  host: string,
  options?: Partial<Omit<RaspberryPiConnectorConfig, "host">>
): Promise<RaspberryPiConnector<TData>> {
  const connector = new RaspberryPiConnector<TData>({
    host,
    ...options,
  });

  await connector.connect();
  return connector;
}
