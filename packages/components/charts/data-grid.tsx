"use client";

import { createContext, useContext, useRef, useEffect, useState } from "react";
import {
  createWebGLRenderer,
  ChartRoot,
  hexToRgb,
  type RendererProps,
  type WebGLRenderer,
  useBaseChart,
} from "./base-chart";

// ============================================================================
// DataGrid Types
// ============================================================================

export type ColumnAlignment = "left" | "center" | "right";
export type ColumnType = "text" | "number" | "status" | "timestamp";

export interface Column {
  id: string;
  label: string;
  width?: number;
  alignment?: ColumnAlignment;
  type?: ColumnType;
  formatter?: (value: unknown) => string;
}

export interface DataGridProps {
  columns: Column[];
  data: Record<string, unknown>[];
  width?: number;
  height?: number;
  rowHeight?: number;
  headerHeight?: number;
  showHeader?: boolean;
  alternateRows?: boolean;
  highlightOnHover?: boolean;
  virtualScrolling?: boolean;
  className?: string;
  preferWebGPU?: boolean;
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
}

interface DataGridContextType {
  columns: Column[];
  data: Record<string, unknown>[];
  rowHeight: number;
  headerHeight: number;
  showHeader: boolean;
  alternateRows: boolean;
  highlightOnHover: boolean;
  virtualScrolling: boolean;
  scrollTop: number;
  setScrollTop: (value: number) => void;
  hoveredRow: number | null;
  setHoveredRow: (index: number | null) => void;
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
}

const DataGridContext = createContext<DataGridContextType | null>(null);

function useDataGridData() {
  const ctx = useContext(DataGridContext);
  if (!ctx) {
    throw new Error("DataGrid components must be used within DataGrid.Root");
  }
  return ctx;
}

function useDataGrid() {
  const baseCtx = useBaseChart();
  const gridCtx = useDataGridData();
  return { ...baseCtx, ...gridCtx };
}

// ============================================================================
// Shaders
// ============================================================================

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec4 a_color;

uniform vec2 u_resolution;
uniform mat3 u_matrix;

varying vec4 v_color;

void main() {
  vec2 position = (u_matrix * vec3(a_position, 1.0)).xy;
  vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
  clipSpace.y *= -1.0;

  gl_Position = vec4(clipSpace, 0.0, 1.0);
  v_color = a_color;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

// ============================================================================
// DataGrid Renderer
// ============================================================================

interface DataGridRendererProps extends RendererProps {
  columns: Column[];
  data: Record<string, unknown>[];
  rowHeight: number;
  headerHeight: number;
  showHeader: boolean;
  alternateRows: boolean;
  scrollTop: number;
  hoveredRow: number | null;
}

function createWebGLDataGridRenderer(
  canvas: HTMLCanvasElement
): WebGLRenderer<DataGridRendererProps> {
  const buffers = {
    position: null as WebGLBuffer | null,
    color: null as WebGLBuffer | null,
  };

  const renderer = createWebGLRenderer<DataGridRendererProps>({
    canvas,
    createShaders: () => ({
      vertexSource: VERTEX_SHADER,
      fragmentSource: FRAGMENT_SHADER,
    }),
    onRender: (gl, program, props) => {
      const {
        columns,
        data,
        rowHeight,
        headerHeight,
        showHeader,
        alternateRows,
        scrollTop,
        hoveredRow,
        width,
        height,
        margin,
      } = props;

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const matrix = [1, 0, 0, 0, 1, 0, margin.left, margin.top, 1];

      gl.useProgram(program);
      gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), width, height);
      gl.uniformMatrix3fv(gl.getUniformLocation(program, "u_matrix"), false, matrix);

      const positions: number[] = [];
      const colors: number[] = [];

      // Calculate column widths
      const totalWidth = innerWidth;
      const colWidths = columns.map((col) => col.width || totalWidth / columns.length);

      // Background colors
      const headerBg = hexToRgb("#18181b");
      const rowBg1 = hexToRgb("#09090b");
      const rowBg2 = hexToRgb("#0f0f12");
      const hoverBg = hexToRgb("#27272a");
      const gridLine = hexToRgb("#27272a");

      let yOffset = 0;

      // Draw header background
      if (showHeader) {
        const x1 = 0;
        const y1 = yOffset;
        const x2 = innerWidth;
        const y2 = yOffset + headerHeight;

        // Header rect (2 triangles)
        positions.push(x1, y1, x2, y1, x1, y2);
        positions.push(x2, y1, x2, y2, x1, y2);
        for (let i = 0; i < 6; i++) {
          colors.push(...headerBg, 1);
        }

        // Header bottom border
        positions.push(x1, y2, x2, y2);
        colors.push(...gridLine, 0.5, ...gridLine, 0.5);

        yOffset += headerHeight;
      }

      // Calculate visible rows for virtual scrolling
      const startRow = Math.floor(scrollTop / rowHeight);
      const endRow = Math.min(
        data.length,
        Math.ceil((scrollTop + innerHeight - yOffset) / rowHeight) + 1
      );

      // Draw visible rows
      for (let i = startRow; i < endRow; i++) {
        const y1 = yOffset + i * rowHeight - scrollTop;
        const y2 = y1 + rowHeight;

        // Skip if row is not visible
        if (y2 < yOffset || y1 > innerHeight) continue;

        // Row background
        const isHovered = i === hoveredRow;
        const bgColor = isHovered ? hoverBg : alternateRows && i % 2 === 0 ? rowBg1 : rowBg2;

        positions.push(0, y1, innerWidth, y1, 0, y2);
        positions.push(innerWidth, y1, innerWidth, y2, 0, y2);
        for (let j = 0; j < 6; j++) {
          colors.push(...bgColor, 1);
        }

        // Row bottom border
        positions.push(0, y2, innerWidth, y2);
        colors.push(...gridLine, 0.3, ...gridLine, 0.3);
      }

      // Draw column separators
      let xOffset = 0;
      for (let i = 0; i < columns.length - 1; i++) {
        xOffset += colWidths[i];
        const y1 = 0;
        const y2 = innerHeight;

        positions.push(xOffset, y1, xOffset, y2);
        colors.push(...gridLine, 0.3, ...gridLine, 0.3);
      }

      // Upload data to GPU
      if (!buffers.position) {
        buffers.position = gl.createBuffer();
      }
      if (!buffers.color) {
        buffers.color = gl.createBuffer();
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
      const posLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
      const colorLoc = gl.getAttribLocation(program, "a_color");
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

      // Draw triangles for filled rects
      const triangleCount = positions.length / 2 - (colors.length / 4 - positions.length / 2);
      gl.drawArrays(gl.TRIANGLES, 0, triangleCount);

      // Draw lines for borders
      gl.drawArrays(gl.LINES, triangleCount, positions.length / 2 - triangleCount);
    },
  });

  return renderer;
}

// ============================================================================
// Root Component
// ============================================================================

interface RootProps extends DataGridProps {
  children: React.ReactNode;
}

function Root({
  children,
  columns,
  data,
  width = 1000,
  height = 600,
  rowHeight = 40,
  headerHeight = 48,
  showHeader = true,
  alternateRows = true,
  highlightOnHover = true,
  virtualScrolling = true,
  preferWebGPU = false,
  className,
  onRowClick,
}: RootProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const gridData: DataGridContextType = {
    columns,
    data,
    rowHeight,
    headerHeight,
    showHeader,
    alternateRows,
    highlightOnHover,
    virtualScrolling,
    scrollTop,
    setScrollTop,
    hoveredRow,
    setHoveredRow,
    onRowClick,
  };

  return (
    <DataGridContext.Provider value={gridData}>
      <ChartRoot
        width={width}
        height={height}
        preferWebGPU={preferWebGPU}
        className={className}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        {children}
      </ChartRoot>
    </DataGridContext.Provider>
  );
}

// ============================================================================
// Canvas Component
// ============================================================================

function Canvas() {
  const ctx = useDataGrid();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer<DataGridRendererProps> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = ctx.width * dpr;
    canvas.height = ctx.height * dpr;
    canvas.style.width = `${ctx.width}px`;
    canvas.style.height = `${ctx.height}px`;

    if (!rendererRef.current) {
      rendererRef.current = createWebGLDataGridRenderer(canvas);
    }

    const props: DataGridRendererProps = {
      canvas,
      columns: ctx.columns,
      data: ctx.data,
      rowHeight: ctx.rowHeight,
      headerHeight: ctx.headerHeight,
      showHeader: ctx.showHeader,
      alternateRows: ctx.alternateRows,
      scrollTop: ctx.scrollTop,
      hoveredRow: ctx.hoveredRow,
      width: canvas.width,
      height: canvas.height,
      margin: ctx.margin,
      xDomain: [0, 1],
      yDomain: [0, 1],
      xTicks: [],
      yTicks: [],
      showGrid: false,
    };

    rendererRef.current.render(props);
  }, [ctx]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ============================================================================
// Header Component
// ============================================================================

function Header() {
  const ctx = useDataGrid();

  if (!ctx.showHeader) return null;

  const totalWidth = ctx.width;
  const colWidths = ctx.columns.map((col) => col.width || totalWidth / ctx.columns.length);

  let xOffset = 0;

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center border-b border-zinc-800"
      style={{ height: ctx.headerHeight }}
    >
      {ctx.columns.map((col, i) => {
        const width = colWidths[i];
        const element = (
          <div
            key={col.id}
            className="flex items-center px-4 text-sm font-semibold text-zinc-400 border-r border-zinc-800 last:border-r-0"
            style={{
              width,
              textAlign: col.alignment || "left",
            }}
          >
            {col.label}
          </div>
        );
        xOffset += width;
        return element;
      })}
    </div>
  );
}

// ============================================================================
// Cells Component
// ============================================================================

function Cells() {
  const ctx = useDataGrid();
  const containerRef = useRef<HTMLDivElement>(null);

  const totalWidth = ctx.width;
  const colWidths = ctx.columns.map((col) => col.width || totalWidth / ctx.columns.length);

  const yOffset = ctx.showHeader ? ctx.headerHeight : 0;
  const visibleHeight = ctx.height - yOffset;

  // Calculate visible rows for virtual scrolling
  const startRow = Math.floor(ctx.scrollTop / ctx.rowHeight);
  const endRow = Math.min(
    ctx.data.length,
    Math.ceil((ctx.scrollTop + visibleHeight) / ctx.rowHeight) + 1
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    ctx.setScrollTop(e.currentTarget.scrollTop);
  };

  const formatValue = (col: Column, value: unknown): string => {
    if (col.formatter) return col.formatter(value);
    if (value === null || value === undefined) return "-";
    return String(value);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-auto"
      style={{
        top: yOffset,
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: ctx.data.length * ctx.rowHeight }}>
        {ctx.virtualScrolling
          ? ctx.data.slice(startRow, endRow).map((row, idx) => {
              const actualIdx = startRow + idx;
              return (
                <div
                  key={actualIdx}
                  className="absolute left-0 right-0 flex items-center cursor-pointer"
                  style={{
                    height: ctx.rowHeight,
                    top: actualIdx * ctx.rowHeight,
                  }}
                  onMouseEnter={() => ctx.highlightOnHover && ctx.setHoveredRow(actualIdx)}
                  onMouseLeave={() => ctx.highlightOnHover && ctx.setHoveredRow(null)}
                  onClick={() => ctx.onRowClick?.(row, actualIdx)}
                >
                  {ctx.columns.map((col, colIdx) => {
                    const value = row[col.id];
                    return (
                      <div
                        key={col.id}
                        className="flex items-center px-4 text-sm text-zinc-300 border-r border-zinc-800/30 last:border-r-0"
                        style={{
                          width: colWidths[colIdx],
                          textAlign: col.alignment || "left",
                        }}
                      >
                        {formatValue(col, value)}
                      </div>
                    );
                  })}
                </div>
              );
            })
          : ctx.data.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center cursor-pointer"
                style={{
                  height: ctx.rowHeight,
                }}
                onMouseEnter={() => ctx.highlightOnHover && ctx.setHoveredRow(idx)}
                onMouseLeave={() => ctx.highlightOnHover && ctx.setHoveredRow(null)}
                onClick={() => ctx.onRowClick?.(row, idx)}
              >
                {ctx.columns.map((col, colIdx) => {
                  const value = row[col.id];
                  return (
                    <div
                      key={col.id}
                      className="flex items-center px-4 text-sm text-zinc-300 border-r border-zinc-800/30 last:border-r-0"
                      style={{
                        width: colWidths[colIdx],
                        textAlign: col.alignment || "left",
                      }}
                    >
                      {formatValue(col, value)}
                    </div>
                  );
                })}
              </div>
            ))}
      </div>
    </div>
  );
}

// ============================================================================
// Composed Component
// ============================================================================

export function DataGrid({
  columns,
  data,
  width = 1000,
  height = 600,
  rowHeight = 40,
  headerHeight = 48,
  showHeader = true,
  alternateRows = true,
  highlightOnHover = true,
  virtualScrolling = true,
  preferWebGPU = false,
  className,
  onRowClick,
}: DataGridProps) {
  return (
    <Root
      columns={columns}
      data={data}
      width={width}
      height={height}
      rowHeight={rowHeight}
      headerHeight={headerHeight}
      showHeader={showHeader}
      alternateRows={alternateRows}
      highlightOnHover={highlightOnHover}
      virtualScrolling={virtualScrolling}
      preferWebGPU={preferWebGPU}
      className={className}
      onRowClick={onRowClick}
    >
      <Canvas />
      <Header />
      <Cells />
    </Root>
  );
}

DataGrid.Root = Root;
DataGrid.Canvas = Canvas;
DataGrid.Header = Header;
DataGrid.Cells = Cells;

export default DataGrid;
