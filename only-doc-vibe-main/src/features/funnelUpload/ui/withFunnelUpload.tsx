import { lazy, Suspense, type FC, type PropsWithChildren } from "react";

import type { InternalFileType } from "@/shared/constants/file-type";
import { isImageToPdfConvertFunnel } from "@/shared/lib/documents/isImageToPdfConvertFunnel";

import { EFunnels, EServiceType } from "@/entities/documents";

interface Props extends PropsWithChildren {
  serviceType: EServiceType;
  funnel: EFunnels;
  formatTo?: InternalFileType;
}

interface ComponentProps {
  onFileUpload?: (files: FileList) => void;
  multiple?: boolean;
  acceptedFormats: InternalFileType[];
  showUnlockIllustration?: boolean;
}

const ConvertUploadWrapper = lazy(() =>
  import("@/features/convert").then((mod) => ({
    default: mod.ConvertUploadWrapper,
  }))
);

const CompressUploadWrapper = lazy(() =>
  import("@/features/compress").then((mod) => ({
    default: mod.CompressUploadWrapper,
  }))
);

const TranslateUploadWrapper = lazy(() =>
  import("@/features/translate-pdf").then((mod) => ({
    default: mod.TranslateUploadWrapper,
  }))
);

const RemoveWatermarkUploadWrapper = lazy(() =>
  import("@/features/remove-watermark").then((mod) => ({
    default: mod.RemoveWatermarkUploadWrapper,
  }))
);

const UnlockUploadWrapper = lazy(() =>
  import("@/features/unlock-pdf").then((mod) => ({
    default: mod.UnlockUploadWrapper,
  }))
);

const EnhanceImageUploadWrapper = lazy(() =>
  import("@/features/enhance-image").then((mod) => ({
    default: mod.EnhanceImageUploadWrapper,
  }))
);

const OCRUploadWrapper = lazy(() =>
  import("@/features/ocr").then((mod) => ({ default: mod.OCRUploadWrapper }))
);

const AiSummarizerUploadWrapper = lazy(() =>
  import("@/features/aiSummarizer").then((mod) => ({
    default: mod.AiSummarizerUploadWrapper,
  }))
);

const EditorUploadWrapper = lazy(() =>
  import("@/features/editorUpload").then((mod) => ({
    default: mod.EditorUploadWrapper,
  }))
);

export function withFunnelUpload<T extends ComponentProps>(
  Component: FC<T>
): FC<Props & Omit<T, "onFileUpload">> {
  return ({
    serviceType,
    funnel,
    formatTo,
    ...componentProps
  }: Props & Omit<T, "onFileUpload">) => {
    // AI Summarizer dispatches off the funnel rather than the service type
    // because the same funnel can ride on top of either AI_SUMMARIZER or the
    // CONVERTOR fallback if Strapi hasn't been updated yet.
    if (funnel === EFunnels.PDF_SUMMARIZER) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <AiSummarizerUploadWrapper
            acceptedFormats={componentProps.acceptedFormats}
            funnel={funnel}
          >
            <Component {...(componentProps as unknown as T)} />
          </AiSummarizerUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.CONVERTOR) {
      const isImageToPdfFunnel = isImageToPdfConvertFunnel(
        formatTo,
        componentProps.acceptedFormats
      );

      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <ConvertUploadWrapper
            acceptedFormats={componentProps.acceptedFormats}
            serviceType={serviceType}
            funnel={funnel}
            formatTo={formatTo}
            multiple={isImageToPdfFunnel}
          >
            <Component
              {...(componentProps as unknown as T)}
              multiple={isImageToPdfFunnel}
            />
          </ConvertUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.COMPRESSOR) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <CompressUploadWrapper
            acceptedFormats={componentProps.acceptedFormats}
            serviceType={serviceType}
            funnel={funnel}
          >
            <Component {...(componentProps as unknown as T)} />
          </CompressUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.TRANSLATE) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <TranslateUploadWrapper
            acceptedFormats={componentProps.acceptedFormats}
            serviceType={serviceType}
            funnel={funnel}
          >
            <Component {...(componentProps as unknown as T)} />
          </TranslateUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.OCR) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <OCRUploadWrapper
            acceptedFormats={componentProps.acceptedFormats}
            serviceType={serviceType}
            funnel={funnel}
          >
            <Component {...(componentProps as unknown as T)} />
          </OCRUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.REMOVE_WATERMARK) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <RemoveWatermarkUploadWrapper
            serviceType={serviceType}
            funnel={funnel}
            acceptedFormats={componentProps.acceptedFormats}
          >
            <Component {...(componentProps as unknown as T)} />
          </RemoveWatermarkUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.UNLOCK_PDF) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <UnlockUploadWrapper
            serviceType={serviceType}
            funnel={funnel}
            acceptedFormats={componentProps.acceptedFormats}
          >
            <Component
              {...(componentProps as unknown as T)}
              showUnlockIllustration
            />
          </UnlockUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.ENHANCE_IMAGE) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <EnhanceImageUploadWrapper
            serviceType={serviceType}
            funnel={funnel}
            acceptedFormats={componentProps.acceptedFormats}
          >
            <Component {...(componentProps as unknown as T)} />
          </EnhanceImageUploadWrapper>
        </Suspense>
      );
    }

    if (serviceType === EServiceType.EDITOR) {
      return (
        <Suspense
          fallback={<Component {...(componentProps as unknown as T)} />}
        >
          <EditorUploadWrapper
            funnel={funnel}
            acceptedFormats={componentProps.acceptedFormats}
          >
            <Component
              {...(componentProps as unknown as T)}
              multiple={funnel === EFunnels.MERGE_PDF}
            />
          </EditorUploadWrapper>
        </Suspense>
      );
    }

    return <Component {...(componentProps as unknown as T)} />;
  };
}
