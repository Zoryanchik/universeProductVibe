import { useEffect, useRef, useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { InternalFileType } from "@/shared/constants/file-type";
import { loadPdfJsLib } from "@/shared/lib/lazy-load/loadPdfJsLib";
import { logger } from "@/shared/lib/utils/logger";

import {
  getDownloadInfo,
  updateDashboardFile,
  type IUserFile,
} from "@/entities/documents";
import {
  FORMAT_GROUP_BADGE_CLASS,
  FORMAT_GROUP_BADGE_ICON,
  getExtension,
  getFormatGroupForType,
  EFormatGroup,
} from "@/entities/documents";

const URL_CACHE_MAX = 100;
const urlCache = new Map<string, Promise<string>>();

const getSignedUrl = (fileId: string): Promise<string> => {
  const cached = urlCache.get(fileId);
  if (cached) return cached;

  const promise = getDownloadInfo(fileId)
    .then((info) => info.url)
    .catch((err) => {
      urlCache.delete(fileId);
      throw err;
    });
  if (urlCache.size >= URL_CACHE_MAX) {
    const firstKey = urlCache.keys().next().value;
    if (firstKey !== undefined) urlCache.delete(firstKey);
  }

  urlCache.set(fileId, promise);

  return promise;
};

interface Props {
  file: IUserFile;
  /** Fixed square size in px. Used when fillContainer is false (default). */
  size?: number;
  /** Fill the parent container instead of using a fixed size. */
  fillContainer?: boolean;
  className?: string;
}

export const FilePreviewThumbnail: FC<Props> = ({
  file,
  size = 40,
  fillContainer = false,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [renderedPdf, setRenderedPdf] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  const group = getFormatGroupForType(file.internal_type);
  const isPdf = file.internal_type.toUpperCase() === InternalFileType.PDF;
  const upperType = file.internal_type.toUpperCase();
  const isBrowserUnsupportedImage =
    upperType === InternalFileType.TIFF ||
    upperType === "TIF" ||
    upperType === InternalFileType.SVG;
  const isImage = group === EFormatGroup.IMAGE && !isBrowserUnsupportedImage;
  const ext = getExtension(file.filename) || file.internal_type;

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    if (!isPdf && !isImage) return;

    let cancelled = false;
    (async () => {
      try {
        const url = await getSignedUrl(file.id);
        if (cancelled) return;

        if (isImage) {
          setImgUrl(url);

          return;
        }

        if (isPdf) {
          const pdfjs = await loadPdfJsLib();
          const doc = await pdfjs.getDocument(url).promise;
          if (cancelled) return;

          if (doc.numPages > 1) {
            updateDashboardFile(file.id, { pages: doc.numPages });
          }

          const page = await doc.getPage(1);
          const canvas = canvasRef.current;
          if (!canvas) return;

          const viewport = page.getViewport({ scale: 1 });
          const targetWidth = fillContainer
            ? Math.max(containerRef.current?.clientWidth ?? size * 2, size * 2)
            : size * 2;
          const scale = targetWidth / viewport.width;
          const scaled = page.getViewport({ scale });
          canvas.width = scaled.width;
          canvas.height = scaled.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          await page.render({ canvasContext: ctx, viewport: scaled, canvas })
            .promise;
          if (!cancelled) setRenderedPdf(true);
        }
      } catch (err) {
        logger.error("Failed to render thumbnail", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, isPdf, isImage, file.id, size, fillContainer]);

  const fallbackClass = FORMAT_GROUP_BADGE_CLASS[group];

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-bg-light-grey relative overflow-hidden rounded-md",
        !fillContainer && "shrink-0",
        fillContainer && "h-full w-full",
        className
      )}
      style={fillContainer ? undefined : { width: size, height: size }}
    >
      {isImage && imgUrl && (
        <img
          src={imgUrl}
          alt=""
          aria-hidden
          className={cn(
            "h-full w-full",
            fillContainer ? "object-cover object-top" : "object-cover"
          )}
        />
      )}
      {isPdf && (
        <canvas
          ref={canvasRef}
          className={cn(
            "transition-opacity",
            fillContainer
              ? "block h-auto w-full"
              : "h-full w-full object-cover",
            renderedPdf ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      {(!isImage && !isPdf) ||
      (isPdf && !renderedPdf) ||
      (isImage && !imgUrl) ? (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-[10px] leading-none font-bold uppercase",
            fallbackClass
          )}
        >
          {ext.slice(0, 4)}
        </span>
      ) : null}
      {!fillContainer && (
        <img
          src={FORMAT_GROUP_BADGE_ICON[group]}
          alt=""
          aria-hidden
          className="absolute start-[3px] top-[3px] h-3 w-3 rounded-[3px]"
        />
      )}
    </div>
  );
};
