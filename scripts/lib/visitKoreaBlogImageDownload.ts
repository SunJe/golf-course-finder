import fs from "node:fs";
import path from "node:path";

type DetailImageItem = {
  originimgurl?: string;
  smallimageurl?: string;
};

type DetailCommonItem = {
  firstimage?: string;
  firstimage2?: string;
};

/** firstimage → firstimage2 → detailImage2 순서로 중복 제거 */
export function collectDetailImageUrls(
  commonItem: DetailCommonItem | undefined,
  imageItems: DetailImageItem[],
): string[] {
  const imageUrls: string[] = [];
  const push = (url?: string) => {
    if (url && !imageUrls.includes(url)) imageUrls.push(url);
  };

  push(commonItem?.firstimage);
  push(commonItem?.firstimage2);
  for (const img of imageItems) {
    push(img.originimgurl ?? img.smallimageurl);
  }

  return imageUrls;
}

export function localImageFileName(key: string, index: number): string {
  if (index === 0) return `${key}.jpg`;
  return `${key}-${index + 1}.jpg`;
}

export async function downloadImage(url: string, filePath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buf);
}

export type SavedCourseImages = {
  imagePaths: string[];
  imagePath?: string;
  imagePath2?: string;
};

/** API URL 목록을 로컬 파일로 저장하고 public 경로 배열 반환 (404 등 실패 URL은 건너뜀) */
export async function saveCourseImageSet(
  key: string,
  outDir: string,
  publicBasePath: string,
  imageUrls: string[],
): Promise<SavedCourseImages> {
  const imagePaths: string[] = [];
  let savedIndex = 0;

  for (const url of imageUrls) {
    const fileName = localImageFileName(key, savedIndex);
    const localPath = path.join(outDir, fileName);
    try {
      await downloadImage(url, localPath);
      imagePaths.push(`${publicBasePath}/${fileName}`);
      savedIndex += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  WARN skip broken image URL: ${message}`);
    }
  }

  return {
    imagePaths,
    imagePath: imagePaths[0],
    imagePath2: imagePaths[1],
  };
}
