import sharp from "sharp";

export interface ImageDimensions {
  width: number;
  height: number;
}

export async function readImageDimensions(
  filePath: string,
): Promise<ImageDimensions> {
  const meta = await sharp(filePath).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

export function isSquare({ width, height }: ImageDimensions): boolean {
  return width > 0 && width === height;
}

export function formatDimensions({ width, height }: ImageDimensions): string {
  return `${width}x${height}`;
}

export function assertSquareSource(
  fileName: string,
  dims: ImageDimensions,
  minSize: number,
): void {
  if (!isSquare(dims)) {
    throw new Error(
      `${fileName} is ${formatDimensions(dims)}. Regenerate with square canvas instead of cropping.`,
    );
  }
  if (dims.width < minSize || dims.height < minSize) {
    throw new Error(
      `${fileName} is ${formatDimensions(dims)}. Minimum allowed size is ${minSize}x${minSize}.`,
    );
  }
}

/**
 * Square source → 1200×1200 final (uniform scale, no crop).
 */
export async function resizeSquareSourceToFinal(
  sourcePath: string,
  outputPath: string,
  targetSize: number,
): Promise<ImageDimensions> {
  const source = await readImageDimensions(sourcePath);
  assertSquareSource(sourcePath, source, 1);

  if (source.width === targetSize && source.height === targetSize) {
    await sharp(sourcePath).png().toFile(outputPath);
  } else {
    await sharp(sourcePath)
      .resize(targetSize, targetSize, { fit: "fill" })
      .png()
      .toFile(outputPath);
  }

  return readImageDimensions(outputPath);
}
