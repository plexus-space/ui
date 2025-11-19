/**
 * Plexus UI Data Connectors
 *
 * Real-time data connection utilities for physical systems
 */

export * from "../connectors";

// Concrete connector implementations
export { WebSocketConnector, type WebSocketConnectorConfig } from "./websocket";
export { HTTPConnector, type HTTPConnectorConfig } from "./http";
export {
  RaspberryPiConnector,
  connectToPi,
  type RaspberryPiConnectorConfig,
  type RaspberryPiProtocol,
} from "./raspberry-pi";

// React hooks for connectors
export {
  useConnector,
  useRaspberryPi,
  useWebSocket,
  useHTTP,
  type UseConnectorResult,
} from "./use-connector";
