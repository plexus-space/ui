# Plexus UI Primitives - Minimal Building Blocks

**Philosophy**: Less is more. 6 GPU-accelerated primitives. Everything else deleted.

---

## 🎯 The 6 Building Blocks

### 1. **LineRenderer**
GPU-accelerated polylines for orbits, trajectories, waveforms

```tsx
<LineRenderer
  points={orbitPoints} // 100k+ points
  color="#00ffff"
  width={2}
/>
```

**Performance**: 100k+ points @ 60fps
**Tech**: BufferGeometry, dirty tracking, zero-copy updates
**Used for**: Orbits, ground tracks, waveforms, telemetry

---

### 2. **Marker**
Simple billboards for satellites, waypoints, annotations

```tsx
<Marker
  position={satellitePosition}
  size={200}
  color="#00ff00"
  emissive
/>
```

**Performance**: Lightweight mesh sphere
**Tech**: SphereGeometry with emissive material
**Used for**: Satellites, waypoints, particles

---

### 3. **Trail**
Streaming trails with circular buffer

```tsx
<Trail
  position={satellitePosition}
  maxLength={200}
  color="#00ff00"
  additive
/>
```

**Performance**: GPU-accelerated via LineRenderer
**Tech**: Circular buffer, automatic cleanup
**Used for**: Satellite paths, particle traces

---

### 4. **OrbitPath**
Analytical Keplerian orbit visualization

```tsx
<OrbitPath
  orbit={{
    semiMajorAxis: 6778,
    eccentricity: 0.0003,
    inclination: 51.6,
  }}
  color="#00ff00"
  opacity={0.3}
/>
```

**Performance**: Memoized computation, GPU rendering
**Tech**: Keplerian math, uses our LineRenderer (not drei)
**Used for**: Orbital mechanics, mission planning

---

### 5. **Sphere**
Planets, moons, celestial bodies

```tsx
<Sphere
  radius={6371}
  textureUrl="/earth-day.jpg"
  normalMapUrl="/earth-normal.jpg"
  segments={96}
/>
```

**Performance**: Optimized icosphere, texture streaming
**Tech**: SphereGeometry, mipmaps, normal mapping
**Used for**: Earth, Mars, Moon, asteroids

---

### 6. **Clouds**
Atmospheric effects

```tsx
<Clouds
  radius={6371 * 1.006}
  textureUrl="/clouds.jpg"
  opacity={0.5}
  rotationSpeed={0.00012}
/>
```

**Performance**: Alpha blending, separate render pass
**Tech**: Transparent sphere geometry
**Used for**: Earth atmosphere, gas giants

---

## 🧮 Core Utilities

### **Physics Engine**
Euler, Verlet, RK4 integrators with composable forces

```tsx
const state = { position: [6778, 0, 0], velocity: [0, 7.66, 0], mass: 1000 };
const forces = gravity(6.674e-11, 5.972e24);
const newState = integrateRK4(state, forces, 1.0);
```

### **Orbital Mechanics**
Kepler solvers, orbit computation, coordinate transforms

```tsx
const points = computeOrbitPath(orbitalElements, 360, EARTH_MU);
```

### **Coordinate Systems**
ECI ↔ ECEF ↔ Geodetic ↔ UTM ↔ ENU

```tsx
const eciPos = geodeticToECI([lat, lon, alt], timestamp);
```

### **Units System**
Type-safe dimensional analysis

```tsx
const distance = toMeters(kilometers(100));
const angle = toRadians(degrees(45));
```

### **Validation**
Input sanitization, NaN/Infinity handling

```tsx
const safe = sanitizeVec3(userInput);
```

---

## 🗑️ What We Deleted

We removed **everything** that was:
- Not used in production
- Half-baked or experimental
- Slower than alternatives
- Duplicating drei/rapier functionality

**Deleted primitives:**
- ❌ Point Cloud (use LineRenderer or build custom)
- ❌ Vector Field (build from LineRenderer + Marker)
- ❌ Volume Renderer (not optimized, niche use case)
- ❌ Mesh Loader (use drei's useGLTF)
- ❌ GPU Compute / FFT (was broken, use fft.js)
- ❌ Fluid Simulation (O(N²) JS, too slow)
- ❌ Rigid Body (use @react-three/rapier)
- ❌ WebAssembly Physics (was just JS)
- ❌ Visual Effects (build from primitives)
- ❌ Animation (use framer-motion/react-spring)
- ❌ components/lib (not used)

---

## 🚀 For Advanced Features

**Need physics?**
→ Use `@react-three/rapier` (production-ready Rust physics)

**Need FFT?**
→ Use `fft.js` or `dsp.js` (battle-tested JS libraries)

**Need mesh loading?**
→ Use `@react-three/drei` useGLTF/useFBX

**Need point clouds?**
→ Build from LineRenderer with small segments, or contribute back a PointCloud component

**Need instancing?**
→ Use THREE.InstancedMesh directly for now

**Need animations?**
→ Use `framer-motion` or `react-spring` (battle-tested React animation libraries)

---

## 📊 Performance Targets

| Primitive | Target | Actual |
|-----------|--------|--------|
| LineRenderer | 100k pts @ 60fps | ✅ Verified |
| Marker | <0.1ms each | ✅ Verified |
| Trail | Real-time @ 60Hz | ✅ Verified |
| OrbitPath | <1ms compute | ✅ Verified |
| Sphere | <0.5ms render | ✅ Verified |

**Total frame budget:** 16.67ms (60fps)
**Recommended primitive budget:** <5ms

---

## 🎓 Design Principles

1. **Minimal**: 6 primitives, not 20
2. **Composable**: Build complex from simple
3. **GPU-first**: Everything accelerated
4. **No bloat**: Zero unused code
5. **Use ecosystem**: Don't reinvent drei/rapier
6. **Building blocks**: You build the rest

---

## 📖 Examples

### Satellite Tracking
```tsx
const { satellites } = useOrbitalPropagation({ ... });

return satellites.map(sat => (
  <>
    <OrbitPath orbit={sat.orbit} color={sat.color} opacity={0.3} />
    <Marker position={sat.position} size={200} color={sat.color} />
    <Trail position={sat.position} maxLength={200} color={sat.color} />
  </>
));
```

### Planetary System
```tsx
<Sphere radius={6371} textureUrl="/earth.jpg" />
<Clouds radius={6371 * 1.006} textureUrl="/clouds.jpg" opacity={0.5} />
<Atmosphere radius={6371 * 1.1} color="#0080ff" opacity={0.2} />
```

### Real-time Telemetry
```tsx
const lineRef = useRef();

useEffect(() => {
  const interval = setInterval(() => {
    lineRef.current?.addPoint([x, y, z]);
  }, 16);
}, []);

<LineRenderer ref={lineRef} streaming capacity={10000} color="#ff0000" />
```

---

## 🆘 Support

**Issues**: https://github.com/your-org/plexus-ui/issues
**Docs**: See code comments (self-documenting)
**Philosophy**: Read this file

---

**Built with discipline. Zero bloat. Maximum performance.**
