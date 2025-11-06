"use client";

/**
 * MSDF Text Renderer - Modern Functional Architecture
 *
 * Multi-channel Signed Distance Field text rendering for crisp text at any scale.
 * Requires pre-generated MSDF font atlas and JSON descriptor.
 *
 * To generate MSDF fonts:
 * ```bash
 * npm install -g msdf-bmfont-xml
 * msdf-bmfont -f json -m 512,512 -s 48 font.ttf
 * ```
 */

import * as React from "react";
import { getWebGPUDevice, isWebGPUAvailable } from "./device";

import msdfTextShader from "./shaders/msdf-text.wgsl";

// ============================================================================
// Types & Constants
// ============================================================================

export interface MsdfChar {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly xoffset: number;
  readonly yoffset: number;
  readonly xadvance: number;
  readonly page: number;
}

export interface MsdfKerning {
  readonly first: number;
  readonly second: number;
  readonly amount: number;
}

export interface MsdfFontJson {
  readonly pages: ReadonlyArray<string>;
  readonly chars: ReadonlyArray<MsdfChar>;
  readonly common: {
    readonly lineHeight: number;
    readonly scaleW: number;
    readonly scaleH: number;
  };
  readonly kernings?: ReadonlyArray<MsdfKerning>;
}

export interface TextLabel {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly color?: readonly [number, number, number, number];
  readonly scale?: number;
}

export interface MsdfTextRendererProps {
  readonly canvas: HTMLCanvasElement;
  readonly labels: ReadonlyArray<TextLabel>;
  readonly fontJsonUrl: string;
  readonly width: number;
  readonly height: number;
  readonly pixelScale?: number;
  readonly onReady?: () => void;
  readonly onError?: (error: Error) => void;
}

interface RendererConfig {
  readonly width: number;
  readonly height: number;
  readonly pixelScale: number;
}

interface FontData {
  readonly json: MsdfFontJson;
  readonly charMap: Map<number, MsdfChar>;
  readonly charIndexMap: Map<number, number>; // Add this
  readonly texture: GPUTexture;
  readonly charsBuffer: GPUBuffer;
}

interface RendererState {
  readonly device: GPUDevice;
  readonly context: GPUCanvasContext;
  readonly pipeline: GPURenderPipeline;
  readonly sampler: GPUSampler;
  readonly uniformBuffer: GPUBuffer;
  readonly config: RendererConfig;
  readonly fontData?: FontData;
  readonly bindGroup?: GPUBindGroup;
  readonly instanceBuffer?: GPUBuffer;
  readonly instanceCount: number;
}

// Constants
const DEFAULT_PIXEL_SCALE = 1 / 512; // Matches reference implementation
const DEFAULT_COLOR: readonly [number, number, number, number] = [1, 1, 1, 1];
const INSTANCE_STRIDE = 12; // floats per instance
const CHAR_DATA_STRIDE = 8; // floats per character
const SPACE_CHAR_CODE = 32;

// ============================================================================
// Pure Utility Functions
// ============================================================================

const createCharMap = (
  chars: ReadonlyArray<MsdfChar>
): Map<number, MsdfChar> => {
  const map = new Map<number, MsdfChar>();
  for (const char of chars) {
    map.set(char.id, char);
  }
  return map;
};

const createUniformData = (config: RendererConfig): Float32Array =>
  new Float32Array([
    config.width,
    config.height,
    config.pixelScale,
    0, // padding
  ]);

const createCharsArray = (fontData: MsdfFontJson): Float32Array => {
  const charCount = fontData.chars.length;
  const charsArray = new Float32Array(charCount * CHAR_DATA_STRIDE);

  const u = 1 / fontData.common.scaleW;
  const v = 1 / fontData.common.scaleH;

  let offset = 0;
  for (const char of fontData.chars) {
    charsArray[offset] = char.x * u;
    charsArray[offset + 1] = char.y * v;
    charsArray[offset + 2] = char.width * u;
    charsArray[offset + 3] = char.height * v;
    charsArray[offset + 4] = char.width;
    charsArray[offset + 5] = char.height;
    charsArray[offset + 6] = char.xoffset;
    charsArray[offset + 7] = -char.yoffset; // Negate for screen coords (Y down)
    offset += CHAR_DATA_STRIDE;
  }

  return charsArray;
};

const createInstanceData = (
  labels: ReadonlyArray<TextLabel>,
  fontData: FontData,
  pixelScale: number
): Float32Array => {
  const instances: number[] = [];

  for (const label of labels) {
    const color = label.color ?? DEFAULT_COLOR;
    const scale = label.scale ?? 1.0;

    let xOffset = 0;
    for (let i = 0; i < label.text.length; i++) {
      const charCode = label.text.charCodeAt(i);

      // Handle spaces - just advance the cursor
      if (charCode === SPACE_CHAR_CODE) {
        // Use a default space width or get it from the font
        const spaceChar = fontData.charMap.get(SPACE_CHAR_CODE);
        if (spaceChar) {
          xOffset += spaceChar.xadvance * pixelScale * scale;
        } else {
          // Default space width (you might want to adjust this)
          xOffset += 20 * pixelScale * scale;
        }
        continue;
      }

      const char = fontData?.charMap?.get(charCode);
      if (!char) {
        console.warn(
          `Character not found in font: ${String.fromCharCode(
            charCode
          )} (${charCode})`
        );
        continue;
      }

      // Use the index map to get the correct index
      const charIndex = fontData?.charIndexMap?.get(charCode);
      if (charIndex === undefined) {
        console.warn(
          `Character index not found: ${String.fromCharCode(
            charCode
          )} (${charCode})`
        );
        continue;
      }

      const posX = label.x + xOffset;
      const posY = label.y;

      // Debug logging
      if (instances.length / INSTANCE_STRIDE < 5) {
        console.log(`[MSDF] Char #${instances.length / INSTANCE_STRIDE}:`, {
          char: String.fromCharCode(charCode),
          charCode,
          charIndex,
          posX,
          posY,
          xOffset,
          advance: char.xadvance,
          scale,
        });
      }

      // TextInstance struct layout
      instances.push(
        posX,
        posY,
        charIndex,
        0, // padding
        color[0],
        color[1],
        color[2],
        color[3],
        scale,
        0, // padding
        0, // padding
        0 // padding
      );

      xOffset += char.xadvance * pixelScale * scale;
    }
  }

  return new Float32Array(instances);
};

// ============================================================================
// Pipeline Creation
// ============================================================================

const createBindGroupLayout = (device: GPUDevice): GPUBindGroupLayout =>
  device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      {
        binding: 2,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "read-only-storage" },
      },
      {
        binding: 3,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "uniform" },
      },
      {
        binding: 4,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: "read-only-storage" },
      },
    ],
  });

const createPipeline = (
  device: GPUDevice,
  format: GPUTextureFormat
): GPURenderPipeline => {
  const shaderModule = device.createShaderModule({
    code: msdfTextShader,
  });

  const bindGroupLayout = createBindGroupLayout(device);

  return device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one",
            },
          },
        },
      ],
    },
    primitive: {
      topology: "triangle-strip",
      stripIndexFormat: "uint32",
      cullMode: "none",
    },
  });
};

// ============================================================================
// Font Loading
// ============================================================================

const loadFontTexture = async (
  device: GPUDevice,
  imageUrl: string
): Promise<GPUTexture> => {
  const response = await fetch(imageUrl);
  const imageBitmap = await createImageBitmap(await response.blob());

  const texture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture },
    [imageBitmap.width, imageBitmap.height]
  );

  return texture;
};

const loadFont = async (
  device: GPUDevice,
  jsonUrl: string
): Promise<FontData> => {
  const response = await fetch(jsonUrl);
  const json: MsdfFontJson = await response.json();

  const baseUrl = jsonUrl.substring(0, jsonUrl.lastIndexOf("/") + 1);
  const textureUrl = baseUrl + json.pages[0];

  const texture = await loadFontTexture(device, textureUrl);
  const charMap = createCharMap(json.chars);

  // Create character index map
  const charIndexMap = new Map<number, number>();
  json.chars.forEach((char, index) => {
    charIndexMap.set(char.id, index);
  });

  const charsArray = createCharsArray(json);
  const charsBuffer = device.createBuffer({
    size: charsArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(charsBuffer, 0, charsArray.buffer);

  return {
    json,
    charMap,
    charIndexMap, // Add this
    texture,
    charsBuffer,
  };
};

// ============================================================================
// Renderer State Management
// ============================================================================

const createRenderer = async (
  canvas: HTMLCanvasElement,
  config: RendererConfig
): Promise<RendererState> => {
  if (!isWebGPUAvailable()) {
    throw new Error("WebGPU not supported");
  }

  const deviceInfo = await getWebGPUDevice({ canvas });
  if (!deviceInfo?.context) {
    throw new Error("Failed to get WebGPU device");
  }

  const { device, context } = deviceInfo;

  const sampler = device.createSampler({
    minFilter: "linear",
    magFilter: "linear",
    mipmapFilter: "linear",
    maxAnisotropy: 16,
  });

  const uniformBuffer = device.createBuffer({
    size: 16, // 4 floats
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformData = createUniformData(config);
  device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);

  const format = navigator.gpu.getPreferredCanvasFormat();
  const pipeline = createPipeline(device, format);

  return {
    device,
    context,
    pipeline,
    sampler,
    uniformBuffer,
    config,
    fontData: undefined,
    bindGroup: undefined,
    instanceBuffer: undefined,
    instanceCount: 0,
  };
};

const loadFontIntoState = async (
  state: RendererState,
  fontJsonUrl: string
): Promise<RendererState> => {
  const fontData = await loadFont(state.device, fontJsonUrl);
  return { ...state, fontData };
};

const updateLabels = (
  state: RendererState,
  labels: ReadonlyArray<TextLabel>
): RendererState => {
  if (!state.fontData) {
    console.log("[MSDF] No font data");
    return state;
  }

  const instanceData = createInstanceData(
    labels,
    state.fontData,
    state.config.pixelScale
  );
  const instanceCount = Math.floor(instanceData.length / INSTANCE_STRIDE);

  console.log("[MSDF] updateLabels:", {
    instanceCount,
    dataLength: instanceData.length,
    labels: labels.length,
  });

  if (instanceCount === 0) {
    return { ...state, instanceCount: 0, bindGroup: undefined };
  }

  const instanceBuffer = state.device.createBuffer({
    size: instanceData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  state.device.queue.writeBuffer(instanceBuffer, 0, instanceData.buffer);

  const bindGroup = state.device.createBindGroup({
    layout: state.pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: state.fontData.texture.createView() },
      { binding: 1, resource: state.sampler },
      { binding: 2, resource: { buffer: state.fontData.charsBuffer } },
      { binding: 3, resource: { buffer: state.uniformBuffer } },
      { binding: 4, resource: { buffer: instanceBuffer } },
    ],
  });

  // Destroy old instance buffer if it exists
  if (state.instanceBuffer) {
    state.instanceBuffer.destroy();
  }

  console.log("[MSDF] Created bindGroup, instanceCount:", instanceCount);

  return {
    ...state,
    instanceBuffer,
    bindGroup,
    instanceCount,
  };
};

let renderCount = 0;
const render = (state: RendererState): void => {
  if (!state.bindGroup || state.instanceCount === 0 || !state.fontData) {
    console.log("[MSDF] Render skipped:", {
      hasBindGroup: !!state.bindGroup,
      instanceCount: state.instanceCount,
      hasFontData: !!state.fontData,
      renderCount,
    });
    return;
  }

  if (renderCount < 5) {
    console.log(
      `[MSDF] Render #${renderCount}, instanceCount:`,
      state.instanceCount
    );
  }
  renderCount++;

  try {
    const textureView = state.context.getCurrentTexture().createView();
    const commandEncoder = state.device.createCommandEncoder();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(state.pipeline);
    renderPass.setBindGroup(0, state.bindGroup);
    renderPass.draw(4, state.instanceCount);
    renderPass.end();

    state.device.queue.submit([commandEncoder.finish()]);
  } catch (error) {
    console.error("[MSDF] Render error:", error);
  }
};

const destroy = (state: RendererState): void => {
  if (state.fontData?.texture) {
    state.fontData.texture.destroy();
  }
  if (state.fontData?.charsBuffer) {
    state.fontData.charsBuffer.destroy();
  }
  if (state.instanceBuffer) {
    state.instanceBuffer.destroy();
  }
  state.uniformBuffer.destroy();
};

// ============================================================================
// React Hook
// ============================================================================

const useMsdfRenderer = (
  canvas: HTMLCanvasElement | null,
  fontJsonUrl: string,
  config: RendererConfig
) => {
  const [state, setState] = React.useState<RendererState | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (!canvas) return;

    let mounted = true;
    let currentState: RendererState | null = null;

    const init = async () => {
      try {
        const renderer = await createRenderer(canvas, config);
        const withFont = await loadFontIntoState(renderer, fontJsonUrl);

        if (mounted) {
          currentState = withFont;
          setState(withFont);
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (currentState) {
        destroy(currentState);
      }
    };
  }, [canvas, fontJsonUrl]);

  return { state, error, isReady, setState };
};

// ============================================================================
// React Component
// ============================================================================

export const MsdfTextRenderer: React.FC<MsdfTextRendererProps> = React.memo(
  ({
    canvas,
    labels,
    fontJsonUrl,
    width,
    height,
    pixelScale = DEFAULT_PIXEL_SCALE,
    onReady,
    onError,
  }) => {
    const config: RendererConfig = React.useMemo(
      () => ({
        width,
        height,
        pixelScale,
      }),
      [width, height, pixelScale]
    );

    const { state, error, isReady, setState } = useMsdfRenderer(
      canvas,
      fontJsonUrl,
      config
    );

    const stateRef = React.useRef(state);
    stateRef.current = state;

    // Handle errors
    React.useEffect(() => {
      if (error) {
        console.error("Failed to initialize MSDF renderer:", error);
        onError?.(error);
      }
    }, [error, onError]);

    // Handle ready
    React.useEffect(() => {
      if (isReady) {
        onReady?.();
      }
    }, [isReady, onReady]);

    // Update labels
    React.useEffect(() => {
      if (!stateRef.current || !isReady) return;

      const newState = updateLabels(stateRef.current, labels);
      setState(newState);
    }, [isReady, labels, setState]);

    // Render loop
    React.useEffect(() => {
      if (!isReady) return;

      let animationId: number;
      let cancelled = false;

      const frame = () => {
        if (cancelled || !stateRef.current) return;
        render(stateRef.current);
        animationId = requestAnimationFrame(frame);
      };

      animationId = requestAnimationFrame(frame);

      return () => {
        cancelled = true;
        cancelAnimationFrame(animationId);
      };
    }, [isReady]);

    return null;
  }
);
