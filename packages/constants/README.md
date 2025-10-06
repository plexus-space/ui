# @plexusui/constants

Shared physical and orbital constants for Plexus UI aerospace components.

## Installation

```bash
npm install @plexusui/constants
```

## Usage

```tsx
import { CELESTIAL_BODIES, ORBITAL_CONSTANTS, COMMON_ORBITS } from '@plexusui/constants';

// Get Earth's radius
const earthRadius = CELESTIAL_BODIES.EARTH.RADIUS_KM; // 6371

// Calculate orbital period
const mu = CELESTIAL_BODIES.EARTH.MU; // 398600 km³/s²

// Use common orbit parameters
const issAltitude = COMMON_ORBITS.ISS.ALTITUDE_KM; // 408
```

## Constants

### CELESTIAL_BODIES

Physical properties for:
- Earth, Mars, Mercury, Venus, Moon
- Jupiter, Saturn, Uranus, Neptune
- Sun

Each includes: radius, mass, gravitational parameter (μ), rotation period, orbital period, axial tilt, and more.

### ORBITAL_CONSTANTS

- `AU_KM`: Astronomical Unit in kilometers
- `G`: Gravitational constant
- `C`: Speed of light
- Conversion factors (degrees/radians, time units)

### COMMON_ORBITS

Predefined orbital parameters:
- LEO (Low Earth Orbit)
- MEO (Medium Earth Orbit)
- GEO (Geostationary Orbit)
- ISS (International Space Station)
- HUBBLE (Hubble Space Telescope)

## License

MIT
