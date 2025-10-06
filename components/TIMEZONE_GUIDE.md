# Timezone Handling in LineChart

The LineChart component provides robust timezone support for displaying time-series data across different timezones. This is critical for aerospace, satellite operations, and scientific applications where data may be collected in one timezone but needs to be displayed in another.

## Key Features

- ✅ **Timezone-aware formatting** - Display timestamps in any IANA timezone
- ✅ **UTC by default** - All times default to UTC for scientific accuracy
- ✅ **Custom formatters** - Full control over time display
- ✅ **Graceful fallbacks** - Invalid timezones fall back to UTC
- ✅ **No external dependencies** - Uses native `Intl.DateTimeFormat`

## Basic Usage

### UTC Times (Default)

```tsx
import { LineChart } from '@/components/plexusui/line-chart'

function SatellitePass() {
  const passData = [
    { x: 1704067200000, y: 45 },  // 2024-01-01 00:00:00 UTC
    { x: 1704067260000, y: 52 },  // 2024-01-01 00:01:00 UTC
    { x: 1704067320000, y: 48 },  // 2024-01-01 00:02:00 UTC
  ];

  return (
    <LineChart
      series={[{ name: "Signal Strength (dBm)", data: passData }]}
      xAxis={{
        label: "Time (UTC)",
        type: "time",
        timezone: "UTC"  // Default, can be omitted
      }}
      yAxis={{ label: "Signal (dBm)" }}
    />
  );
}
```

### Different Timezones

```tsx
// Display ground station data in local timezone
function GroundStationData() {
  const telemetryData = [
    { x: Date.now(), y: 23.5 },
    { x: Date.now() + 60000, y: 24.1 },
    { x: Date.now() + 120000, y: 23.8 },
  ];

  return (
    <LineChart
      series={[{ name: "Temperature", data: telemetryData }]}
      xAxis={{
        label: "Time (Alaska)",
        type: "time",
        timezone: "America/Anchorage"  // Ground station timezone
      }}
      yAxis={{ label: "Temp (°C)" }}
    />
  );
}
```

## Common Timezones for Aerospace

```tsx
// Mission Control (Houston)
timezone: "America/Chicago"

// Kennedy Space Center (Florida)
timezone: "America/New_York"

// JPL/Pasadena (California)
timezone: "America/Los_Angeles"

// ESA ESOC (Germany)
timezone: "Europe/Berlin"

// JAXA (Japan)
timezone: "Asia/Tokyo"

// UTC (Universal - Default for space operations)
timezone: "UTC"
```

## Advanced Usage

### Custom Time Formatter

```tsx
function CustomTimeFormat() {
  // Format times with millisecond precision
  const customFormatter = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString(); // Full ISO format
  };

  return (
    <LineChart
      series={[{ name: "Precision Data", data: myData }]}
      xAxis={{
        label: "Time (ISO)",
        formatter: customFormatter  // Custom formatting
      }}
    />
  );
}
```

### Mission Elapsed Time (MET)

```tsx
function MissionElapsedTime() {
  const launchTime = 1704067200000; // Mission start

  const metFormatter = (timestamp: number) => {
    const elapsed = (timestamp - launchTime) / 1000; // seconds
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = Math.floor(elapsed % 60);
    return `T+${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <LineChart
      series={[{ name: "Altitude", data: trajectoryData }]}
      xAxis={{
        label: "Mission Elapsed Time",
        formatter: metFormatter
      }}
      yAxis={{ label: "Altitude (km)" }}
    />
  );
}
```

### Orbital Period Display

```tsx
function OrbitalPeriod() {
  // Show times as orbit number + fraction
  const orbitalPeriod = 5400000; // 90 minutes in ms
  const epoch = 1704067200000; // T0

  const orbitFormatter = (timestamp: number) => {
    const elapsed = timestamp - epoch;
    const orbit = elapsed / orbitalPeriod;
    return `Orbit ${orbit.toFixed(2)}`;
  };

  return (
    <LineChart
      series={[{ name: "Battery Voltage", data: telemetry }]}
      xAxis={{
        label: "Orbit Number",
        formatter: orbitFormatter
      }}
    />
  );
}
```

## Important Notes

### 1. **Always Use UTC Timestamps Internally**

```tsx
// ✅ CORRECT - Store as UTC timestamp (ms since epoch)
const data = { x: Date.now(), y: value };

// ❌ WRONG - Don't store timezone-specific strings
const data = { x: "2024-01-01 00:00:00 EST", y: value };
```

### 2. **Timezone Conversions Happen at Display Time**

The chart stores all data as UTC timestamps (numbers). The `timezone` prop only affects **how the time is displayed** on the axis labels. Your underlying data remains timezone-agnostic.

### 3. **IANA Timezone Names**

Use full IANA timezone names (e.g., `"America/New_York"`), not abbreviations like "EST" which are ambiguous.

### 4. **Handling Invalid Timezones**

If an invalid timezone is provided, the chart automatically falls back to UTC:

```tsx
xAxis={{
  timezone: "Invalid/Timezone"  // Falls back to UTC
}}
```

## Real-World Example: Multi-Station Ground Network

```tsx
function GroundNetworkVisualization() {
  // Satellite pass times (stored as UTC timestamps)
  const passData = [
    { x: 1704067200000, y: 45 },
    { x: 1704067260000, y: 52 },
    { x: 1704067320000, y: 48 },
  ];

  // User can switch between station timezones
  const [selectedStation, setSelectedStation] = useState("UTC");

  const stationTimezones = {
    "Alaska": "America/Anchorage",
    "Hawaii": "Pacific/Honolulu",
    "Sweden": "Europe/Stockholm",
    "UTC": "UTC"
  };

  return (
    <div>
      <select onChange={(e) => setSelectedStation(e.target.value)}>
        {Object.keys(stationTimezones).map(station => (
          <option key={station} value={station}>{station}</option>
        ))}
      </select>

      <LineChart
        series={[{ name: "Signal Strength", data: passData }]}
        xAxis={{
          label: `Time (${selectedStation})`,
          type: "time",
          timezone: stationTimezones[selectedStation]
        }}
        yAxis={{ label: "Signal (dBm)" }}
      />
    </div>
  );
}
```

## API Reference

### Axis Configuration

```typescript
interface Axis {
  label?: string;           // Axis label text
  domain?: [number, number] | "auto";  // Value range
  type?: "number" | "time"; // Format type
  timezone?: string;        // IANA timezone (e.g., "UTC", "America/New_York")
  formatter?: (value: number) => string;  // Custom formatter
}
```

### Time Formatters

The chart includes built-in formatters:

- `formatTime(timestamp, timezone)` - Returns "HH:MM:SS" in specified timezone
- `formatDate(timestamp, timezone)` - Returns "Mon DD" in specified timezone
- `formatValue(number)` - Returns formatted numeric value (K, M suffixes)

## Best Practices

1. **Store times as UTC timestamps** (milliseconds since epoch)
2. **Use IANA timezone names** (full names, not abbreviations)
3. **Default to UTC** for scientific/space applications
4. **Label axes with timezone** so users know what they're seeing
5. **Test edge cases** like daylight saving time transitions
6. **Document assumptions** about timezone handling in your code

## Testing Different Timezones

```tsx
// Test data spanning DST transition
const testData = [
  { x: new Date("2024-03-10T01:00:00Z").getTime(), y: 10 },  // Before DST
  { x: new Date("2024-03-10T03:00:00Z").getTime(), y: 20 },  // After DST
];

// Verify both timezones display correctly
<LineChart
  series={[{ name: "Test", data: testData }]}
  xAxis={{
    type: "time",
    timezone: "America/New_York"  // Will show DST jump
  }}
/>
```
