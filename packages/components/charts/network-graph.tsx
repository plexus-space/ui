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
// Network Graph Types
// ============================================================================

export type NodeShape = "circle" | "square" | "diamond" | "triangle";
export type NodeStatus = "operational" | "degraded" | "failed" | "offline" | "unknown";
export type EdgeStyle = "solid" | "dashed" | "dotted";

export interface NetworkNode {
  id: string;
  label?: string;
  x?: number; // Optional fixed position
  y?: number; // Optional fixed position
  size?: number;
  shape?: NodeShape;
  status?: NodeStatus;
  color?: string;
  group?: string;
  metadata?: Record<string, any>;
}

export interface NetworkEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  label?: string;
  weight?: number; // Line thickness
  style?: EdgeStyle;
  color?: string;
  directed?: boolean; // Show arrow
  metadata?: Record<string, any>;
}

export interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width?: number;
  height?: number;
  layout?: "force" | "custom"; // force-directed or use provided x,y
  interactive?: boolean; // Enable pan/zoom
  showLabels?: boolean;
  nodeSize?: number; // Default node size
  edgeWidth?: number; // Default edge width
  className?: string;
  preferWebGPU?: boolean;
}

interface NetworkGraphContextType {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  layout: "force" | "custom";
  interactive: boolean;
  showLabels: boolean;
  nodeSize: number;
  edgeWidth: number;
  zoom: number;
  panX: number;
  panY: number;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
}

const NetworkGraphContext = createContext<NetworkGraphContextType | null>(null);

function useNetworkGraphData() {
  const ctx = useContext(NetworkGraphContext);
  if (!ctx) {
    throw new Error("NetworkGraph components must be used within NetworkGraph.Root");
  }
  return ctx;
}

function useNetworkGraph() {
  const baseCtx = useBaseChart();
  const networkCtx = useNetworkGraphData();
  return { ...baseCtx, ...networkCtx };
}

// ============================================================================
// Layout Algorithm (Simple Force-Directed)
// ============================================================================

interface LayoutNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number; // Fixed x
  fy?: number; // Fixed y
}

function applyForceLayout(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  width: number,
  height: number,
  iterations: number = 100
): LayoutNode[] {
  // Initialize nodes with random positions if not provided
  const layoutNodes: LayoutNode[] = nodes.map((node) => ({
    ...node,
    x: node.x ?? Math.random() * width,
    y: node.y ?? Math.random() * height,
    vx: 0,
    vy: 0,
    fx: node.x,
    fy: node.y,
  }));

  // Create node lookup
  const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

  // Simple force-directed algorithm
  const k = Math.sqrt((width * height) / layoutNodes.length); // Ideal spring length
  const iterations_per_frame = iterations;

  for (let iter = 0; iter < iterations_per_frame; iter++) {
    // Repulsive forces between all nodes (Coulomb's law)
    for (let i = 0; i < layoutNodes.length; i++) {
      const nodeA = layoutNodes[i];
      if (nodeA.fx !== undefined && nodeA.fy !== undefined) continue; // Skip fixed nodes

      for (let j = i + 1; j < layoutNodes.length; j++) {
        const nodeB = layoutNodes[j];
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = (k * k) / dist;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        nodeA.vx -= fx;
        nodeA.vy -= fy;

        if (nodeB.fx === undefined || nodeB.fy === undefined) {
          nodeB.vx += fx;
          nodeB.vy += fy;
        }
      }
    }

    // Attractive forces for connected nodes (Hooke's law)
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);

      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const force = (dist * dist) / k;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (source.fx === undefined || source.fy === undefined) {
        source.vx += fx * 0.5;
        source.vy += fy * 0.5;
      }

      if (target.fx === undefined || target.fy === undefined) {
        target.vx -= fx * 0.5;
        target.vy -= fy * 0.5;
      }
    }

    // Update positions
    for (const node of layoutNodes) {
      if (node.fx !== undefined && node.fy !== undefined) {
        node.x = node.fx;
        node.y = node.fy;
        continue;
      }

      // Apply velocity with damping
      node.x += node.vx * 0.1;
      node.y += node.vy * 0.1;
      node.vx *= 0.9;
      node.vy *= 0.9;

      // Keep nodes within bounds
      const margin = 50;
      node.x = Math.max(margin, Math.min(width - margin, node.x));
      node.y = Math.max(margin, Math.min(height - margin, node.y));
    }
  }

  return layoutNodes;
}

// ============================================================================
// Shaders
// ============================================================================

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec4 a_color;

uniform vec2 u_resolution;
uniform vec2 u_pan;
uniform float u_zoom;

varying vec4 v_color;

void main() {
  vec2 position = (a_position + u_pan) * u_zoom;
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
// Geometry Helpers
// ============================================================================

const STATUS_COLORS: Record<NodeStatus, string> = {
  operational: "#10b981",
  degraded: "#f59e0b",
  failed: "#ef4444",
  offline: "#6b7280",
  unknown: "#3b82f6",
};

function createCircleNode(
  x: number,
  y: number,
  size: number,
  color: [number, number, number],
  alpha: number = 1
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const segments = 16;
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;

    const x1 = x + size * Math.cos(a1);
    const y1 = y + size * Math.sin(a1);
    const x2 = x + size * Math.cos(a2);
    const y2 = y + size * Math.sin(a2);

    positions.push(x, y, x1, y1, x2, y2);
    colors.push(...color, alpha, ...color, alpha, ...color, alpha);
  }

  return { positions, colors };
}

function createSquareNode(
  x: number,
  y: number,
  size: number,
  color: [number, number, number],
  alpha: number = 1
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const half = size;

  positions.push(x - half, y - half, x + half, y - half, x + half, y + half);
  positions.push(x - half, y - half, x + half, y + half, x - half, y + half);

  for (let i = 0; i < 6; i++) {
    colors.push(...color, alpha);
  }

  return { positions, colors };
}

function createDiamondNode(
  x: number,
  y: number,
  size: number,
  color: [number, number, number],
  alpha: number = 1
) {
  const positions: number[] = [];
  const colors: number[] = [];

  positions.push(x, y - size, x + size, y, x, y + size);
  positions.push(x - size, y, x, y - size, x, y + size);

  for (let i = 0; i < 6; i++) {
    colors.push(...color, alpha);
  }

  return { positions, colors };
}

function createTriangleNode(
  x: number,
  y: number,
  size: number,
  color: [number, number, number],
  alpha: number = 1
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const height = size * Math.sqrt(3);

  positions.push(x, y - height * 0.66, x + size, y + height * 0.33, x - size, y + height * 0.33);

  for (let i = 0; i < 3; i++) {
    colors.push(...color, alpha);
  }

  return { positions, colors };
}

function createEdge(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  color: [number, number, number],
  alpha: number = 1,
  directed: boolean = false,
  style: EdgeStyle = "solid"
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;

  const halfWidth = width / 2;

  // Line segment
  if (style === "solid" || style === "dashed") {
    positions.push(
      x1 + nx * halfWidth,
      y1 + ny * halfWidth,
      x2 + nx * halfWidth,
      y2 + ny * halfWidth,
      x1 - nx * halfWidth,
      y1 - ny * halfWidth
    );
    positions.push(
      x2 + nx * halfWidth,
      y2 + ny * halfWidth,
      x2 - nx * halfWidth,
      y2 - ny * halfWidth,
      x1 - nx * halfWidth,
      y1 - ny * halfWidth
    );

    const edgeAlpha = style === "dashed" ? alpha * 0.5 : alpha;
    for (let i = 0; i < 6; i++) {
      colors.push(...color, edgeAlpha);
    }
  }

  // Arrow head if directed
  if (directed) {
    const arrowSize = 8;
    const arrowAngle = Math.atan2(dy, dx);

    const tipX = x2 - Math.cos(arrowAngle) * 15; // Offset from target node
    const tipY = y2 - Math.sin(arrowAngle) * 15;

    const p1x = tipX + arrowSize * Math.cos(arrowAngle);
    const p1y = tipY + arrowSize * Math.sin(arrowAngle);

    const p2x = tipX + (arrowSize / 2) * Math.cos(arrowAngle + Math.PI / 2);
    const p2y = tipY + (arrowSize / 2) * Math.sin(arrowAngle + Math.PI / 2);

    const p3x = tipX + (arrowSize / 2) * Math.cos(arrowAngle - Math.PI / 2);
    const p3y = tipY + (arrowSize / 2) * Math.sin(arrowAngle - Math.PI / 2);

    positions.push(p1x, p1y, p2x, p2y, p3x, p3y);
    colors.push(...color, alpha, ...color, alpha, ...color, alpha);
  }

  return { positions, colors };
}

// ============================================================================
// Renderer
// ============================================================================

interface NetworkRendererProps extends RendererProps {
  layoutNodes: LayoutNode[];
  edges: NetworkEdge[];
  nodeSize: number;
  edgeWidth: number;
  zoom: number;
  panX: number;
  panY: number;
}

function createWebGLNetworkRenderer(
  canvas: HTMLCanvasElement
): WebGLRenderer<NetworkRendererProps> {
  const buffers = {
    position: null as WebGLBuffer | null,
    color: null as WebGLBuffer | null,
  };

  const renderer = createWebGLRenderer<NetworkRendererProps>({
    canvas,
    createShaders: () => ({
      vertexSource: VERTEX_SHADER,
      fragmentSource: FRAGMENT_SHADER,
    }),
    onRender: (gl, program, props) => {
      const { layoutNodes, edges, nodeSize, edgeWidth, zoom, panX, panY, width, height } = props;

      gl.useProgram(program);

      const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(resolutionLoc, width, height);

      const zoomLoc = gl.getUniformLocation(program, "u_zoom");
      gl.uniform1f(zoomLoc, zoom);

      const panLoc = gl.getUniformLocation(program, "u_pan");
      gl.uniform2f(panLoc, panX, panY);

      let allPositions: number[] = [];
      let allColors: number[] = [];

      // Create node lookup
      const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

      // Draw edges first (behind nodes)
      for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);

        if (!source || !target) continue;

        const edgeColor = edge.color ? hexToRgb(edge.color) : hexToRgb("#64748b");
        const width = edge.weight ?? edgeWidth;
        const directed = edge.directed ?? false;
        const style = edge.style ?? "solid";

        const geom = createEdge(
          source.x,
          source.y,
          target.x,
          target.y,
          width,
          edgeColor,
          0.6,
          directed,
          style
        );

        allPositions.push(...geom.positions);
        allColors.push(...geom.colors);
      }

      // Draw nodes
      for (const node of layoutNodes) {
        const status = node.status ?? "unknown";
        const nodeColor = node.color ? hexToRgb(node.color) : hexToRgb(STATUS_COLORS[status]);
        const size = node.size ?? nodeSize;
        const shape = node.shape ?? "circle";

        let geom: { positions: number[]; colors: number[] };

        switch (shape) {
          case "circle":
            geom = createCircleNode(node.x, node.y, size, nodeColor, 1);
            break;
          case "square":
            geom = createSquareNode(node.x, node.y, size, nodeColor, 1);
            break;
          case "diamond":
            geom = createDiamondNode(node.x, node.y, size, nodeColor, 1);
            break;
          case "triangle":
            geom = createTriangleNode(node.x, node.y, size, nodeColor, 1);
            break;
          default:
            geom = createCircleNode(node.x, node.y, size, nodeColor, 1);
        }

        allPositions.push(...geom.positions);
        allColors.push(...geom.colors);

        // Draw node outline
        const outlineColor = hexToRgb("#ffffff");
        const outlineSize = size + 2;
        let outlineGeom: { positions: number[]; colors: number[] };

        switch (shape) {
          case "circle":
            outlineGeom = createCircleNode(node.x, node.y, outlineSize, outlineColor, 0.3);
            break;
          case "square":
            outlineGeom = createSquareNode(node.x, node.y, outlineSize, outlineColor, 0.3);
            break;
          case "diamond":
            outlineGeom = createDiamondNode(node.x, node.y, outlineSize, outlineColor, 0.3);
            break;
          case "triangle":
            outlineGeom = createTriangleNode(node.x, node.y, outlineSize, outlineColor, 0.3);
            break;
          default:
            outlineGeom = createCircleNode(node.x, node.y, outlineSize, outlineColor, 0.3);
        }

        allPositions.push(...outlineGeom.positions);
        allColors.push(...outlineGeom.colors);
      }

      // Upload buffers
      if (!buffers.position) {
        buffers.position = gl.createBuffer();
      }
      if (!buffers.color) {
        buffers.color = gl.createBuffer();
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPositions), gl.STATIC_DRAW);
      const positionLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allColors), gl.STATIC_DRAW);
      const colorLoc = gl.getAttribLocation(program, "a_color");
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, allPositions.length / 2);
    },
  });

  return renderer;
}

// ============================================================================
// Root Component
// ============================================================================

interface RootProps extends NetworkGraphProps {
  children: React.ReactNode;
}

function Root({
  children,
  nodes,
  edges,
  width = 800,
  height = 600,
  layout = "force",
  interactive = true,
  showLabels = true,
  nodeSize = 10,
  edgeWidth = 2,
  preferWebGPU = false,
  className,
}: RootProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const networkData: NetworkGraphContextType = {
    nodes,
    edges,
    layout,
    interactive,
    showLabels,
    nodeSize,
    edgeWidth,
    zoom,
    panX,
    panY,
    setZoom,
    setPan: (x, y) => {
      setPanX(x);
      setPanY(y);
    },
  };

  return (
    <NetworkGraphContext.Provider value={networkData}>
      <ChartRoot
        width={width}
        height={height}
        preferWebGPU={preferWebGPU}
        className={className}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        {children}
      </ChartRoot>
    </NetworkGraphContext.Provider>
  );
}

// ============================================================================
// Canvas Component
// ============================================================================

function Canvas() {
  const ctx = useNetworkGraph();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer<NetworkRendererProps> | null>(null);
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);

  // Compute layout when nodes/edges change
  useEffect(() => {
    if (ctx.layout === "force") {
      const computed = applyForceLayout(ctx.nodes, ctx.edges, ctx.width, ctx.height);
      setLayoutNodes(computed);
    } else {
      // Use provided positions
      const positioned = ctx.nodes.map((n) => ({
        ...n,
        x: n.x ?? ctx.width / 2,
        y: n.y ?? ctx.height / 2,
        vx: 0,
        vy: 0,
      }));
      setLayoutNodes(positioned);
    }
  }, [ctx.nodes, ctx.edges, ctx.layout, ctx.width, ctx.height]);

  useEffect(() => {
    if (!canvasRef.current || layoutNodes.length === 0) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = ctx.width * dpr;
    canvas.height = ctx.height * dpr;
    canvas.style.width = `${ctx.width}px`;
    canvas.style.height = `${ctx.height}px`;

    if (!rendererRef.current) {
      rendererRef.current = createWebGLNetworkRenderer(canvas);
    }

    const props: NetworkRendererProps = {
      layoutNodes,
      edges: ctx.edges,
      nodeSize: ctx.nodeSize,
      edgeWidth: ctx.edgeWidth,
      zoom: ctx.zoom,
      panX: ctx.panX,
      panY: ctx.panY,
      width: canvas.width,
      height: canvas.height,
      margin: ctx.margin,
      xDomain: [0, 1],
      yDomain: [0, 1],
      xTicks: [],
      yTicks: [],
      showGrid: false,
      canvas,
    };

    rendererRef.current.render(props);
  }, [ctx, layoutNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ============================================================================
// Labels Component
// ============================================================================

function Labels() {
  const ctx = useNetworkGraph();
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);

  useEffect(() => {
    if (ctx.layout === "force") {
      const computed = applyForceLayout(ctx.nodes, ctx.edges, ctx.width, ctx.height);
      setLayoutNodes(computed);
    } else {
      const positioned = ctx.nodes.map((n) => ({
        ...n,
        x: n.x ?? ctx.width / 2,
        y: n.y ?? ctx.height / 2,
        vx: 0,
        vy: 0,
      }));
      setLayoutNodes(positioned);
    }
  }, [ctx.nodes, ctx.edges, ctx.layout, ctx.width, ctx.height]);

  if (!ctx.showLabels) return null;

  return (
    <>
      {layoutNodes.map((node) => {
        if (!node.label) return null;

        const x = (node.x + ctx.panX) * ctx.zoom;
        const y = (node.y + ctx.panY) * ctx.zoom + 20;

        return (
          <div
            key={node.id}
            className="absolute text-xs text-white bg-black/60 px-2 py-1 rounded pointer-events-none whitespace-nowrap"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, 0)",
            }}
          >
            {node.label}
          </div>
        );
      })}
    </>
  );
}

// ============================================================================
// Composed Component
// ============================================================================

export function NetworkGraph(props: NetworkGraphProps) {
  return (
    <Root {...props}>
      <Canvas />
      <Labels />
    </Root>
  );
}

NetworkGraph.Root = Root;
NetworkGraph.Canvas = Canvas;
NetworkGraph.Labels = Labels;

export default NetworkGraph;
