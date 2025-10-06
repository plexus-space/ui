# @plexusui/gantt

Primitive-based Gantt chart component for aerospace and project timeline visualization.

## Installation

```bash
npm install @plexusui/gantt
```

## Features

- 🎯 **Primitive-based Architecture** - Compose your own timeline with root primitives
- ⚡ **Lightweight** - Zero dependencies beyond React
- 🎨 **Beautiful Design** - Modern dark theme perfect for aerospace UIs
- 🔧 **Fully Typed** - TypeScript support out of the box
- 📱 **Responsive** - Works on all screen sizes
- ♿ **Accessible** - Built with accessibility in mind
- 🌍 **Timezone Support** - Built-in timezone conversion and display
- 🖱️ **Pan & Zoom** - Seamless scrolling with mouse/touch pan and zoom
- ⌨️ **Keyboard & Wheel** - Navigate with arrow keys and mouse wheel
- 🎮 **Interactive Controls** - Navigation, zoom, and timezone controls built-in

## Quick Start

### Basic Gantt

```tsx
import { Gantt } from '@plexusui/gantt';

function App() {
  const groups = [
    {
      id: 'station-1',
      label: 'Ground Station Alpha',
      sublabel: 'Alaska',
      tasks: [
        {
          id: 'pass-1',
          label: 'ISS',
          startTime: Date.now() + 1000 * 60 * 30, // 30 min from now
          endTime: Date.now() + 1000 * 60 * 45,   // 45 min from now
          priority: 'high'
        }
      ]
    }
  ];

  return (
    <Gantt
      groups={groups}
      onTaskClick={(taskId) => console.log('Clicked:', taskId)}
    />
  );
}
```

### Enhanced Gantt with Controls

```tsx
import { GanttEnhanced } from '@plexusui/gantt';

function MissionTimeline() {
  return (
    <GanttEnhanced
      groups={groups}
      title="Mission Timeline"
      enablePan          // Drag to scroll
      enableWheel        // Mouse wheel scrolling
      showControls       // Show control bar
      showTimezone       // Timezone selector
      controlsConfig={{
        windowDuration: 24 * 60 * 60 * 1000, // 24 hours
        timezoneOffset: 0, // UTC
        navigationStep: 3600000, // 1 hour steps
      }}
    />
  );
}
```

## Architecture

This component follows the Plexus UI primitive-based architecture with three levels of abstraction:

### 1. Root Primitives

Build your own timeline with maximum control:

```tsx
import { GanttTimelineRoot, GanttHeaderRoot } from '@plexusui/gantt';

function CustomTimeline() {
  const timeWindowStart = Date.now();
  const timeWindowEnd = timeWindowStart + 12 * 60 * 60 * 1000; // 12 hours

  return (
    <div>
      <GanttHeaderRoot
        timeWindowStart={timeWindowStart}
        timeWindowEnd={timeWindowEnd}
        divisions={12}
      />
      <GanttTimelineRoot
        group={myGroup}
        timeWindowStart={timeWindowStart}
        timeWindowEnd={timeWindowEnd}
      />
    </div>
  );
}
```

### 2. Scene Primitives

Pre-styled container with header:

```tsx
import { GanttScene, GanttTimelineRoot } from '@plexusui/gantt';

function App() {
  return (
    <GanttScene title="Mission Timeline">
      {/* Your timeline rows */}
    </GanttScene>
  );
}
```

### 3. Composed Component

Ready to use with sensible defaults:

```tsx
import { Gantt } from '@plexusui/gantt';

<Gantt groups={groups} title="Satellite Passes" />
```

## API Reference

### Gantt Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groups` | `GanttGroup[]` | required | Array of groups containing tasks |
| `timeWindowStart` | `number` | `Date.now()` | Start of visible time window (Unix timestamp) |
| `timeWindowDuration` | `number` | `43200000` (12h) | Duration of time window in ms |
| `divisions` | `number` | `12` | Number of time divisions |
| `title` | `string` | `"Timeline"` | Chart title |
| `leftLabel` | `string` | `undefined` | Label for left column |
| `selectedTaskId` | `string` | `undefined` | Currently selected task ID |
| `onTaskClick` | `(taskId: string) => void` | `undefined` | Task click handler |
| `showCurrentTime` | `boolean` | `true` | Show current time marker |
| `controls` | `ReactNode` | `undefined` | Additional header controls |
| `formatTime` | `(timestamp: number) => string` | `HH:00` | Custom time formatter |
| `priorityColors` | `Record<string, string>` | See below | Priority color mapping |

### Default Priority Colors

```tsx
{
  critical: "bg-red-500",
  high: "bg-yellow-500",
  medium: "bg-green-500",
  low: "bg-blue-500"
}
```

### GanttGroup Type

```tsx
interface GanttGroup {
  id: string;
  label: string;
  sublabel?: string;
  tasks: GanttTask[];
}
```

### GanttTask Type

```tsx
interface GanttTask {
  id: string;
  label: string;
  sublabel?: string;
  startTime: number; // Unix timestamp
  endTime: number;   // Unix timestamp
  color?: string;    // Custom Tailwind class
  priority?: "critical" | "high" | "medium" | "low";
  metadata?: Record<string, any>;
}
```

## Interactive Controls

### Mouse & Touch Interactions

- **Pan/Drag**: Click and drag on the timeline to pan through time
- **Mouse Wheel**: Scroll to move horizontally through time
- **Shift + Wheel**: Hold Shift and scroll to zoom in/out
- **Touch**: Swipe to pan on mobile devices

### Control Buttons

When `showControls` is enabled:

- **← / →**: Navigate backward/forward by configured step (default: 1 hour)
- **NOW**: Jump to current time
- **+ / -**: Zoom in/out
- **Timezone Selector**: Change timezone display

### Using the Controls Hook

```tsx
import { useGanttControls, Gantt, GanttControlBar } from '@plexusui/gantt';

function CustomControls() {
  const controls = useGanttControls({
    windowDuration: 12 * 60 * 60 * 1000,
    timezoneOffset: -5, // EST
    navigationStep: 3600000, // 1 hour
  });

  return (
    <div>
      <GanttControlBar controls={controls} />

      <Gantt
        groups={groups}
        timeWindowStart={controls.windowStart}
        timeWindowDuration={controls.windowDuration}
      />
    </div>
  );
}
```

## Utilities

The package exports helpful utilities:

```tsx
import { GanttUtils } from '@plexusui/gantt';

// Get time window
const { start, end } = GanttUtils.getTimeWindow(12 * 60 * 60 * 1000);

// Format timestamps
GanttUtils.formatHHMM(Date.now());      // "14:30"
GanttUtils.formatDate(Date.now());       // "1/15/2025"
GanttUtils.formatDateTime(Date.now());   // "1/15/2025, 2:30 PM"
GanttUtils.formatWithTimezone(Date.now(), -5); // With timezone offset
```

## Examples

### Aerospace Ground Station Passes

```tsx
const groups = [
  {
    id: 'alaska',
    label: 'Alaska Ground Station',
    sublabel: 'Fairbanks',
    tasks: [
      {
        id: 'iss-1',
        label: 'ISS',
        startTime: Date.now() + 1800000,
        endTime: Date.now() + 2700000,
        priority: 'critical'
      }
    ]
  }
];

<Gantt groups={groups} title="Satellite Passes" />
```

### Custom Time Formatting

```tsx
<Gantt
  groups={groups}
  formatTime={(ts) => new Date(ts).toLocaleTimeString()}
/>
```

### With Controls

```tsx
<Gantt
  groups={groups}
  controls={
    <div className="flex gap-2">
      <button className="px-2 py-1 bg-gray-800 rounded text-xs">
        Export
      </button>
    </div>
  }
/>
```

## Styling

This component uses Tailwind CSS classes. Ensure Tailwind is configured in your project:

```js
// tailwind.config.js
module.exports = {
  content: [
    './node_modules/@plexusui/gantt/**/*.{js,jsx}',
    // ... your content paths
  ],
}
```

## License

MIT
