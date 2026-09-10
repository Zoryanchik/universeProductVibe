import {
  getPdfOrientationForImage,
  type PdfOrientation,
} from "./imagePlacement";

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const loadImage = (
  src: string
): Promise<{ readonly width: number; readonly height: number }> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.width || 1, height: image.height || 1 });
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
};

export const getOrientationFromFile = async (
  file: File
): Promise<PdfOrientation> => {
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const dimensions = await loadImage(dataUrl);

    return getPdfOrientationForImage(dimensions.width, dimensions.height);
  } catch {
    return "portrait";
  }
};
