/**
 * Matrix Math - 4x4 Transformation Matrices
 *
 * Provides matrix operations for 3D transformations used in WebGPU rendering.
 * All matrices are column-major (WebGPU/OpenGL convention).
 *
 * @reference Dunn, F. & Parberry, I. (2011). 3D Math Primer for Graphics and Game Development
 * @reference Shirley, P. & Marschner, S. (2009). Fundamentals of Computer Graphics
 */

// ============================================================================
// Types
// ============================================================================

/**
 * 4x4 Matrix (column-major layout for WebGPU/OpenGL)
 * [m0, m4, m8,  m12]
 * [m1, m5, m9,  m13]
 * [m2, m6, m10, m14]
 * [m3, m7, m11, m15]
 */
export type Mat4 = readonly [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

/**
 * 3x3 Matrix (column-major layout)
 */
export type Mat3 = readonly [
  number, number, number,
  number, number, number,
  number, number, number
];

// ============================================================================
// Mat4 Creation
// ============================================================================

/**
 * Create identity matrix
 */
export function mat4Identity(): Mat4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

/**
 * Create translation matrix
 */
export function mat4Translate(x: number, y: number, z: number): Mat4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,
  ];
}

/**
 * Create scale matrix
 */
export function mat4Scale(x: number, y: number, z: number): Mat4 {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ];
}

/**
 * Create rotation matrix around X axis
 * @param angle Angle in radians
 */
export function mat4RotateX(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    1, 0,  0, 0,
    0, c,  s, 0,
    0, -s, c, 0,
    0, 0,  0, 1,
  ];
}

/**
 * Create rotation matrix around Y axis
 * @param angle Angle in radians
 */
export function mat4RotateY(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, 0, -s, 0,
    0, 1,  0, 0,
    s, 0,  c, 0,
    0, 0,  0, 1,
  ];
}

/**
 * Create rotation matrix around Z axis
 * @param angle Angle in radians
 */
export function mat4RotateZ(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
     c, s, 0, 0,
    -s, c, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1,
  ];
}

// ============================================================================
// Mat4 View & Projection
// ============================================================================

/**
 * Create look-at view matrix
 * @param eye Camera position
 * @param target Target position to look at
 * @param up Up vector (typically [0, 1, 0])
 */
export function mat4LookAt(
  eye: readonly [number, number, number],
  target: readonly [number, number, number],
  up: readonly [number, number, number]
): Mat4 {
  // Calculate forward vector (from eye to target)
  let fx = target[0] - eye[0];
  let fy = target[1] - eye[1];
  let fz = target[2] - eye[2];

  // Normalize forward
  const fLen = Math.sqrt(fx * fx + fy * fy + fz * fz);
  if (fLen > 0) {
    fx /= fLen;
    fy /= fLen;
    fz /= fLen;
  }

  // Calculate right vector (cross product: forward × up)
  let rx = fy * up[2] - fz * up[1];
  let ry = fz * up[0] - fx * up[2];
  let rz = fx * up[1] - fy * up[0];

  // Normalize right
  const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz);
  if (rLen > 0) {
    rx /= rLen;
    ry /= rLen;
    rz /= rLen;
  }

  // Calculate up vector (cross product: right × forward)
  const ux = ry * fz - rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy - ry * fx;

  // Create view matrix (inverse of camera transform)
  return [
    rx, ux, -fx, 0,
    ry, uy, -fy, 0,
    rz, uz, -fz, 0,
    -(rx * eye[0] + ry * eye[1] + rz * eye[2]),
    -(ux * eye[0] + uy * eye[1] + uz * eye[2]),
    -(-fx * eye[0] - fy * eye[1] - fz * eye[2]),
    1,
  ];
}

/**
 * Create perspective projection matrix
 * @param fov Field of view in radians
 * @param aspect Aspect ratio (width / height)
 * @param near Near clipping plane distance
 * @param far Far clipping plane distance
 */
export function mat4Perspective(
  fov: number,
  aspect: number,
  near: number,
  far: number
): Mat4 {
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ];
}

/**
 * Create orthographic projection matrix
 * @param left Left clipping plane
 * @param right Right clipping plane
 * @param bottom Bottom clipping plane
 * @param top Top clipping plane
 * @param near Near clipping plane
 * @param far Far clipping plane
 */
export function mat4Orthographic(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number
): Mat4 {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);

  return [
    -2 * lr, 0, 0, 0,
    0, -2 * bt, 0, 0,
    0, 0, 2 * nf, 0,
    (left + right) * lr,
    (top + bottom) * bt,
    (far + near) * nf,
    1,
  ];
}

// ============================================================================
// Mat4 Operations
// ============================================================================

/**
 * Multiply two 4x4 matrices (A × B)
 */
export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const result: number[] = new Array(16);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[j * 4 + i] =
        a[0 * 4 + i] * b[j * 4 + 0] +
        a[1 * 4 + i] * b[j * 4 + 1] +
        a[2 * 4 + i] * b[j * 4 + 2] +
        a[3 * 4 + i] * b[j * 4 + 3];
    }
  }

  return result as Mat4;
}

/**
 * Transpose a 4x4 matrix
 */
export function mat4Transpose(m: Mat4): Mat4 {
  return [
    m[0], m[4], m[8],  m[12],
    m[1], m[5], m[9],  m[13],
    m[2], m[6], m[10], m[14],
    m[3], m[7], m[11], m[15],
  ];
}

/**
 * Invert a 4x4 matrix
 * @returns Inverted matrix, or identity if matrix is singular
 */
export function mat4Invert(m: Mat4): Mat4 {
  const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
  const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
  const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
  const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (Math.abs(det) < 1e-10) {
    // Matrix is singular, return identity
    return mat4Identity();
  }

  det = 1.0 / det;

  return [
    (a11 * b11 - a12 * b10 + a13 * b09) * det,
    (a02 * b10 - a01 * b11 - a03 * b09) * det,
    (a31 * b05 - a32 * b04 + a33 * b03) * det,
    (a22 * b04 - a21 * b05 - a23 * b03) * det,
    (a12 * b08 - a10 * b11 - a13 * b07) * det,
    (a00 * b11 - a02 * b08 + a03 * b07) * det,
    (a32 * b02 - a30 * b05 - a33 * b01) * det,
    (a20 * b05 - a22 * b02 + a23 * b01) * det,
    (a10 * b10 - a11 * b08 + a13 * b06) * det,
    (a01 * b08 - a00 * b10 - a03 * b06) * det,
    (a30 * b04 - a31 * b02 + a33 * b00) * det,
    (a21 * b02 - a20 * b04 - a23 * b00) * det,
    (a11 * b07 - a10 * b09 - a12 * b06) * det,
    (a00 * b09 - a01 * b07 + a02 * b06) * det,
    (a31 * b01 - a30 * b03 - a32 * b00) * det,
    (a20 * b03 - a21 * b01 + a22 * b00) * det,
  ];
}

// ============================================================================
// Mat3 Operations (for normal transforms)
// ============================================================================

/**
 * Extract 3x3 normal matrix from 4x4 model-view matrix
 * Normal matrix = transpose(inverse(upper-left 3x3 of model-view))
 */
export function mat3FromMat4(m: Mat4): Mat3 {
  return [
    m[0], m[1], m[2],
    m[4], m[5], m[6],
    m[8], m[9], m[10],
  ];
}

/**
 * Create normal matrix from model-view matrix
 * Used to transform normals correctly (handles non-uniform scaling)
 */
export function mat3NormalMatrix(modelView: Mat4): Mat3 {
  // Extract upper-left 3x3
  const m = mat3FromMat4(modelView);

  // Calculate determinant
  const a00 = m[0], a01 = m[1], a02 = m[2];
  const a10 = m[3], a11 = m[4], a12 = m[5];
  const a20 = m[6], a21 = m[7], a22 = m[8];

  const b01 = a22 * a11 - a12 * a21;
  const b11 = -a22 * a10 + a12 * a20;
  const b21 = a21 * a10 - a11 * a20;

  let det = a00 * b01 + a01 * b11 + a02 * b21;

  if (Math.abs(det) < 1e-10) {
    // Singular matrix, return identity
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  det = 1.0 / det;

  // Compute inverse and transpose (which is the normal matrix)
  return [
    b01 * det,
    (-a22 * a01 + a02 * a21) * det,
    (a12 * a01 - a02 * a11) * det,
    b11 * det,
    (a22 * a00 - a02 * a20) * det,
    (-a12 * a00 + a02 * a10) * det,
    b21 * det,
    (-a21 * a00 + a01 * a20) * det,
    (a11 * a00 - a01 * a10) * det,
  ];
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Convert Mat4 to Float32Array for WebGPU
 */
export function mat4ToArray(m: Mat4): Float32Array {
  return new Float32Array(m);
}

/**
 * Convert Mat3 to Float32Array for WebGPU
 */
export function mat3ToArray(m: Mat3): Float32Array {
  return new Float32Array(m);
}
