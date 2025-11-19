# Data Connectors

Simple, real-world data connectors for streaming sensor data, APIs, and IoT devices.

## Quick Start: Raspberry Pi in 2 Steps

```tsx
import { useRaspberryPi } from '@plexusui/components/lib/connectors';
import { LineChart } from '@plexusui/components/charts';

function SensorDashboard() {
  // Step 1: Connect to your Pi
  const { data, status, isConnected } = useRaspberryPi('raspberrypi.local');

  // Step 2: Visualize the data
  return (
    <>
      <div>Status: {status} {isConnected && '✓'}</div>
      <LineChart
        series={[{
          name: 'Temperature',
          data: data?.temperature || [],
        }]}
      />
    </>
  );
}
```

## Available Connectors

### 🔴 WebSocket Connector

Real-time streaming data via WebSocket.

```tsx
import { useWebSocket } from '@plexusui/components/lib/connectors';

const { data, status } = useWebSocket({
  url: 'ws://localhost:8080/stream',
  autoReconnect: true,
  heartbeatInterval: 30000
});
```

### 🔵 HTTP Connector

Polling REST APIs at regular intervals.

```tsx
import { useHTTP } from '@plexusui/components/lib/connectors';

const { data, status, reconnect } = useHTTP({
  url: 'https://api.example.com/data',
  pollInterval: 5000, // Poll every 5 seconds
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

### 🟢 Raspberry Pi Connector

High-level connector specifically for Raspberry Pi sensors.

```tsx
import { useRaspberryPi } from '@plexusui/components/lib/connectors';

// Simple: just hostname
const { data } = useRaspberryPi('raspberrypi.local');

// Advanced: full config
const { data, status, error } = useRaspberryPi({
  host: '192.168.1.100',
  port: 8080,
  protocol: 'websocket', // or 'http'
  path: '/sensors',
  pollInterval: 1000,
  authToken: 'secret123'
});
```

## Server-side Setup

### Python Flask Server (Raspberry Pi)

Save this as `sensor_server.py` on your Raspberry Pi:

```python
from flask import Flask, jsonify
from flask_cors import CORS
import time
import random

app = Flask(__name__)
CORS(app)

@app.route('/sensors')
def get_sensors():
    """Return sensor readings as JSON"""
    return jsonify({
        'timestamp': time.time(),
        'temperature': random.uniform(20, 30),
        'humidity': random.uniform(40, 60),
        'pressure': random.uniform(1000, 1020)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

Install dependencies:
```bash
pip install flask flask-cors
python sensor_server.py
```

### WebSocket Server (Node.js)

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send data every second
  const interval = setInterval(() => {
    const data = {
      timestamp: Date.now(),
      value: Math.random() * 100
    };
    ws.send(JSON.stringify(data));
  }, 1000);

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});
```

## Advanced Usage

### Manual Connector Control

```tsx
import { RaspberryPiConnector } from '@plexusui/components/lib/connectors';

const connector = new RaspberryPiConnector({
  host: 'raspberrypi.local',
  autoReconnect: true,
  reconnectAttempts: 10
});

// Manual connection
await connector.connect();

// Subscribe to data
const unsubscribe = connector.subscribe((data) => {
  console.log('Received:', data);
});

// Subscribe to status changes
connector.onStatusChange((status) => {
  console.log('Status:', status);
});

// Subscribe to errors
connector.onError((error) => {
  console.error('Error:', error);
});

// Disconnect
await connector.disconnect();
```

### Transform Data

```tsx
const { data } = useHTTP({
  url: 'https://api.example.com/raw-data',
  pollInterval: 5000,
  transform: (response) => {
    // Transform API response to chart format
    return response.readings.map((r, i) => ({
      x: i,
      y: r.value
    }));
  }
});
```

## TypeScript Support

All connectors are fully typed:

```tsx
interface SensorData {
  timestamp: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

const { data } = useRaspberryPi<SensorData>('raspberrypi.local');

// `data` is typed as SensorData | null
if (data) {
  console.log(data.temperature); // ✓ Type-safe
}
```

## Error Handling

```tsx
const { data, status, error, reconnect } = useRaspberryPi('raspberrypi.local');

if (error) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reconnect}>Retry</button>
    </div>
  );
}
```

## Status Indicators

```tsx
const { status, isConnected, isConnecting, hasError } = useRaspberryPi('raspberrypi.local');

return (
  <div>
    {isConnecting && <Spinner />}
    {isConnected && <span>✓ Connected</span>}
    {hasError && <span>✗ Error</span>}
  </div>
);
```
