"use client";

import { useRef, useState, type ChangeEvent, type FC } from "react";
import { Button } from "@universe-forma/ui-pes";
import { ReactCompareSlider } from "react-compare-slider";
import { ReactComponent as UploadIcon } from "@public/assets/icons/upload.svg?react";
import { ReactComponent as DownloadIcon } from "@public/assets/icons/dashboard/download.svg?react";

import type { InternalFileType } from "@/shared/constants/file-type";
import { getAcceptString } from "@/shared/lib/file";
import { useTranslation } from "@/shared/lib/translations";
import { useAnimatedProgress } from "@/shared/lib/ui/useAnimatedProgress";
import { cn } from "@/shared/lib/utils/cn";
import { Image } from "@/shared/ui/image";

export type EnhanceLevel = 2 | 4;

export const ENHANCE_LEVELS: readonly EnhanceLevel[] = [2, 4];

export interface IEnhanceImageModalOptions {
  originalImageUrl: string;
  enhancedImageUrl: string;
  filename: string;
  originalWidth: number;
  originalHeight: number;
  level: EnhanceLevel;
  isEnhancing: boolean;
  acceptFormats: InternalFileType[];
  onSelectLevel: (level: EnhanceLevel) => void;
  onDownload: (url: string) => void;
  handleUploadFile: (file: File) => void;
}

const ZOOM_MIN = 100;
const ZOOM_MAX = 300;
const ZOOM_STEP = 50;
const ZOOM_TICKS = [100, 150, 200, 250, 300] as const;

const WATERMARK_CELLS = Array.from({ length: 60 }, (_, index) => index);

const WatermarkOverlay: FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 flex scale-150 -rotate-[20deg] flex-wrap content-center items-center justify-center gap-x-8 gap-y-6 overflow-hidden select-none"
  >
    {WATERMARK_CELLS.map((cell) => (
      <span
        key={cell}
        className="text-sm font-semibold whitespace-nowrap text-white/25"
      >
        OnlyDoc
      </span>
    ))}
  </div>
);

const EnhancingOverlay: FC<{ label: string }> = ({ label }) => {
  const { barProgress } = useAnimatedProgress({
    durationInSeconds: 12,
    min: 5,
    max: 95,
  });

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/45">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inline-block h-full w-full animate-spin rounded-full border-4 border-white/30 border-t-white" />
        <span className="text-base font-semibold text-white">
          {barProgress}%
        </span>
      </div>
      <span className="text-base font-semibold text-white">{label}</span>
    </div>
  );
};

const PreviewImage: FC<{
  src: string;
  alt: string;
  zoom: number;
  withWatermark?: boolean;
}> = ({ src, alt, zoom, withWatermark = false }) => (
  <div className="relative h-full w-full overflow-hidden">
    <div
      className="h-full w-full origin-center transition-transform duration-200"
      style={{ transform: `scale(${zoom / 100})` }}
    >
      <Image src={src} alt={alt} objectFit="cover" className="h-full w-full" />
    </div>
    {withWatermark && <WatermarkOverlay />}
  </div>
);

export const EnhanceImagePreviewContent: FC<IEnhanceImageModalOptions> = ({
  originalImageUrl,
  enhancedImageUrl,
  filename,
  originalWidth,
  originalHeight,
  level,
  isEnhancing,
  acceptFormats,
  onSelectLevel,
  onDownload,
  handleUploadFile,
}) => {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState<number>(ZOOM_MIN);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = getAcceptString(acceptFormats);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) handleUploadFile(file);
  };

  const openFilePicker = (): void => inputRef.current?.click();

  const formatDimensions = (width: number, height: number): string =>
    String(
      t("modals.enhance_image.dimensions", {
        width: String(width),
        height: String(height),
      })
    );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-2 py-6 md:px-10 md:py-10">
      <h1 className="text-mobile-title-3 md:text-desktop-title-3 text-center text-black/87">
        {String(t("modals.enhance_image.heading"))}
      </h1>

      <div className="grid w-full gap-4 md:grid-cols-[1fr_400px] md:gap-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-black/80 md:aspect-auto md:min-h-[520px]">
          <div className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 md:top-3 md:px-3 md:py-1">
            <span className="md:text-caption text-[10px] leading-tight font-medium tracking-[0.02em] whitespace-nowrap text-white uppercase md:tracking-[0.04em]">
              {String(t("modals.enhance_image.no_watermark_badge"))}
            </span>
          </div>

          <ReactCompareSlider
            className="h-full w-full"
            itemOne={
              <PreviewImage
                src={originalImageUrl}
                alt={String(t("modals.enhance_image.alt_before"))}
                zoom={zoom}
              />
            }
            itemTwo={
              <PreviewImage
                src={enhancedImageUrl}
                alt={String(t("modals.enhance_image.alt_after"))}
                zoom={zoom}
                withWatermark
              />
            }
          />

          <span className="pointer-events-none absolute start-3 bottom-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white">
            {String(t("modals.enhance_image.before"))}
          </span>
          <span className="pointer-events-none absolute end-3 bottom-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white">
            {String(t("modals.enhance_image.after"))}
          </span>

          {isEnhancing && (
            <EnhancingOverlay
              label={String(t("modals.enhance_image.enhancing"))}
            />
          )}
        </div>

        <div className="flex flex-col gap-5 rounded-[20px] bg-[#FAFAFA] p-4 md:p-6">
          <p className="text-subtitle text-black/87">
            {String(t("modals.enhance_image.select_quality_level"))}
          </p>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-black/6 px-4 py-3">
            <span className="text-body truncate text-black/60">{filename}</span>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={onInputChange}
              aria-hidden="true"
            />
            <Button
              variant="text"
              color="secondary"
              size="sm"
              className="shrink-0 gap-1.5 !text-black/87"
              onClick={openFilePicker}
            >
              <UploadIcon className="h-4 w-4 text-black/60" />
              {String(t("modals.enhance_image.upload_new"))}
            </Button>
          </div>

          <p className="text-caption text-black/60">
            {String(t("modals.enhance_image.original_size"))}{" "}
            {formatDimensions(originalWidth, originalHeight)}
          </p>

          <div className="flex flex-col gap-3">
            {ENHANCE_LEVELS.map((option) => {
              const isSelected = option === level;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={isEnhancing}
                  aria-pressed={isSelected}
                  className={cn(
                    "bg-common-white flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-4 text-start transition-colors disabled:cursor-not-allowed",
                    isSelected ? "border-primary" : "border-black/12"
                  )}
                  onClick={() => onSelectLevel(option)}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        isSelected ? "border-primary" : "border-black/30"
                      )}
                    >
                      {isSelected && (
                        <span className="bg-primary h-2.5 w-2.5 rounded-full" />
                      )}
                    </span>
                    <span className="text-body font-medium text-black/87">
                      {String(
                        t("modals.enhance_image.level_option", {
                          level: String(option),
                        })
                      )}
                    </span>
                  </span>
                  <span className="text-caption text-black/60">
                    {String(t("modals.enhance_image.after"))}{" "}
                    {formatDimensions(
                      originalWidth * option,
                      originalHeight * option
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-caption text-black/60">
              {String(t("modals.enhance_image.zoom_to_preview"))}
            </p>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoom}
              aria-label={String(t("modals.enhance_image.zoom_to_preview"))}
              className="accent-primary w-full cursor-pointer"
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <div className="flex justify-between">
              {ZOOM_TICKS.map((tick) => (
                <span key={tick} className="text-caption text-black/40">
                  {tick}%
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="filled"
            color="primary"
            size="lg"
            disabled={isEnhancing}
            className="w-full gap-2"
            onClick={() => onDownload(enhancedImageUrl)}
          >
            <DownloadIcon className="h-5 w-5" />
            {String(t("modals.enhance_image.upgrade_and_download"))}
          </Button>
        </div>
      </div>
    </div>
  );
};
