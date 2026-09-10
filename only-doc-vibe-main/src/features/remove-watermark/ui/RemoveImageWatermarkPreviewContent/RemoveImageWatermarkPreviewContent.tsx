"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FC,
} from "react";
import { Button } from "@universe-forma/ui-pes";
import { ReactCompareSlider } from "react-compare-slider";
import { ReactComponent as UploadIcon } from "@public/assets/icons/upload.svg?react";
import { ReactComponent as SplitScreenIcon } from "@public/assets/icons/remove-watermark/tab-split-screen.svg?react";
import { ReactComponent as SliderIcon } from "@public/assets/icons/remove-watermark/tab-slider.svg?react";
import { ReactComponent as SparklesIcon } from "@public/assets/icons/remove-watermark/sparkles.svg?react";

import type { InternalFileType } from "@/shared/constants/file-type";
import { getAcceptString } from "@/shared/lib/file";
import { useTranslation } from "@/shared/lib/translations";
import { cn } from "@/shared/lib/utils/cn";
import { Image } from "@/shared/ui/image";

export interface IRemoveImageWatermarkModalOptions {
  removedWatermarkImageUrl: string;
  originalImageUrl: string;
  acceptFormats: InternalFileType[];
  onDownload: () => void;
  handleUploadFile: (file: File) => void;
}

type PreviewMode = "split" | "slider";

const PreviewImage: FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => (
  <div className="relative h-full w-full overflow-hidden rounded-[16px]">
    <Image src={src} alt={alt} objectFit="contain" className="h-full w-full" />
  </div>
);

export const RemoveImageWatermarkPreviewContent: FC<
  IRemoveImageWatermarkModalOptions
> = ({
  removedWatermarkImageUrl,
  originalImageUrl,
  acceptFormats,
  onDownload,
  handleUploadFile,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<PreviewMode>("split");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = getAcceptString(acceptFormats);
  const supportedFormatsLabel = acceptFormats.join(", ");

  const submitFile = (file: File | undefined): void => {
    if (!file) return;

    handleUploadFile(file);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    submitFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragOver(false);
    submitFile(event.dataTransfer.files?.[0]);
  };

  const openFilePicker = (): void => inputRef.current?.click();

  const onUploadKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 md:gap-6">
      <h2 className="text-mobile-title-3 md:text-desktop-title-3 text-center text-black/87">
        {String(t("modals.remove_image_watermark_preview.heading"))}
      </h2>

      <div
        role="tablist"
        aria-label={String(
          t("modals.remove_image_watermark_preview.preview_mode_label")
        )}
        className="flex w-full max-w-[1024px] rounded-xl bg-black/6 p-1"
      >
        <Button
          variant="text"
          color="secondary"
          size="md"
          role="tab"
          aria-selected={mode === "split"}
          className={cn(
            "flex-1 cursor-pointer rounded-lg px-6 py-2 text-base font-medium !text-black/87 shadow-none hover:bg-black/6 hover:!text-black/87",
            mode === "split" && "bg-common-white hover:bg-common-white"
          )}
          onClick={() => setMode("split")}
        >
          <span className="flex items-center justify-center gap-1.5">
            <SplitScreenIcon className="h-5 w-5 shrink-0 text-black/60" />
            <span>
              {String(t("modals.remove_image_watermark_preview.tab_split"))}
            </span>
          </span>
        </Button>
        <Button
          variant="text"
          color="secondary"
          size="md"
          role="tab"
          aria-selected={mode === "slider"}
          className={cn(
            "flex-1 cursor-pointer rounded-lg px-6 py-2 text-base font-medium !text-black/87 shadow-none hover:bg-black/6 hover:!text-black/87",
            mode === "slider" && "bg-common-white hover:bg-common-white"
          )}
          onClick={() => setMode("slider")}
        >
          <span className="flex items-center justify-center gap-1.5">
            <SliderIcon className="h-5 w-5 shrink-0 text-black/60" />
            <span>
              {String(t("modals.remove_image_watermark_preview.tab_slider"))}
            </span>
          </span>
        </Button>
      </div>

      {mode === "split" ? (
        <div className="grid w-full gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-subtitle text-center text-black/87">
              {String(t("modals.remove_image_watermark_preview.original"))}
            </p>
            <div className="h-[220px] rounded-[20px] bg-black/8 p-1 md:h-[420px]">
              <PreviewImage
                src={originalImageUrl}
                alt={String(
                  t("modals.remove_image_watermark_preview.alt_original")
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-subtitle flex items-center justify-center gap-1 text-center text-black/87">
              <SparklesIcon className="h-5 w-5 shrink-0 text-black/87" />
              <span>
                {String(
                  t("modals.remove_image_watermark_preview.watermark_removed")
                )}
              </span>
            </p>
            <div className="h-[220px] rounded-[20px] bg-black/8 p-1 md:h-[420px]">
              <PreviewImage
                src={removedWatermarkImageUrl}
                alt={String(
                  t("modals.remove_image_watermark_preview.alt_result")
                )}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[220px] w-full overflow-hidden rounded-[20px] bg-black/8 p-1 md:h-[420px]">
          <ReactCompareSlider
            itemOne={
              <PreviewImage
                src={originalImageUrl}
                alt={String(
                  t("modals.remove_image_watermark_preview.alt_original")
                )}
              />
            }
            itemTwo={
              <PreviewImage
                src={removedWatermarkImageUrl}
                alt={String(
                  t("modals.remove_image_watermark_preview.alt_result")
                )}
              />
            }
            className="h-full w-full rounded-[16px]"
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={onInputChange}
        aria-hidden="true"
      />
      <div
        role="button"
        tabIndex={0}
        aria-label={String(
          t("modals.remove_image_watermark_preview.upload_new_label")
        )}
        className={cn(
          "w-full cursor-pointer rounded-[20px] border border-dashed px-4 py-7 text-center",
          isDragOver
            ? "border-primary bg-primary/10"
            : "border-black/30 bg-transparent"
        )}
        onClick={openFilePicker}
        onKeyDown={onUploadKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
      >
        <p className="text-body flex items-center justify-center gap-1.5 text-black/87">
          <UploadIcon className="h-4 w-4 text-black/60" />
          <span>
            <span className="underline">
              {String(
                t("modals.remove_image_watermark_preview.upload_cta_action")
              )}
            </span>{" "}
            {String(t("modals.remove_image_watermark_preview.upload_cta_hint"))}
          </span>
        </p>
        <p className="text-caption mt-2 tracking-[0.02em] text-black/60">
          {String(
            t("modals.remove_image_watermark_preview.size_hint", {
              formats: supportedFormatsLabel,
            })
          )}
        </p>
      </div>

      <Button
        variant="filled"
        color="primary"
        size="lg"
        className="w-full md:max-w-[360px]"
        onClick={onDownload}
      >
        {String(t("modals.remove_image_watermark_preview.download"))}
      </Button>
    </div>
  );
};
