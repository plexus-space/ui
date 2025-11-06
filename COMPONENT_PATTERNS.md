# Plexus UI Component Patterns

All Plexus UI chart components follow a **dual-API pattern** for maximum flexibility:

## 1. Simple All-in-One API (Recommended for most use cases)

The easiest way to use components - just pass props!

### Waveform Monitor
```tsx
import { WaveformMonitor } from '@/components/plexusui/charts/waveform-monitor';

<WaveformMonitor
  width={800}
  height={400}
  traces={traces}
  xDomain={[0, 10]}
  yDomain={[-1, 1]}
/>
```

### Gantt Chart
```tsx
import { GanttChart } from '@/components/plexusui/charts/gantt-chart';

<GanttChart
  tasks={tasks}
  timeWindowHours={12}
  timezone="UTC"
/>
```

## 2. Composable Primitives API (Advanced customization)

For full control over layout and composition:

### Waveform Monitor
```tsx
import { WaveformMonitor } from '@/components/plexusui/charts/waveform-monitor';

<WaveformMonitor.Root width={800} height={400} traces={traces}>
  <WaveformMonitor.Container>
    <WaveformMonitor.Canvas />
    <WaveformMonitor.Traces />
    <WaveformMonitor.Overlay>
      <WaveformMonitor.Metrics />
    </WaveformMonitor.Overlay>
  </WaveformMonitor.Container>
</WaveformMonitor.Root>
```

### Gantt Chart
```tsx
import { GanttChart } from '@/components/plexusui/charts/gantt-chart';

<GanttChart.Root tasks={tasks} timezone="UTC">
  <GanttChart.Controls />
  <GanttChart.Container>
    <GanttChart.Viewport>
      <GanttChart.Grid />
      <GanttChart.Header />
      <GanttChart.Tasks />
      <GanttChart.CurrentTime />
    </GanttChart.Viewport>
    <GanttChart.LeftPanel />
  </GanttChart.Container>
</GanttChart.Root>
```

## When to Use Each Pattern

### Use Simple API when:
- You need standard functionality
- You want the fastest setup
- You don't need custom layout

### Use Composable API when:
- You need custom component ordering
- You want to add custom elements between primitives
- You're building a custom wrapper
- You need fine-grained control over rendering

## Consistency with shadcn

This dual-API pattern matches shadcn's philosophy:
- **Simple by default**: Works out of the box with minimal props
- **Composable when needed**: Full primitive access for customization
- **Copy-paste friendly**: All source code is in your project
- **TypeScript-first**: Full type safety for both patterns
