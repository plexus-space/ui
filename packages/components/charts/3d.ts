/**
 * Plexus UI - 3D Charts
 *
 * 3D chart components that require Three.js.
 * Import from this module separately to avoid including Three.js in your main bundle.
 *
 * @module charts/3d
 *
 * ## Bundle Optimization
 *
 * This module is separate to allow code splitting and avoid loading Three.js
 * unless you actually use 3D components.
 *
 * ## Usage
 *
 * **Good** (only loads Three.js if needed):
 * ```tsx
 * import { LineChart } from "@plexusui/components/charts";
 * import { PointCloudViewer } from "@plexusui/components/charts/3d";
 * ```
 *
 * **Bad** (loads Three.js in main bundle):
 * ```tsx
 * // Don't do this if you're not using 3D charts
 * import { LineChart, PointCloudViewer } from "@plexusui/components/charts";
 * ```
 */

// 3D Model Viewer
export { ModelViewer } from "./3d-model-viewer";
export type { ModelViewerProps } from "./3d-model-viewer";

// Point Cloud Viewer
export { PointCloudViewer } from "./point-cloud-viewer";
export type {
  PointCloudViewerProps,
  PointCloudData,
  ColorMode,
} from "./point-cloud-viewer";

// Point Cloud Interactions
export {
  PointCloudInteractions,
  PointSelection,
  BoundingBox3D,
  MeasurementTool,
  SegmentationBrush,
  PlaneFit,
} from "./point-cloud-interactions";
export type {
  Point3D,
  BoundingBox3D as BoundingBox3DType,
  Measurement,
  PlaneData,
  SegmentationRegion,
  PointSelectionProps,
  BoundingBox3DProps,
  MeasurementToolProps,
  SegmentationBrushProps,
  PlaneFitProps,
  PointCloudInteractionsProps,
} from "./point-cloud-interactions";

// Point cloud utilities
export {
  loadPointCloud,
  loadXYZ,
  loadPCD,
  loadLAS,
  subsamplePointCloud,
  detectFormat,
} from "../lib/point-cloud-loaders";

export {
  buildOctree,
  selectNodesLOD,
  mergeNodeData,
  getLeafNodes,
  getTotalPoints,
  getMaxDepth,
  type OctreeNode,
  type OctreeOptions,
  type LODOptions,
} from "../lib/point-cloud-octree";
