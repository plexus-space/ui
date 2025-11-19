/**
 * React hooks for data connectors
 *
 * Makes it super easy to connect to real-time data sources.
 *
 * @example "2 clicks" Raspberry Pi connection:
 * ```tsx
 * function SensorDashboard() {
 *   const { data, status, error } = useRaspberryPi('raspberrypi.local');
 *
 *   return (
 *     <LineChart
 *       series={[{ name: 'Temperature', data: data?.temperature || [] }]}
 *     />
 *   );
 * }
 * ```
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  Connector,
  ConnectionStatus,
  ConnectionError,
} from "../connectors";
import {
  RaspberryPiConnector,
  type RaspberryPiConnectorConfig,
} from "./raspberry-pi";
import { WebSocketConnector, type WebSocketConnectorConfig } from "./websocket";
import { HTTPConnector, type HTTPConnectorConfig } from "./http";

export interface UseConnectorResult<TData> {
  /** Latest data from connector */
  data: TData | null;
  /** Connection status */
  status: ConnectionStatus;
  /** Last error if any */
  error: ConnectionError | null;
  /** Manually trigger reconnect */
  reconnect: () => Promise<void>;
  /** Disconnect */
  disconnect: () => Promise<void>;
  /** Whether currently connected */
  isConnected: boolean;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Whether there's an error */
  hasError: boolean;
}

/**
 * Generic hook for any connector
 */
export function useConnector<TData = any>(
  connector: Connector<TData> | null,
  autoConnect = true
): UseConnectorResult<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(
    connector?.getStatus() || "disconnected"
  );
  const [error, setError] = useState<ConnectionError | null>(null);
  const connectorRef = useRef(connector);

  // Update ref when connector changes
  useEffect(() => {
    connectorRef.current = connector;
  }, [connector]);

  const reconnect = useCallback(async () => {
    if (connectorRef.current) {
      await connectorRef.current.disconnect();
      await connectorRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (connectorRef.current) {
      await connectorRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!connector) return;

    // Subscribe to data updates
    const unsubscribeData = connector.subscribe((newData) => {
      setData(newData);
    });

    // Subscribe to status changes
    const unsubscribeStatus = connector.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to errors
    const unsubscribeError = connector.onError((newError) => {
      setError(newError);
    });

    // Auto-connect if enabled
    if (autoConnect && connector.getStatus() === "disconnected") {
      connector.connect().catch((err) => {
        console.error("Failed to connect:", err);
      });
    }

    // Cleanup
    return () => {
      unsubscribeData();
      unsubscribeStatus();
      unsubscribeError();
      // Don't auto-disconnect on unmount - let user control this
    };
  }, [connector, autoConnect]);

  return {
    data,
    status,
    error,
    reconnect,
    disconnect,
    isConnected: status === "connected",
    isConnecting: status === "connecting" || status === "reconnecting",
    hasError: status === "error",
  };
}

/**
 * "2 clicks" hook for Raspberry Pi sensors
 *
 * @example
 * ```tsx
 * const { data, status } = useRaspberryPi('raspberrypi.local');
 * ```
 */
export function useRaspberryPi<TData = any>(
  hostOrConfig: string | RaspberryPiConnectorConfig,
  autoConnect = true
): UseConnectorResult<TData> {
  const [connector] = useState(() => {
    const config =
      typeof hostOrConfig === "string"
        ? { host: hostOrConfig }
        : hostOrConfig;
    return new RaspberryPiConnector<TData>(config);
  });

  return useConnector(connector, autoConnect);
}

/**
 * Hook for WebSocket connections
 */
export function useWebSocket<TData = any>(
  config: WebSocketConnectorConfig,
  autoConnect = true
): UseConnectorResult<TData> {
  const [connector] = useState(() => new WebSocketConnector<TData>(config));
  return useConnector(connector, autoConnect);
}

/**
 * Hook for HTTP polling
 */
export function useHTTP<TData = any>(
  config: HTTPConnectorConfig,
  autoConnect = true
): UseConnectorResult<TData> {
  const [connector] = useState(() => new HTTPConnector<TData>(config));
  return useConnector(connector, autoConnect);
}
