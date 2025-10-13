"use client";

import { useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Volume Renderer
 *
 * GPU-accelerated volumetric rendering using ray marching.
 * Used by: CT/MRI scans, atmospheric density, CFD results, volumetric clouds.
 *
 * Features:
 * - Ray marching through 3D texture
 * - Transfer function for opacity/color mapping
 * - Maximum Intensity Projection (MIP)
 * - Isosurface rendering
 * - Scientific colormaps
 *
 * @example
 * ```tsx
 * // Medical CT scan
 * <VolumeRenderer
 *   data={ct3DArray}  // Uint8Array or Float32Array
 *   dimensions={[256, 256, 128]}
 *   transferFunction={[
 *     { value: 0, opacity: 0, color: "#000000" },
 *     { value: 0.5, opacity: 0.3, color: "#ff6b6b" },
 *     { value: 1, opacity: 0.8, color: "#ffffff" }
 *   ]}
 * />
 *
 * // Atmospheric density
 * <VolumeRenderer
 *   data={atmosphereData}
 *   dimensions={[128, 128, 128]}
 *   mode="mip"
 *   colormap="viridis"
 * />
 * ```
 */

export interface TransferFunctionPoint {
  /** Normalized value [0, 1] */
  value: number;

  /** Opacity [0, 1] */
  opacity: number;

  /** Color */
  color: THREE.ColorRepresentation;
}

export interface VolumeRendererProps {
  /** 3D volume data (Uint8Array or Float32Array) */
  data: Uint8Array | Float32Array;

  /** Volume dimensions [width, height, depth] */
  dimensions: [number, number, number];

  /** Transfer function for opacity/color mapping */
  transferFunction?: TransferFunctionPoint[];

  /** Rendering mode */
  mode?: "dvr" | "mip" | "isosurface";

  /** Isosurface threshold (for isosurface mode) */
  isovalue?: number;

  /** Number of ray marching steps */
  steps?: number;

  /** Colormap name */
  colormap?: "viridis" | "plasma" | "inferno" | "magma" | "grayscale";

  /** Overall opacity multiplier */
  opacity?: number;

  /** Volume scale */
  scale?: number | [number, number, number];

  /** Position */
  position?: [number, number, number];

  /** Rotation */
  rotation?: [number, number, number];
}

export interface VolumeRendererHandle {
  /** Update volume data */
  updateData: (data: Uint8Array | Float32Array) => void;

  /** Update transfer function */
  updateTransferFunction: (tf: TransferFunctionPoint[]) => void;

  /** Get current mode */
  getMode: () => string;
}

// Default colormaps
const COLORMAPS = {
  viridis: [
    [0, 0.267, 0.005],
    [0.278, 0.175, 0.49],
    [0.231, 0.322, 0.545],
    [0.173, 0.455, 0.557],
    [0.129, 0.565, 0.551],
    [0.157, 0.659, 0.518],
    [0.267, 0.741, 0.463],
    [0.478, 0.821, 0.318],
    [0.741, 0.873, 0.149],
    [0.993, 0.906, 0.144],
  ],
  plasma: [
    [0.051, 0.03, 0.529],
    [0.282, 0.014, 0.592],
    [0.478, 0.012, 0.635],
    [0.647, 0.125, 0.596],
    [0.788, 0.282, 0.478],
    [0.902, 0.459, 0.322],
    [0.98, 0.647, 0.192],
    [0.996, 0.839, 0.153],
    [0.941, 0.976, 0.392],
  ],
  inferno: [
    [0, 0, 0.016],
    [0.118, 0.027, 0.235],
    [0.286, 0.051, 0.447],
    [0.486, 0.106, 0.424],
    [0.678, 0.176, 0.329],
    [0.839, 0.314, 0.22],
    [0.961, 0.518, 0.161],
    [0.984, 0.741, 0.263],
    [0.988, 0.906, 0.478],
    [0.988, 0.998, 0.645],
  ],
  magma: [
    [0, 0, 0.016],
    [0.094, 0.027, 0.267],
    [0.231, 0.043, 0.447],
    [0.4, 0.086, 0.494],
    [0.576, 0.176, 0.478],
    [0.753, 0.329, 0.416],
    [0.894, 0.529, 0.431],
    [0.98, 0.741, 0.557],
    [0.992, 0.906, 0.753],
    [0.988, 0.992, 0.906],
  ],
  grayscale: [
    [0, 0, 0],
    [0.25, 0.25, 0.25],
    [0.5, 0.5, 0.5],
    [0.75, 0.75, 0.75],
    [1, 1, 1],
  ],
};

/**
 * Volume Renderer Component
 */
export const VolumeRenderer = forwardRef<VolumeRendererHandle, VolumeRendererProps>(
  (
    {
      data,
      dimensions,
      transferFunction,
      mode = "dvr",
      isovalue = 0.5,
      steps = 128,
      colormap = "viridis",
      opacity = 1.0,
      scale = 1,
      position = [0, 0, 0],
      rotation = [0, 0, 0],
    },
    ref
  ) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const dataTextureRef = useRef<THREE.Data3DTexture | null>(null);
    const transferTextureRef = useRef<THREE.DataTexture | null>(null);

    // Create 3D texture from volume data
    const dataTexture = useMemo(() => {
      const [width, height, depth] = dimensions;

      // Normalize data to 0-1 range
      let normalizedData: Uint8Array;
      if (data instanceof Float32Array) {
        const min = Math.min(...Array.from(data));
        const max = Math.max(...Array.from(data));
        const range = max - min || 1;

        normalizedData = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
          normalizedData[i] = ((data[i] - min) / range) * 255;
        }
      } else {
        normalizedData = data;
      }

      const texture = new THREE.Data3DTexture(normalizedData, width, height, depth);
      texture.format = THREE.RedFormat;
      texture.type = THREE.UnsignedByteType;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.wrapR = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;

      dataTextureRef.current = texture;
      return texture;
    }, [data, dimensions]);

    // Create transfer function texture
    const transferTexture = useMemo(() => {
      const size = 256;
      const tfData = new Uint8Array(size * 4);

      if (transferFunction) {
        // User-defined transfer function
        for (let i = 0; i < size; i++) {
          const value = i / (size - 1);

          // Find surrounding points in transfer function
          let beforePoint = transferFunction[0];
          let afterPoint = transferFunction[transferFunction.length - 1];

          for (let j = 0; j < transferFunction.length - 1; j++) {
            if (
              value >= transferFunction[j].value &&
              value <= transferFunction[j + 1].value
            ) {
              beforePoint = transferFunction[j];
              afterPoint = transferFunction[j + 1];
              break;
            }
          }

          // Interpolate
          const range = afterPoint.value - beforePoint.value || 1;
          const t = (value - beforePoint.value) / range;

          const beforeColor = new THREE.Color(beforePoint.color);
          const afterColor = new THREE.Color(afterPoint.color);
          const color = beforeColor.lerp(afterColor, t);

          const opacityValue = beforePoint.opacity + t * (afterPoint.opacity - beforePoint.opacity);

          tfData[i * 4] = color.r * 255;
          tfData[i * 4 + 1] = color.g * 255;
          tfData[i * 4 + 2] = color.b * 255;
          tfData[i * 4 + 3] = opacityValue * 255;
        }
      } else {
        // Use colormap
        const colormapData = COLORMAPS[colormap] || COLORMAPS.viridis;

        for (let i = 0; i < size; i++) {
          const t = i / (size - 1);
          const segmentIndex = Math.floor(t * (colormapData.length - 1));
          const segmentT = (t * (colormapData.length - 1)) % 1;

          const color1 = colormapData[segmentIndex];
          const color2 =
            colormapData[Math.min(segmentIndex + 1, colormapData.length - 1)];

          const r = color1[0] + segmentT * (color2[0] - color1[0]);
          const g = color1[1] + segmentT * (color2[1] - color1[1]);
          const b = color1[2] + segmentT * (color2[2] - color1[2]);

          tfData[i * 4] = r * 255;
          tfData[i * 4 + 1] = g * 255;
          tfData[i * 4 + 2] = b * 255;
          tfData[i * 4 + 3] = t * 255; // Linear opacity ramp
        }
      }

      const texture = new THREE.DataTexture(
        tfData,
        size,
        1,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
      );
      texture.needsUpdate = true;

      transferTextureRef.current = texture;
      return texture;
    }, [transferFunction, colormap]);

    // Ray marching shader
    const shader = useMemo(() => {
      return {
        uniforms: {
          volumeTexture: { value: dataTexture },
          transferTexture: { value: transferTexture },
          steps: { value: steps },
          opacity: { value: opacity },
          isovalue: { value: isovalue },
          mode: { value: mode === "mip" ? 1 : mode === "isosurface" ? 2 : 0 },
        },
        vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;

          void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler3D volumeTexture;
          uniform sampler2D transferTexture;
          uniform float steps;
          uniform float opacity;
          uniform float isovalue;
          uniform int mode;

          varying vec3 vPosition;
          varying vec3 vNormal;

          void main() {
            vec3 rayDir = normalize(vPosition - cameraPosition);
            vec3 rayStart = vPosition * 0.5 + 0.5; // Transform to texture coordinates

            vec4 color = vec4(0.0);
            float maxIntensity = 0.0;

            float stepSize = 1.0 / steps;

            for (float i = 0.0; i < 1.0; i += stepSize) {
              vec3 pos = rayStart + rayDir * i;

              // Clip if outside volume
              if (any(lessThan(pos, vec3(0.0))) || any(greaterThan(pos, vec3(1.0)))) {
                break;
              }

              float sample = texture(volumeTexture, pos).r;

              // DVR mode (Direct Volume Rendering)
              if (mode == 0) {
                vec4 tfColor = texture2D(transferTexture, vec2(sample, 0.5));
                tfColor.a *= opacity;

                // Front-to-back compositing
                color.rgb += (1.0 - color.a) * tfColor.a * tfColor.rgb;
                color.a += (1.0 - color.a) * tfColor.a;

                if (color.a > 0.95) break; // Early ray termination
              }
              // MIP mode (Maximum Intensity Projection)
              else if (mode == 1) {
                maxIntensity = max(maxIntensity, sample);
              }
              // Isosurface mode
              else if (mode == 2) {
                if (sample > isovalue && color.a < 0.1) {
                  vec4 tfColor = texture2D(transferTexture, vec2(sample, 0.5));
                  color = vec4(tfColor.rgb, opacity);
                  break;
                }
              }
            }

            // Apply MIP result
            if (mode == 1) {
              vec4 tfColor = texture2D(transferTexture, vec2(maxIntensity, 0.5));
              color = vec4(tfColor.rgb, tfColor.a * opacity);
            }

            if (color.a < 0.01) discard;

            gl_FragColor = color;
          }
        `,
      };
    }, [dataTexture, transferTexture, steps, opacity, isovalue, mode]);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      updateData: (newData: Uint8Array | Float32Array) => {
        if (dataTextureRef.current) {
          // Update texture data
          dataTextureRef.current.image.data = newData;
          dataTextureRef.current.needsUpdate = true;
        }
      },
      updateTransferFunction: (tf: TransferFunctionPoint[]) => {
        // Recreate transfer texture
        // (This would require state update, simplified here)
      },
      getMode: () => mode,
    }));

    const scaleVec = Array.isArray(scale) ? scale : [scale, scale, scale];

    return (
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scaleVec as [number, number, number]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          uniforms={shader.uniforms}
          vertexShader={shader.vertexShader}
          fragmentShader={shader.fragmentShader}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    );
  }
);

VolumeRenderer.displayName = "VolumeRenderer";

/**
 * Slice Viewer
 *
 * View 2D slices through 3D volume (axial, sagittal, coronal).
 */
export interface SliceViewerProps {
  /** 3D volume data */
  data: Uint8Array | Float32Array;

  /** Volume dimensions [width, height, depth] */
  dimensions: [number, number, number];

  /** Slice plane */
  plane?: "axial" | "sagittal" | "coronal";

  /** Slice index */
  sliceIndex?: number;

  /** Colormap */
  colormap?: keyof typeof COLORMAPS;

  /** Window level (for CT scans) */
  windowLevel?: number;

  /** Window width (for CT scans) */
  windowWidth?: number;
}

export function SliceViewer({
  data,
  dimensions,
  plane = "axial",
  sliceIndex = 0,
  colormap = "grayscale",
  windowLevel = 0.5,
  windowWidth = 1.0,
}: SliceViewerProps) {
  const [width, height, depth] = dimensions;

  // Extract 2D slice from 3D data
  const sliceData = useMemo(() => {
    let sliceWidth, sliceHeight;
    const slice: number[] = [];

    switch (plane) {
      case "axial":
        sliceWidth = width;
        sliceHeight = height;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = x + y * width + sliceIndex * width * height;
            slice.push(data[idx] || 0);
          }
        }
        break;
      case "sagittal":
        sliceWidth = depth;
        sliceHeight = height;
        for (let y = 0; y < height; y++) {
          for (let z = 0; z < depth; z++) {
            const idx = sliceIndex + y * width + z * width * height;
            slice.push(data[idx] || 0);
          }
        }
        break;
      case "coronal":
        sliceWidth = width;
        sliceHeight = depth;
        for (let z = 0; z < depth; z++) {
          for (let x = 0; x < width; x++) {
            const idx = x + sliceIndex * width + z * width * height;
            slice.push(data[idx] || 0);
          }
        }
        break;
    }

    return { data: new Uint8Array(slice), width: sliceWidth, height: sliceHeight };
  }, [data, dimensions, plane, sliceIndex, width, height, depth]);

  // Create 2D texture
  const texture = useMemo(() => {
    const tex = new THREE.DataTexture(
      sliceData.data,
      sliceData.width,
      sliceData.height,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    tex.needsUpdate = true;
    return tex;
  }, [sliceData]);

  return (
    <mesh>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
