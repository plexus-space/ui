/**
 * Chart Export Utilities
 *
 * Export charts to PNG, SVG, or data formats
 */

/**
 * Export SVG element to PNG
 *
 * @param svgElement - SVG DOM element
 * @param filename - Output filename
 * @param scale - Scale factor for resolution (2 = 2x, 3 = 3x)
 */
export async function exportToPNG(
  svgElement: SVGSVGElement,
  filename: string = "chart.png",
  scale: number = 2
): Promise<void> {
  // Get SVG dimensions
  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width * scale;
  const height = bbox.height * scale;

  // Serialize SVG to string
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Add XML declaration and make it standalone
  svgString = `<?xml version="1.0" encoding="UTF-8"?>${svgString}`;

  // Create blob and data URL
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // Create image and wait for load
  const img = new Image();
  img.width = width;
  img.height = height;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  // Create canvas and draw image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Fill white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  // Clean up
  URL.revokeObjectURL(url);

  // Convert to PNG and download
  canvas.toBlob((blob) => {
    if (!blob) throw new Error("Could not create blob");
    const pngUrl = URL.createObjectURL(blob);
    downloadURL(pngUrl, filename);
    URL.revokeObjectURL(pngUrl);
  }, "image/png");
}

/**
 * Export SVG element to SVG file
 *
 * @param svgElement - SVG DOM element
 * @param filename - Output filename
 */
export function exportToSVG(svgElement: SVGSVGElement, filename: string = "chart.svg"): void {
  // Clone and clean up
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Serialize
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  // Add XML declaration
  svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

  // Create blob and download
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadURL(url, filename);
  URL.revokeObjectURL(url);
}

/**
 * Export chart data to CSV
 *
 * @param data - Array of data points
 * @param filename - Output filename
 * @param headers - Column headers
 */
export function exportToCSV(
  data: { x: number; y: number }[],
  filename: string = "data.csv",
  headers: string[] = ["x", "y"]
): void {
  // Create CSV content
  const csvRows = [headers.join(",")];

  for (const point of data) {
    csvRows.push(`${point.x},${point.y}`);
  }

  const csvString = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  downloadURL(url, filename);
  URL.revokeObjectURL(url);
}

/**
 * Export chart data to JSON
 *
 * @param data - Data to export
 * @param filename - Output filename
 */
export function exportToJSON(data: any, filename: string = "data.json"): void {
  const jsonString = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  downloadURL(url, filename);
  URL.revokeObjectURL(url);
}

/**
 * Helper to trigger download
 */
function downloadURL(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy canvas to clipboard as PNG
 *
 * @param canvas - Canvas element
 */
export async function copyToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error("Clipboard API not supported");
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create blob"));
    }, "image/png");
  });

  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
}
