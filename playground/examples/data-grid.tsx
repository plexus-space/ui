"use client";

import { useState } from "react";
import { DataGrid } from "@plexusui/components/charts/data-grid";
import type { Column } from "@plexusui/components/charts/data-grid";
import { ComponentPreview } from "@/components/component-preview";

// Generate large dataset for performance testing
function generateTelemetryData(count: number) {
  const data: Record<string, unknown>[] = [];
  const statuses = ["nominal", "warning", "critical", "offline"];
  const systems = [
    "Propulsion",
    "Navigation",
    "Life Support",
    "Comms",
    "Power",
  ];

  for (let i = 0; i < count; i++) {
    data.push({
      id: `TLM-${String(i).padStart(6, "0")}`,
      timestamp: Date.now() - i * 1000,
      system: systems[i % systems.length],
      parameter: `Sensor ${i % 50}`,
      value: (Math.random() * 1000).toFixed(2),
      unit: ["°C", "kPa", "V", "A", "RPM"][i % 5],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      delta: ((Math.random() - 0.5) * 20).toFixed(2),
    });
  }

  return data;
}

function generateFlightData(count: number) {
  const data: Record<string, unknown>[] = [];
  const airlines = ["UA", "AA", "DL", "WN", "B6"];
  const statuses = ["On Time", "Delayed", "Boarding", "Departed", "Arrived"];

  for (let i = 0; i < count; i++) {
    const flightNum = Math.floor(Math.random() * 9999);
    data.push({
      flight: `${airlines[i % airlines.length]}${flightNum}`,
      origin: ["LAX", "JFK", "ORD", "DFW", "ATL"][i % 5],
      destination: ["SFO", "BOS", "MIA", "SEA", "DEN"][i % 5],
      departure: new Date(Date.now() + i * 300000).toLocaleTimeString(),
      arrival: new Date(Date.now() + i * 300000 + 7200000).toLocaleTimeString(),
      gate: `${String.fromCharCode(65 + (i % 4))}${(i % 20) + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      aircraft: ["A320", "B737", "A321", "B777", "A350"][i % 5],
    });
  }

  return data;
}

function LargeTelemetryGrid() {
  const telemetryData = generateTelemetryData(100000);

  const columns: Column[] = [
    { id: "id", label: "ID", width: 120, alignment: "left" },
    {
      id: "timestamp",
      label: "Timestamp",
      width: 180,
      alignment: "left",
      formatter: (val) => new Date(val as number).toLocaleTimeString(),
    },
    { id: "system", label: "System", width: 140, alignment: "left" },
    { id: "parameter", label: "Parameter", width: 160, alignment: "left" },
    {
      id: "value",
      label: "Value",
      width: 100,
      alignment: "right",
      type: "number",
    },
    { id: "unit", label: "Unit", width: 80, alignment: "center" },
    { id: "status", label: "Status", width: 100, alignment: "center" },
    {
      id: "delta",
      label: "Δ",
      width: 100,
      alignment: "right",
      type: "number",
      formatter: (val) => {
        const num = Number(val);
        return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
      },
    },
  ];

  return (
    <ComponentPreview
      title="100K Row Telemetry Grid"
      description="GPU-accelerated data grid with virtual scrolling. Handles 100,000 rows at 60fps with smooth scrolling and hover effects."
      code={`const columns: Column[] = [
  { id: "id", label: "ID", width: 120 },
  {
    id: "timestamp",
    label: "Timestamp",
    width: 180,
    formatter: (val) => new Date(val as number).toLocaleTimeString()
  },
  { id: "system", label: "System", width: 140 },
  { id: "parameter", label: "Parameter", width: 160 },
  { id: "value", label: "Value", width: 100, alignment: "right" },
  { id: "unit", label: "Unit", width: 80, alignment: "center" },
  { id: "status", label: "Status", width: 100 },
];

<DataGrid
  columns={columns}
  data={telemetryData} // 100,000 rows
  width={1200}
  height={600}
  virtualScrolling={true}
  alternateRows={true}
  highlightOnHover={true}
/>`}
      preview={
        <div className="w-full p-4">
          <DataGrid
            columns={columns}
            data={telemetryData}
            width={1200}
            height={600}
            virtualScrolling={true}
            alternateRows={true}
            highlightOnHover={true}
          />
        </div>
      }
    />
  );
}

function FlightDashboard() {
  const flightData = generateFlightData(5000);

  const columns: Column[] = [
    { id: "flight", label: "Flight", width: 100, alignment: "left" },
    { id: "origin", label: "Origin", width: 100, alignment: "center" },
    {
      id: "destination",
      label: "Destination",
      width: 100,
      alignment: "center",
    },
    { id: "departure", label: "Departure", width: 120, alignment: "left" },
    { id: "arrival", label: "Arrival", width: 120, alignment: "left" },
    { id: "gate", label: "Gate", width: 80, alignment: "center" },
    { id: "status", label: "Status", width: 120, alignment: "center" },
    { id: "aircraft", label: "Aircraft", width: 100, alignment: "center" },
  ];

  return (
    <ComponentPreview
      title="Flight Operations Dashboard"
      description="Interactive data grid with 5,000 flights. Click any row to view details. Real-time hover highlighting and smooth scrolling."
      code={`const [selectedFlight, setSelectedFlight] = useState(null);

<DataGrid
  columns={columns}
  data={flightData} // 5,000 rows
  width={1000}
  height={500}
  onRowClick={(row) => setSelectedFlight(row)}
  virtualScrolling={true}
/>

{selectedFlight && (
  <div className="p-4 mt-4 bg-zinc-900 rounded">
    <h3>Selected: {selectedFlight.flight}</h3>
    <p>{selectedFlight.origin} → {selectedFlight.destination}</p>
  </div>
)}`}
      preview={
        <div className="w-full p-4 space-y-4">
          <DataGrid
            columns={columns}
            data={flightData}
            width={1000}
            height={500}
            onRowClick={() => {}}
            virtualScrolling={true}
            alternateRows={true}
            highlightOnHover={true}
          />
        </div>
      }
    />
  );
}

function CompactSensorGrid() {
  const sensorData = generateTelemetryData(1000).slice(0, 1000);

  const columns: Column[] = [
    { id: "id", label: "Sensor ID", width: 140 },
    { id: "system", label: "System", width: 140 },
    { id: "value", label: "Value", width: 120, alignment: "right" },
    { id: "unit", label: "Unit", width: 100, alignment: "center" },
    { id: "status", label: "Status", width: 120, alignment: "center" },
  ];

  return (
    <ComponentPreview
      title="Compact Sensor Monitor"
      description="Dense data grid with 1,000 sensors. Smaller row height for maximum information density. Perfect for embedded control panels."
      code={`<DataGrid
  columns={columns}
  data={sensorData}
  width={700}
  height={400}
  rowHeight={32}
  headerHeight={40}
  alternateRows={false}
  virtualScrolling={true}
/>`}
      preview={
        <div className="w-full p-4">
          <DataGrid
            columns={columns}
            data={sensorData}
            width={700}
            height={400}
            rowHeight={32}
            headerHeight={40}
            alternateRows={false}
            virtualScrolling={true}
            highlightOnHover={true}
          />
        </div>
      }
    />
  );
}

export function DataGridExamples() {
  return (
    <div className="space-y-8">
      <LargeTelemetryGrid />
      <FlightDashboard />
      <CompactSensorGrid />
    </div>
  );
}
