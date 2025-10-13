"use client";

import * as React from "react";
import { cn } from "../components/lib";

// ============================================================================
// Types
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export type NodeType = "input" | "output" | "process" | "decision" | "custom";

export interface Port {
  id: string;
  label?: string;
  type?: string;
}

export interface GraphNode {
  id: string;
  type: NodeType;
  position: Position;
  label: string;
  inputs?: Port[];
  outputs?: Port[];
  width?: number;
  height?: number;
  color?: string;
  data?: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
  color?: string;
  label?: string;
}

export type NodeGraphVariant = "default" | "minimal" | "technical";

export interface NodeGraphEditorRootProps {
  nodes: GraphNode[];
  edges: Edge[];
  onNodesChange?: (nodes: GraphNode[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  onConnect?: (edge: Omit<Edge, "id">) => void;
  width?: number;
  height?: number;
  variant?: NodeGraphVariant;
  snapToGrid?: boolean;
  gridSize?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  readOnly?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface NodeGraphEditorContext {
  nodes: GraphNode[];
  edges: Edge[];
  width: number;
  height: number;
  variant: NodeGraphVariant;
  snapToGrid: boolean;
  gridSize: number;
  enableZoom: boolean;
  enablePan: boolean;
  readOnly: boolean;
  selectedNodeId: string | null;
  handleNodeSelect: (id: string | null) => void;
  draggedNodeId: string | null;
  setDraggedNodeId: (id: string | null) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  connectionStart: { nodeId: string; portId: string; isOutput: boolean } | null;
  setConnectionStart: (
    start: { nodeId: string; portId: string; isOutput: boolean } | null
  ) => void;
  viewTransform: { x: number; y: number; scale: number };
  setViewTransform: (transform: {
    x: number;
    y: number;
    scale: number;
  }) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  addEdge: (edge: Omit<Edge, "id">) => void;
}

const NodeGraphEditorContext =
  React.createContext<NodeGraphEditorContext | null>(null);

function useNodeGraphEditor() {
  const ctx = React.useContext(NodeGraphEditorContext);
  if (!ctx)
    throw new Error(
      "useNodeGraphEditor must be used within NodeGraphEditor.Root"
    );
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function snapToGridValue(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function getNodeTypeColor(type: NodeType, customColor?: string): string {
  if (customColor) return customColor;
  switch (type) {
    case "input":
      return "#10b981";
    case "output":
      return "#ef4444";
    case "process":
      return "#3b82f6";
    case "decision":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
}

// ============================================================================
// Primitives
// ============================================================================

const NodeGraphEditorRoot = React.forwardRef<
  HTMLDivElement,
  NodeGraphEditorRootProps
>(
  (
    {
      nodes: initialNodes,
      edges: initialEdges,
      onNodesChange,
      onEdgesChange,
      onNodeSelect,
      onConnect,
      width = 1200,
      height = 600,
      variant = "default",
      snapToGrid = false,
      gridSize = 20,
      enableZoom = true,
      enablePan = true,
      readOnly = false,
      className,
      children,
    },
    ref
  ) => {
    const [nodes, setNodes] = React.useState<GraphNode[]>(initialNodes);
    const [edges, setEdges] = React.useState<Edge[]>(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
      null
    );
    const [draggedNodeId, setDraggedNodeId] = React.useState<string | null>(
      null
    );
    const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(
      null
    );
    const [connectionStart, setConnectionStart] = React.useState<{
      nodeId: string;
      portId: string;
      isOutput: boolean;
    } | null>(null);
    const [viewTransform, setViewTransform] = React.useState({
      x: 0,
      y: 0,
      scale: 1,
    });

    React.useEffect(() => {
      setNodes(initialNodes);
    }, [initialNodes]);

    React.useEffect(() => {
      setEdges(initialEdges);
    }, [initialEdges]);

    const updateNodePosition = React.useCallback(
      (nodeId: string, position: Position) => {
        setNodes((prevNodes) => {
          const updatedNodes = prevNodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  position: snapToGrid
                    ? {
                        x: snapToGridValue(position.x, gridSize),
                        y: snapToGridValue(position.y, gridSize),
                      }
                    : position,
                }
              : node
          );
          onNodesChange?.(updatedNodes);
          return updatedNodes;
        });
      },
      [snapToGrid, gridSize, onNodesChange]
    );

    const addEdge = React.useCallback(
      (edge: Omit<Edge, "id">) => {
        const newEdge: Edge = {
          ...edge,
          id: `edge-${Date.now()}-${Math.random()}`,
        };
        setEdges((prev) => {
          const updatedEdges = [...prev, newEdge];
          onEdgesChange?.(updatedEdges);
          return updatedEdges;
        });
        onConnect?.(edge);
      },
      [onConnect, onEdgesChange]
    );

    const handleNodeSelect = React.useCallback(
      (nodeId: string | null) => {
        setSelectedNodeId(nodeId);
        onNodeSelect?.(nodeId);
      },
      [onNodeSelect]
    );

    const contextValue: NodeGraphEditorContext = React.useMemo(
      () => ({
        nodes,
        edges,
        width,
        height,
        variant,
        snapToGrid,
        gridSize,
        enableZoom,
        enablePan,
        readOnly,
        selectedNodeId,
        handleNodeSelect,
        draggedNodeId,
        setDraggedNodeId,
        hoveredNodeId,
        setHoveredNodeId,
        connectionStart,
        setConnectionStart,
        viewTransform,
        setViewTransform,
        updateNodePosition,
        addEdge,
      }),
      [
        nodes,
        edges,
        width,
        height,
        variant,
        snapToGrid,
        gridSize,
        enableZoom,
        enablePan,
        readOnly,
        selectedNodeId,
        handleNodeSelect,
        draggedNodeId,
        hoveredNodeId,
        connectionStart,
        viewTransform,
        updateNodePosition,
        addEdge,
      ]
    );

    return (
      <NodeGraphEditorContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("node-graph-editor", className)}
          style={{
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </NodeGraphEditorContext.Provider>
    );
  }
);

NodeGraphEditorRoot.displayName = "NodeGraphEditor.Root";

export interface NodeGraphEditorContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const NodeGraphEditorContainer = React.forwardRef<
  HTMLDivElement,
  NodeGraphEditorContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useNodeGraphEditor();

  return (
    <div
      ref={ref}
      className={cn("node-graph-editor-container", className)}
      style={{
        position: "relative",
        width: "100%",
        height: `${height}px`,
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

NodeGraphEditorContainer.displayName = "NodeGraphEditor.Container";

export interface NodeGraphEditorCanvasProps
  extends React.SVGProps<SVGSVGElement> {}

const NodeGraphEditorCanvas = React.forwardRef<
  SVGSVGElement,
  NodeGraphEditorCanvasProps
>(({ className, children, ...props }, ref) => {
  const {
    width,
    height,
    viewTransform,
    setViewTransform,
    enablePan,
    readOnly,
  } = useNodeGraphEditor();

  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState<Position>({ x: 0, y: 0 });

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!enablePan || readOnly || e.button !== 0) return;
      if ((e.target as SVGElement).closest(".node-graph-node")) return;

      setIsPanning(true);
      setPanStart({
        x: e.clientX - viewTransform.x,
        y: e.clientY - viewTransform.y,
      });
      e.preventDefault();
    },
    [enablePan, readOnly, viewTransform]
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isPanning) return;

      const newX = e.clientX - panStart.x;
      const newY = e.clientY - panStart.y;
      setViewTransform({ ...viewTransform, x: newX, y: newY });
    },
    [isPanning, panStart, viewTransform, setViewTransform]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`${-viewTransform.x} ${-viewTransform.y} ${
        width / viewTransform.scale
      } ${height / viewTransform.scale}`}
      className={cn("node-graph-canvas", className)}
      style={{
        display: "block",
        userSelect: "none",
        cursor: isPanning ? "grabbing" : enablePan ? "grab" : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      {...props}
    >
      {children}
    </svg>
  );
});

NodeGraphEditorCanvas.displayName = "NodeGraphEditor.Canvas";

export interface NodeGraphEditorGridProps extends React.SVGProps<SVGGElement> {
  size?: number;
}

const NodeGraphEditorGrid = React.forwardRef<
  SVGGElement,
  NodeGraphEditorGridProps
>(({ className, size = 20, ...props }, ref) => {
  const { width, height, viewTransform } = useNodeGraphEditor();

  const gridSize = size;
  const scaledWidth = width / viewTransform.scale;
  const scaledHeight = height / viewTransform.scale;

  return (
    <g ref={ref} className={cn("node-graph-grid", className)} {...props}>
      <defs>
        <pattern
          id="grid-pattern"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
          x={-viewTransform.x % gridSize}
          y={-viewTransform.y % gridSize}
        >
          <circle
            cx={gridSize / 2}
            cy={gridSize / 2}
            r={1}
            fill="rgba(255, 255, 255, 0.15)"
          />
        </pattern>
      </defs>
      <rect
        x={-viewTransform.x}
        y={-viewTransform.y}
        width={scaledWidth}
        height={scaledHeight}
        fill="url(#grid-pattern)"
      />
    </g>
  );
});

NodeGraphEditorGrid.displayName = "NodeGraphEditor.Grid";

export interface NodeGraphEditorEdgesProps
  extends React.SVGProps<SVGGElement> {}

const NodeGraphEditorEdges = React.forwardRef<
  SVGGElement,
  NodeGraphEditorEdgesProps
>(({ className, ...props }, ref) => {
  const { edges, nodes } = useNodeGraphEditor();

  const getNodePortPosition = (
    nodeId: string,
    portId: string,
    isOutput: boolean
  ): Position | null => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    const nodeWidth = node.width || 180;
    const ports = isOutput ? node.outputs || [] : node.inputs || [];
    const portIndex = ports.findIndex((p) => p.id === portId);
    if (portIndex === -1) return null;

    const portY = node.position.y + 30 + portIndex * 24;
    const portX = isOutput ? node.position.x + nodeWidth : node.position.x;

    return { x: portX, y: portY };
  };

  return (
    <g ref={ref} className={cn("node-graph-edges", className)} {...props}>
      <defs>
        {edges.map((edge, idx) => (
          <linearGradient
            key={edge.id}
            id={`edge-gradient-${idx}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor={edge.color || "currentColor"}
              stopOpacity={0.6}
            />
            <stop
              offset="50%"
              stopColor={edge.color || "currentColor"}
              stopOpacity={0.4}
            />
            <stop
              offset="100%"
              stopColor={edge.color || "currentColor"}
              stopOpacity={0.6}
            />
          </linearGradient>
        ))}
      </defs>

      {edges.map((edge, idx) => {
        const sourcePos = getNodePortPosition(
          edge.source,
          edge.sourcePort,
          true
        );
        const targetPos = getNodePortPosition(
          edge.target,
          edge.targetPort,
          false
        );

        if (!sourcePos || !targetPos) return null;

        const dx = targetPos.x - sourcePos.x;
        const controlPointOffset = Math.max(Math.abs(dx) * 0.6, 50);

        const path = `M ${sourcePos.x},${sourcePos.y} C ${
          sourcePos.x + controlPointOffset
        },${sourcePos.y} ${targetPos.x - controlPointOffset},${targetPos.y} ${
          targetPos.x
        },${targetPos.y}`;

        return (
          <g key={edge.id}>
            {/* Glow effect */}
            <path
              d={path}
              stroke={`url(#edge-gradient-${idx})`}
              strokeWidth={6}
              fill="none"
              opacity={0.2}
              filter="url(#edge-glow)"
            />
            {/* Main edge */}
            <path
              d={path}
              stroke={edge.color || "currentColor"}
              strokeWidth={2.5}
              fill="none"
              opacity={0.7}
              strokeLinecap="round"
            />
            {edge.label && (
              <text
                x={(sourcePos.x + targetPos.x) / 2}
                y={(sourcePos.y + targetPos.y) / 2 - 8}
                fontSize={10}
                fill="currentColor"
                opacity={0.6}
                textAnchor="middle"
                fontWeight={500}
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <filter id="edge-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
});

NodeGraphEditorEdges.displayName = "NodeGraphEditor.Edges";

export interface NodeGraphEditorNodesProps
  extends React.SVGProps<SVGGElement> {}

const NodeGraphEditorNodes = React.forwardRef<
  SVGGElement,
  NodeGraphEditorNodesProps
>(({ className, ...props }, ref) => {
  const {
    nodes,
    selectedNodeId,
    handleNodeSelect,
    draggedNodeId,
    setDraggedNodeId,
    hoveredNodeId,
    setHoveredNodeId,
    updateNodePosition,
    setConnectionStart,
    connectionStart,
    addEdge,
    readOnly,
  } = useNodeGraphEditor();

  const [dragOffset, setDragOffset] = React.useState<Position>({ x: 0, y: 0 });

  const handleNodeMouseDown = React.useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (readOnly) return;
      e.stopPropagation();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const svg = (e.target as SVGElement).ownerSVGElement;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      handleNodeSelect(nodeId);
      setDraggedNodeId(nodeId);
      setDragOffset({
        x: svgP.x - node.position.x,
        y: svgP.y - node.position.y,
      });
    },
    [nodes, handleNodeSelect, setDraggedNodeId, readOnly]
  );

  const handlePortMouseDown = React.useCallback(
    (
      e: React.MouseEvent,
      nodeId: string,
      portId: string,
      isOutput: boolean
    ) => {
      if (readOnly) return;
      e.stopPropagation();
      setConnectionStart({ nodeId, portId, isOutput });
    },
    [setConnectionStart, readOnly]
  );

  const handlePortMouseUp = React.useCallback(
    (
      e: React.MouseEvent,
      nodeId: string,
      portId: string,
      isOutput: boolean
    ) => {
      if (readOnly || !connectionStart) return;
      e.stopPropagation();

      if (connectionStart.isOutput === isOutput) return;
      if (connectionStart.nodeId === nodeId) return;

      if (connectionStart.isOutput) {
        addEdge({
          source: connectionStart.nodeId,
          sourcePort: connectionStart.portId,
          target: nodeId,
          targetPort: portId,
        });
      } else {
        addEdge({
          source: nodeId,
          sourcePort: portId,
          target: connectionStart.nodeId,
          targetPort: connectionStart.portId,
        });
      }

      setConnectionStart(null);
    },
    [connectionStart, addEdge, setConnectionStart, readOnly]
  );

  React.useEffect(() => {
    if (!draggedNodeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const node = nodes.find((n) => n.id === draggedNodeId);
      if (!node) return;

      const svg = document.querySelector(".node-graph-canvas") as SVGSVGElement;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      updateNodePosition(draggedNodeId, {
        x: svgP.x - dragOffset.x,
        y: svgP.y - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setDraggedNodeId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedNodeId, nodes, dragOffset, updateNodePosition, setDraggedNodeId]);

  return (
    <g ref={ref} className={cn("node-graph-nodes", className)} {...props}>
      <defs>
        {nodes.map((node) => {
          const color = getNodeTypeColor(node.type, node.color);
          return (
            <linearGradient
              key={`gradient-${node.id}`}
              id={`node-gradient-${node.id}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          );
        })}
      </defs>

      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isDragged = draggedNodeId === node.id;
        const color = getNodeTypeColor(node.type, node.color);
        const nodeWidth = node.width || 180;
        const nodeHeight =
          node.height ||
          Math.max(
            80,
            30 +
              Math.max(node.inputs?.length || 0, node.outputs?.length || 0) * 24
          );

        return (
          <g
            key={node.id}
            className="node-graph-node"
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            style={{ cursor: readOnly ? "default" : "move" }}
          >
            {/* Outer glow effect */}
            <rect
              x={node.position.x - 4}
              y={node.position.y - 4}
              width={nodeWidth + 8}
              height={nodeHeight + 8}
              rx={10}
              fill={color}
              opacity={isSelected ? 0.3 : isHovered || isDragged ? 0.2 : 0.08}
              filter="url(#node-glow-outer)"
            />

            {/* Node body - dark glassmorphic background */}
            <rect
              x={node.position.x}
              y={node.position.y}
              width={nodeWidth}
              height={nodeHeight}
              rx={8}
              fill="rgba(0, 0, 0, 0.6)"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={1}
            />

            {/* Gradient overlay */}
            <rect
              x={node.position.x}
              y={node.position.y}
              width={nodeWidth}
              height={nodeHeight}
              rx={8}
              fill={`url(#node-gradient-${node.id})`}
              opacity={0.15}
            />

            {/* Glowing border */}
            <rect
              x={node.position.x}
              y={node.position.y}
              width={nodeWidth}
              height={nodeHeight}
              rx={8}
              fill="none"
              stroke={color}
              strokeWidth={isSelected ? 2 : isHovered || isDragged ? 1.5 : 1}
              opacity={isSelected ? 0.9 : isHovered || isDragged ? 0.7 : 0.4}
              filter={
                isSelected || isHovered || isDragged
                  ? "url(#node-border-glow)"
                  : undefined
              }
            />

            {/* Vertical accent bar on the left */}
            <rect
              x={node.position.x + 6}
              y={node.position.y + 10}
              width={3}
              height={nodeHeight - 20}
              rx={1.5}
              fill={color}
              opacity={0.8}
            />

            {/* Accent bar glow */}
            <rect
              x={node.position.x + 6}
              y={node.position.y + 10}
              width={3}
              height={nodeHeight - 20}
              rx={1.5}
              fill={color}
              opacity={0.4}
              filter="url(#accent-bar-glow)"
            />

            {/* Node label */}
            <text
              x={node.position.x + nodeWidth / 2}
              y={node.position.y + 22}
              fontSize={13}
              fontWeight={600}
              fill="white"
              textAnchor="middle"
              opacity={0.95}
            >
              {node.label}
            </text>

            {/* Input ports */}
            {node.inputs?.map((port, idx) => (
              <g key={`input-${port.id}`}>
                {/* Port outer glow */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y + 36 + idx * 24}
                  r={7}
                  fill={color}
                  opacity={0.1}
                />
                {/* Port body */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y + 36 + idx * 24}
                  r={5}
                  fill="currentColor"
                  fillOpacity={0.05}
                  stroke={color}
                  strokeWidth={2}
                  onMouseDown={(e) =>
                    handlePortMouseDown(e, node.id, port.id, false)
                  }
                  onMouseUp={(e) =>
                    handlePortMouseUp(e, node.id, port.id, false)
                  }
                  style={{ cursor: readOnly ? "default" : "pointer" }}
                />
                {/* Port inner dot */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y + 36 + idx * 24}
                  r={2}
                  fill={color}
                  opacity={0.6}
                  pointerEvents="none"
                />
                {port.label && (
                  <text
                    x={node.position.x + 16}
                    y={node.position.y + 40 + idx * 24}
                    fontSize={10}
                    fill="white"
                    opacity={0.8}
                    fontWeight={500}
                  >
                    {port.label}
                  </text>
                )}
              </g>
            ))}

            {/* Output ports */}
            {node.outputs?.map((port, idx) => (
              <g key={`output-${port.id}`}>
                {/* Port outer glow */}
                <circle
                  cx={node.position.x + nodeWidth}
                  cy={node.position.y + 36 + idx * 24}
                  r={7}
                  fill={color}
                  opacity={0.1}
                />
                {/* Port body */}
                <circle
                  cx={node.position.x + nodeWidth}
                  cy={node.position.y + 36 + idx * 24}
                  r={5}
                  fill="currentColor"
                  fillOpacity={0.05}
                  stroke={color}
                  strokeWidth={2}
                  onMouseDown={(e) =>
                    handlePortMouseDown(e, node.id, port.id, true)
                  }
                  onMouseUp={(e) =>
                    handlePortMouseUp(e, node.id, port.id, true)
                  }
                  style={{ cursor: readOnly ? "default" : "pointer" }}
                />
                {/* Port inner dot */}
                <circle
                  cx={node.position.x + nodeWidth}
                  cy={node.position.y + 36 + idx * 24}
                  r={2}
                  fill={color}
                  opacity={0.6}
                  pointerEvents="none"
                />
                {port.label && (
                  <text
                    x={node.position.x + nodeWidth - 16}
                    y={node.position.y + 40 + idx * 24}
                    fontSize={10}
                    fill="white"
                    opacity={0.8}
                    fontWeight={500}
                    textAnchor="end"
                  >
                    {port.label}
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}

      <defs>
        <filter
          id="node-glow-outer"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="node-border-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="accent-bar-glow"
          x="-200%"
          y="-50%"
          width="400%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
});

NodeGraphEditorNodes.displayName = "NodeGraphEditor.Nodes";

// ============================================================================
// Exports
// ============================================================================

export const NodeGraphEditor = Object.assign(NodeGraphEditorRoot, {
  Root: NodeGraphEditorRoot,
  Container: NodeGraphEditorContainer,
  Canvas: NodeGraphEditorCanvas,
  Grid: NodeGraphEditorGrid,
  Edges: NodeGraphEditorEdges,
  Nodes: NodeGraphEditorNodes,
});
