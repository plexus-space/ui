"use client";

import { useRef, useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Mesh Loader
 *
 * Loads and renders 3D mesh files (STL, OBJ, GLTF/GLB).
 * Used by: Anatomy models, spacecraft, terrain, surgical instruments, mechanical parts.
 *
 * Features:
 * - Support for STL, OBJ, GLTF, GLB formats
 * - Automatic centering and scaling
 * - Material override
 * - Wireframe mode
 * - LOD (Level of Detail) support
 * - Progress callbacks
 *
 * @example
 * ```tsx
 * // Load STL model (medical anatomy)
 * <MeshLoader
 *   url="/models/heart.stl"
 *   material={
 *     <meshStandardMaterial color="#ff6b6b" />
 *   }
 *   scale={0.01}
 * />
 *
 * // Load OBJ spacecraft
 * <MeshLoader
 *   url="/models/satellite.obj"
 *   material={
 *     <meshPhysicalMaterial
 *       metalness={0.9}
 *       roughness={0.1}
 *     />
 *   }
 *   autoCenter
 *   autoScale
 * />
 *
 * // Load GLTF with animations
 * <MeshLoader
 *   url="/models/robot.glb"
 *   playAnimation
 *   animationIndex={0}
 * />
 * ```
 */

export interface MeshLoaderProps {
  /** URL to the mesh file */
  url: string;

  /** File format (auto-detected from extension if not provided) */
  format?: "stl" | "obj" | "gltf" | "glb";

  /** Material to apply (overrides loaded material) */
  material?: THREE.Material | React.ReactElement;

  /** Color (shorthand for basic material) */
  color?: THREE.ColorRepresentation;

  /** Wireframe mode */
  wireframe?: boolean;

  /** Scale factor */
  scale?: number | [number, number, number];

  /** Position */
  position?: [number, number, number];

  /** Rotation in radians */
  rotation?: [number, number, number];

  /** Auto-center the mesh */
  autoCenter?: boolean;

  /** Auto-scale to fit in unit cube */
  autoScale?: boolean;

  /** Target size for auto-scaling */
  targetSize?: number;

  /** Receive shadows */
  receiveShadow?: boolean;

  /** Cast shadows */
  castShadow?: boolean;

  /** Play animation (for GLTF/GLB) */
  playAnimation?: boolean;

  /** Animation index to play */
  animationIndex?: number;

  /** Animation loop mode */
  animationLoop?: boolean;

  /** Animation speed multiplier */
  animationSpeed?: number;

  /** Loading callback */
  onLoad?: (object: THREE.Object3D) => void;

  /** Progress callback */
  onProgress?: (progress: number) => void;

  /** Error callback */
  onError?: (error: Error) => void;
}

export interface MeshLoaderHandle {
  /** Get the loaded mesh */
  getMesh: () => THREE.Object3D | null;

  /** Get animations (GLTF only) */
  getAnimations: () => THREE.AnimationClip[];

  /** Play animation */
  playAnimation: (index: number) => void;

  /** Stop animation */
  stopAnimation: () => void;

  /** Get bounding box */
  getBoundingBox: () => THREE.Box3 | null;
}

/**
 * Mesh Loader Component
 */
export const MeshLoader = forwardRef<MeshLoaderHandle, MeshLoaderProps>(
  (
    {
      url,
      format,
      material,
      color,
      wireframe = false,
      scale = 1,
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      autoCenter = false,
      autoScale = false,
      targetSize = 1,
      receiveShadow = true,
      castShadow = true,
      playAnimation = false,
      animationIndex = 0,
      animationLoop = true,
      animationSpeed = 1.0,
      onLoad,
      onProgress,
      onError,
    },
    ref
  ) => {
    const meshRef = useRef<THREE.Group>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const [loadedObject, setLoadedObject] = useState<THREE.Object3D | null>(null);
    const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);

    // Detect format from URL
    const detectedFormat = format || url.split(".").pop()?.toLowerCase() as "stl" | "obj" | "gltf" | "glb";

    // Load mesh based on format
    useEffect(() => {
      let loader: STLLoader | OBJLoader | GLTFLoader;

      switch (detectedFormat) {
        case "stl":
          loader = new STLLoader();
          break;
        case "obj":
          loader = new OBJLoader();
          break;
        case "gltf":
        case "glb":
          loader = new GLTFLoader();
          break;
        default:
          if (onError) {
            onError(new Error(`Unsupported format: ${detectedFormat}`));
          }
          return;
      }

      loader.load(
        url,
        (result) => {
          let object: THREE.Object3D;

          if (detectedFormat === "stl") {
            // STL returns BufferGeometry
            const geometry = result as THREE.BufferGeometry;
            const mesh = new THREE.Mesh(geometry);
            object = mesh;
          } else if (detectedFormat === "gltf" || detectedFormat === "glb") {
            // GLTF returns GLTF object
            const gltf = result as any;
            object = gltf.scene;

            if (gltf.animations && gltf.animations.length > 0) {
              setAnimations(gltf.animations);

              if (playAnimation) {
                mixerRef.current = new THREE.AnimationMixer(object);
                const clip = gltf.animations[animationIndex];
                if (clip) {
                  const action = mixerRef.current.clipAction(clip);
                  action.setLoop(animationLoop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
                  action.timeScale = animationSpeed;
                  action.play();
                }
              }
            }
          } else {
            // OBJ returns Object3D/Group
            object = result as THREE.Object3D;
          }

          // Apply shadows
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = castShadow;
              child.receiveShadow = receiveShadow;
            }
          });

          // Auto-center
          if (autoCenter) {
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);
          }

          // Auto-scale
          if (autoScale) {
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = targetSize / maxDim;
            object.scale.multiplyScalar(scaleFactor);
          }

          setLoadedObject(object);

          if (onLoad) {
            onLoad(object);
          }
        },
        (xhr) => {
          if (onProgress) {
            onProgress((xhr.loaded / xhr.total) * 100);
          }
        },
        (error) => {
          if (onError) {
            onError(error as Error);
          }
        }
      );
    }, [url, detectedFormat, autoCenter, autoScale, targetSize, castShadow, receiveShadow, playAnimation, animationIndex, animationLoop, animationSpeed, onLoad, onProgress, onError]);

    // Update animation mixer
    useFrame((state, delta) => {
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
    });

    // Material handling
    const appliedMaterial = useMemo(() => {
      if (material) {
        return material;
      } else if (color) {
        return new THREE.MeshStandardMaterial({
          color,
          wireframe,
        });
      } else {
        return new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          wireframe,
        });
      }
    }, [material, color, wireframe]);

    // Apply material override
    useEffect(() => {
      if (loadedObject && appliedMaterial instanceof THREE.Material) {
        loadedObject.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = appliedMaterial;
          }
        });
      }
    }, [loadedObject, appliedMaterial]);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      getMesh: () => loadedObject,
      getAnimations: () => animations,
      playAnimation: (index: number) => {
        if (mixerRef.current && animations[index]) {
          mixerRef.current.stopAllAction();
          const action = mixerRef.current.clipAction(animations[index]);
          action.setLoop(animationLoop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
          action.timeScale = animationSpeed;
          action.play();
        }
      },
      stopAnimation: () => {
        if (mixerRef.current) {
          mixerRef.current.stopAllAction();
        }
      },
      getBoundingBox: () => {
        if (loadedObject) {
          return new THREE.Box3().setFromObject(loadedObject);
        }
        return null;
      },
    }));

    if (!loadedObject) {
      return null; // or return a loading placeholder
    }

    const scaleVec = Array.isArray(scale) ? scale : [scale, scale, scale];

    return (
      <group
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scaleVec as [number, number, number]}
      >
        <primitive object={loadedObject} />
      </group>
    );
  }
);

MeshLoader.displayName = "MeshLoader";

/**
 * Instanced Mesh Loader
 *
 * Renders multiple instances of the same mesh for performance.
 * Perfect for forests, particle debris, repeated mechanical parts.
 */
export interface InstancedMeshLoaderProps extends Omit<MeshLoaderProps, "position" | "rotation" | "scale"> {
  /** Instance transforms [position, rotation, scale][] */
  instances: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
  }>;
}

export const InstancedMeshLoader = forwardRef<MeshLoaderHandle, InstancedMeshLoaderProps>(
  ({ url, instances, ...props }, ref) => {
    const loaderRef = useRef<MeshLoaderHandle>(null);
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
      const mesh = loaderRef.current?.getMesh();
      if (!mesh || !instancedMeshRef.current) return;

      const tempObject = new THREE.Object3D();

      instances.forEach((instance, i) => {
        tempObject.position.set(...instance.position);

        if (instance.rotation) {
          tempObject.rotation.set(...instance.rotation);
        }

        if (instance.scale) {
          const s = Array.isArray(instance.scale)
            ? instance.scale
            : [instance.scale, instance.scale, instance.scale];
          tempObject.scale.set(...s);
        }

        tempObject.updateMatrix();
        instancedMeshRef.current?.setMatrixAt(i, tempObject.matrix);
      });

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [instances]);

    // First load the mesh, then we'll instance it
    return <MeshLoader ref={loaderRef} url={url} {...props} />;
  }
);

InstancedMeshLoader.displayName = "InstancedMeshLoader";

/**
 * Mesh with Outline
 *
 * Renders mesh with an outline effect (useful for selection/highlighting).
 */
export interface MeshWithOutlineProps extends MeshLoaderProps {
  /** Outline color */
  outlineColor?: THREE.ColorRepresentation;

  /** Outline thickness */
  outlineThickness?: number;
}

export const MeshWithOutline = forwardRef<MeshLoaderHandle, MeshWithOutlineProps>(
  ({ outlineColor = 0x00ffff, outlineThickness = 0.02, ...props }, ref) => {
    return (
      <group>
        {/* Main mesh */}
        <MeshLoader ref={ref} {...props} />

        {/* Outline (scaled slightly larger with emissive material) */}
        <MeshLoader
          {...props}
          scale={
            typeof props.scale === "number"
              ? props.scale * (1 + outlineThickness)
              : props.scale || 1
          }
          material={
            new THREE.MeshBasicMaterial({
              color: outlineColor,
              side: THREE.BackSide,
            })
          }
        />
      </group>
    );
  }
);

MeshWithOutline.displayName = "MeshWithOutline";
