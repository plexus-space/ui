"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Box, Cylinder } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface Skatepark3DProps {
  pitch: number;
  roll: number;
  heading: number;
  isAirborne: boolean;
}

function Skateboard({ pitch, roll, heading, isAirborne }: Skatepark3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Convert degrees to radians
  const pitchRad = (pitch * Math.PI) / 180;
  const rollRad = (roll * Math.PI) / 180;
  const headingRad = (heading * Math.PI) / 180;

  // Calculate height based on airborne status
  const height = isAirborne ? 1.5 : 0.2;

  return (
    <group
      ref={groupRef}
      position={[0, height, 0]}
      rotation={[pitchRad, headingRad, rollRad]}
    >
      {/* Skateboard deck */}
      <Box args={[0.8, 0.05, 2.5]} castShadow receiveShadow>
        <meshStandardMaterial
          color={isAirborne ? "#fbbf24" : "#8b5cf6"}
          metalness={0.3}
          roughness={0.4}
        />
      </Box>

      {/* Nose curve indicator */}
      <Box args={[0.6, 0.04, 0.3]} position={[0, 0.03, 1.1]} castShadow>
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.3} />
      </Box>

      {/* Tail curve indicator */}
      <Box args={[0.6, 0.04, 0.3]} position={[0, 0.03, -1.1]} castShadow>
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.3} />
      </Box>

      {/* Wheels */}
      <Wheels />

      {/* Direction arrow */}
      <mesh position={[0, 0.05, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Wheels() {
  return (
    <>
      {/* Front wheels */}
      <group position={[0.3, -0.05, 0.9]}>
        <Cylinder args={[0.08, 0.08, 0.15, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#1f2937" />
        </Cylinder>
      </group>
      <group position={[-0.3, -0.05, 0.9]}>
        <Cylinder args={[0.08, 0.08, 0.15, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#1f2937" />
        </Cylinder>
      </group>

      {/* Back wheels */}
      <group position={[0.3, -0.05, -0.9]}>
        <Cylinder args={[0.08, 0.08, 0.15, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#1f2937" />
        </Cylinder>
      </group>
      <group position={[-0.3, -0.05, -0.9]}>
        <Cylinder args={[0.08, 0.08, 0.15, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#1f2937" />
        </Cylinder>
      </group>
    </>
  );
}

function Ramp({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <Box args={[3, 0.2, 4]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#4b5563" metalness={0.1} roughness={0.8} />
      </Box>
      <Box args={[3, 1.5, 0.2]} position={[0, 0.75, -2]} receiveShadow>
        <meshStandardMaterial color="#374151" metalness={0.1} roughness={0.8} />
      </Box>
      <Box args={[0.2, 1.5, 4]} position={[1.5, 0.75, 0]} receiveShadow>
        <meshStandardMaterial color="#374151" metalness={0.1} roughness={0.8} />
      </Box>
      <Box args={[0.2, 1.5, 4]} position={[-1.5, 0.75, 0]} receiveShadow>
        <meshStandardMaterial color="#374151" metalness={0.1} roughness={0.8} />
      </Box>
    </group>
  );
}

function Rail({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder args={[0.08, 0.08, 4, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Support poles */}
      <Cylinder args={[0.05, 0.05, 0.5, 8]} position={[-1.5, -0.25, 0]}>
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.5, 8]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.5, 8]} position={[1.5, -0.25, 0]}>
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
      </Cylinder>
    </group>
  );
}

function SkateparkScene({ pitch, roll, heading, isAirborne }: Skatepark3DProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#60a5fa" />

      <Skateboard pitch={pitch} roll={roll} heading={heading} isAirborne={isAirborne} />

      {/* Ground */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#374151"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#4b5563"
        fadeDistance={25}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1f2937" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Ramps */}
      <Ramp position={[5, 0, 5]} rotation={[0, Math.PI / 4, 0]} />
      <Ramp position={[-5, 0, -5]} rotation={[0, -Math.PI / 4, 0]} />

      {/* Rails */}
      <Rail position={[-6, 0.5, 3]} />
      <Rail position={[6, 0.5, -3]} />

      {/* Quarter pipe */}
      <mesh position={[0, 0.5, -8]} rotation={[Math.PI / 6, 0, 0]} receiveShadow>
        <boxGeometry args={[5, 2, 0.3]} />
        <meshStandardMaterial color="#4b5563" metalness={0.1} roughness={0.8} />
      </mesh>
    </>
  );
}

export default function Skatepark3D(props: Skatepark3DProps) {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[5, 4, 5]} />
      <SkateparkScene {...props} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
