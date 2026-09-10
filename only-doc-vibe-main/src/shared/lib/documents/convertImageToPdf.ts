import { internalFileTypeToMimeType } from "../../constants/file-type-mime-type-mappers";
import { InternalFileType } from "../../constants/file-type";
import { EMimeType } from "../../constants/mime-type";
import { loadJsPdf } from "../lazy-load/loadJsPdf";
import { convertHeicToJpeg } from "./convertHeicToJpeg";
import { getFileNameWithoutFormat } from "./getFilenameWithoutFormat";
import {
  getImagePlacement,
  getPdfOrientationForImage,
  type PdfOrientation,
} from "./imagePlacement";

const CONVERT_WITH_HEIC_TO_ANY_MIME_TYPES = [EMimeType.HEIC, EMimeType.HEIF];

function readFileAsDataURL(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

function imageToCanvasDataUrl(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL(EMimeType.JPEG, 1.0);
}

interface ConvertToPdfOptions {
  readonly orientation?: PdfOrientation;
  readonly margin?: number;
}

export async function convertImageToPdf(
  imageFile: File,
  options: ConvertToPdfOptions = {}
): Promise<File> {
  const { jsPDF } = await loadJsPdf();

  const processedBlob: Blob = CONVERT_WITH_HEIC_TO_ANY_MIME_TYPES.includes(
    imageFile.type as EMimeType
  )
    ? await convertHeicToJpeg(imageFile)
    : imageFile;

  const dataUrl = await readFileAsDataURL(processedBlob);

  const img = await loadImage(dataUrl);
  const jpegDataUrl = imageToCanvasDataUrl(img);

  const pdf = new jsPDF({
    orientation: getPdfOrientationForImage(
      img.width,
      img.height,
      options.orientation
    ),
    unit: "mm",
    format: "a4",
  });

  const placement = getImagePlacement(
    pdf,
    img.width,
    img.height,
    options.margin
  );

  pdf.addImage(
    jpegDataUrl,
    InternalFileType.JPEG,
    placement.x,
    placement.y,
    placement.renderWidth,
    placement.renderHeight
  );

  const pdfBlob = pdf.output("blob");

  return new File(
    [pdfBlob],
    `${getFileNameWithoutFormat(imageFile.name)}.pdf`,
    {
      type: internalFileTypeToMimeType(InternalFileType.PDF),
    }
  );
}
