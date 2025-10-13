"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * GPU Compute Shaders
 *
 * WebGL compute pipelines for high-performance signal processing and analysis.
 * Used by: Spectrograms, FFT analysis, image processing, convolution, filtering.
 *
 * Features:
 * - Fast Fourier Transform (FFT) on GPU
 * - 2D Convolution for image processing
 * - Custom compute shaders
 * - Efficient texture-based data transfer
 *
 * Note: WebGL 2.0 doesn't have compute shaders like WebGPU, so we use
 * fragment shaders with render-to-texture as a workaround.
 */

// ============================================================================
// FFT (Fast Fourier Transform)
// ============================================================================

/**
 * GPU-accelerated FFT
 *
 * ⚠️ **WARNING: This implementation has known issues and should not be used in production**
 *
 * Known issues:
 * - Missing bit-reversal ordering of input data
 * - Incorrect twiddle factor calculation in shader
 * - Ping-pong buffer swap logic is broken
 * - No vertex buffer setup for draw calls
 *
 * **Recommendation**: Use a CPU-based FFT library like `fft.js` or `dsp.js` until this is fixed.
 *
 * @deprecated Use CPU-based FFT libraries instead
 */
export interface GPUFFTInstance {
  init: (canvas: HTMLCanvasElement) => void;
  compute: (data: Float32Array) => Float32Array;
  dispose: () => void;
}

export const createGPUFFT = (size: number): GPUFFTInstance => {
  if (!isPowerOfTwo(size)) {
    throw new Error("FFT size must be a power of 2");
  }

  // Warn users about known issues
  console.warn(
    "[GPU FFT] This implementation has known bugs and produces incorrect results. " +
    "Please use a CPU-based FFT library like 'fft.js' or 'dsp.js' instead. " +
    "See gpu-compute.tsx:26-35 for details."
  );

  let gl: WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let framebuffer: WebGLFramebuffer | null = null;
  let dataTexture: WebGLTexture | null = null;
  let outputTexture: WebGLTexture | null = null;

  const createShaders = (): void => {
    if (!gl) return;

    const vertexShader = `#version 300 es
      in vec2 position;
      out vec2 vUv;

      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `#version 300 es
      precision highp float;

      in vec2 vUv;
      out vec4 fragColor;

      uniform sampler2D uData;
      uniform int uStage;
      uniform int uSize;

      vec2 complexMult(vec2 a, vec2 b) {
        return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
      }

      void main() {
        int idx = int(vUv.x * float(uSize));
        int pairDistance = 1 << uStage;
        int blockSize = pairDistance * 2;
        int pairIndex = idx / blockSize;
        int indexInPair = idx % blockSize;

        bool isTop = indexInPair < pairDistance;
        int otherIdx = isTop ? (idx + pairDistance) : (idx - pairDistance);

        vec2 a = texture(uData, vec2(float(idx) / float(uSize), 0.5)).xy;
        vec2 b = texture(uData, vec2(float(otherIdx) / float(uSize), 0.5)).xy;

        float angle = -2.0 * 3.14159265359 * float(indexInPair) / float(blockSize);
        vec2 twiddle = vec2(cos(angle), sin(angle));
        vec2 bTwiddle = complexMult(b, twiddle);

        vec2 result = isTop ? (a + bTwiddle) : (a - bTwiddle);
        fragColor = vec4(result, 0.0, 1.0);
      }
    `;

    program = createProgram(gl, vertexShader, fragmentShader);
  };

  const createTextures = (): void => {
    if (!gl) return;

    // Data texture
    dataTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RG32F,
      size,
      1,
      0,
      gl.RG,
      gl.FLOAT,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Output texture
    outputTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, outputTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RG32F,
      size,
      1,
      0,
      gl.RG,
      gl.FLOAT,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  };

  const createFramebuffer = (): void => {
    if (!gl) return;
    framebuffer = gl.createFramebuffer();
  };

  const uploadData = (data: Float32Array): void => {
    if (!gl || !dataTexture) return;

    // Convert to complex format (real, imaginary pairs)
    const complexData = new Float32Array(size * 2);
    for (let i = 0; i < size; i++) {
      complexData[i * 2] = data[i] || 0;
      complexData[i * 2 + 1] = 0; // Imaginary part
    }

    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RG32F,
      size,
      1,
      0,
      gl.RG,
      gl.FLOAT,
      complexData
    );
  };

  const executeFftPass = (stage: number): void => {
    if (!gl || !program || !framebuffer || !outputTexture) return;

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      outputTexture,
      0
    );

    gl.useProgram(program);

    // Set uniforms
    const stageLocation = gl.getUniformLocation(program, "uStage");
    const sizeLocation = gl.getUniformLocation(program, "uSize");
    gl.uniform1i(stageLocation, stage);
    gl.uniform1i(sizeLocation, size);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Swap textures for next pass
    [dataTexture, outputTexture] = [outputTexture, dataTexture];
  };

  const readResults = (): Float32Array => {
    if (!gl || !framebuffer) {
      return new Float32Array(size * 2);
    }

    const pixels = new Float32Array(size * 4); // RGBA
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.readPixels(0, 0, size, 1, gl.RGBA, gl.FLOAT, pixels);

    // Extract complex data
    const result = new Float32Array(size * 2);
    for (let i = 0; i < size; i++) {
      result[i * 2] = pixels[i * 4]; // Real
      result[i * 2 + 1] = pixels[i * 4 + 1]; // Imaginary
    }

    return result;
  };

  return {
    init: (canvas: HTMLCanvasElement): void => {
      gl = canvas.getContext("webgl2");
      if (!gl) {
        throw new Error("WebGL 2.0 not supported");
      }

      createShaders();
      createTextures();
      createFramebuffer();
    },

    compute: (data: Float32Array): Float32Array => {
      if (!gl || !program) {
        throw new Error("FFT not initialized");
      }

      // Upload data to texture
      uploadData(data);

      // Execute FFT passes
      const stages = Math.log2(size);
      for (let stage = 0; stage < stages; stage++) {
        executeFftPass(stage);
      }

      // Read back results
      return readResults();
    },

    dispose: (): void => {
      if (gl) {
        if (program) gl.deleteProgram(program);
        if (dataTexture) gl.deleteTexture(dataTexture);
        if (outputTexture) gl.deleteTexture(outputTexture);
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
      }
    },
  };
};

// ============================================================================
// 2D Convolution
// ============================================================================

/**
 * GPU-accelerated 2D convolution
 *
 * Used for image filtering, edge detection, blurring, etc.
 */
export interface GPUConvolutionInstance {
  convolve: (inputTexture: THREE.Texture, kernel: number[][]) => THREE.Texture;
  dispose: () => void;
}

export const createGPUConvolution = (
  width: number,
  height: number
): GPUConvolutionInstance => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      uKernel: { value: [] },
      uKernelSize: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tInput;
      uniform float uKernel[25];
      uniform int uKernelSize;
      uniform vec2 uResolution;
      varying vec2 vUv;

      void main() {
        vec4 sum = vec4(0.0);
        int halfSize = uKernelSize / 2;

        for (int y = 0; y < 5; y++) {
          for (int x = 0; x < 5; x++) {
            if (x >= uKernelSize || y >= uKernelSize) continue;

            vec2 offset = vec2(
              float(x - halfSize) / uResolution.x,
              float(y - halfSize) / uResolution.y
            );

            vec4 sample = texture2D(tInput, vUv + offset);
            float kernelValue = uKernel[y * 5 + x];
            sum += sample * kernelValue;
          }
        }

        gl_FragColor = sum;
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    convolve: (inputTexture: THREE.Texture, kernel: number[][]): THREE.Texture => {
      const kernelSize = kernel.length;
      const flatKernel = kernel.flat();

      // Pad to max size (5x5)
      while (flatKernel.length < 25) {
        flatKernel.push(0);
      }

      material.uniforms.tInput.value = inputTexture;
      material.uniforms.uKernel.value = flatKernel;
      material.uniforms.uKernelSize.value = kernelSize;

      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      return renderTarget.texture;
    },

    dispose: (): void => {
      renderTarget.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
};

// ============================================================================
// Predefined Kernels
// ============================================================================

export const KERNELS = {
  /** Gaussian blur (3x3) */
  GAUSSIAN_BLUR_3X3: [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ].map((row) => row.map((v) => v / 16)),

  /** Gaussian blur (5x5) */
  GAUSSIAN_BLUR_5X5: [
    [1, 4, 6, 4, 1],
    [4, 16, 24, 16, 4],
    [6, 24, 36, 24, 6],
    [4, 16, 24, 16, 4],
    [1, 4, 6, 4, 1],
  ].map((row) => row.map((v) => v / 256)),

  /** Sharpen */
  SHARPEN: [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ],

  /** Edge detection (Sobel X) */
  SOBEL_X: [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ],

  /** Edge detection (Sobel Y) */
  SOBEL_Y: [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ],

  /** Laplacian (edge detection) */
  LAPLACIAN: [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ],

  /** Emboss */
  EMBOSS: [
    [-2, -1, 0],
    [-1, 1, 1],
    [0, 1, 2],
  ],
};

// ============================================================================
// Utilities
// ============================================================================

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * React hook for GPU FFT
 *
 * ⚠️ **WARNING: Known bugs - do not use in production**
 *
 * @deprecated Use CPU-based FFT libraries instead
 */
export function useGPUFFT(size: number = 1024) {
  const fftRef = useRef<GPUFFTInstance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = 1;
      canvasRef.current = canvas;
    }

    fftRef.current = createGPUFFT(size);
    fftRef.current.init(canvasRef.current);

    return () => {
      fftRef.current?.dispose();
    };
  }, [size]);

  const compute = (data: Float32Array): Float32Array => {
    if (!fftRef.current) {
      throw new Error("FFT not initialized");
    }
    return fftRef.current.compute(data);
  };

  return { compute };
}

/**
 * React hook for GPU Convolution
 */
export function useGPUConvolution(width: number, height: number) {
  const convolutionRef = useRef<GPUConvolutionInstance | null>(null);

  useEffect(() => {
    convolutionRef.current = createGPUConvolution(width, height);

    return () => {
      convolutionRef.current?.dispose();
    };
  }, [width, height]);

  const convolve = (
    texture: THREE.Texture,
    kernel: number[][]
  ): THREE.Texture => {
    if (!convolutionRef.current) {
      throw new Error("Convolution not initialized");
    }
    return convolutionRef.current.convolve(texture, kernel);
  };

  return { convolve, kernels: KERNELS };
}
