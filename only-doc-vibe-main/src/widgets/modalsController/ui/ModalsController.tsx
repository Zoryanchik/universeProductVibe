import { lazy, Suspense, type FC } from "react";

import { useModalsStore } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { FileUploadingModal } from "@/shared/ui/file-upload-modal";

const FileUploadErrorModal = lazy(() =>
  import("@/widgets/FileErrorModal").then((module) => ({
    default: module.FileUploadErrorModal,
  }))
);

const SelectCompressionLevelModal = lazy(() =>
  import("@/features/compress").then((module) => ({
    default: module.SelectCompressionLevelModal,
  }))
);

const ProgressModifyFileModal = lazy(() =>
  import("@/shared/ui/progress-modify-file-modal").then((module) => ({
    default: module.ProgressModifyFileModal,
  }))
);

const SelectOCRExportFormatModal = lazy(() =>
  import("@/features/ocr").then((module) => ({
    default: module.SelectOCRExportFormatModal,
  }))
);

const RemovePdfWatermarkModal = lazy(() =>
  import("@/features/remove-watermark").then((module) => ({
    default: module.RemovePdfWatermarkModal,
  }))
);

const UnlockPdfModal = lazy(() =>
  import("@/features/unlock-pdf").then((module) => ({
    default: module.UnlockPdfModal,
  }))
);

const ChooseFormatAndConvertModal = lazy(() =>
  import("@/shared/ui/choose-format-modal").then((module) => ({
    default: module.ChooseFormatAndConvertModal,
  }))
);

const SelectImageFormatConverterModal = lazy(() =>
  import("@/features/convert").then((module) => ({
    default: module.SelectImageFormatConverterModal,
  }))
);

const RevealEmailModal = lazy(() =>
  import("@/features/auth-reveal").then((module) => ({
    default: module.RevealEmailModal,
  }))
);

const SelectTranslateLanguageModal = lazy(() =>
  import("@/features/translate-pdf").then((module) => ({
    default: module.SelectTranslateLanguageModal,
  }))
);

const DashboardRenameModal = lazy(() =>
  import("@/features/dashboard-actions").then((module) => ({
    default: module.DashboardRenameModal,
  }))
);

const DashboardDeleteModal = lazy(() =>
  import("@/features/dashboard-actions").then((module) => ({
    default: module.DashboardDeleteModal,
  }))
);

const DashboardShareLinkModal = lazy(() =>
  import("@/features/dashboard-actions").then((module) => ({
    default: module.DashboardShareLinkModal,
  }))
);

const DashboardSendByEmailModal = lazy(() =>
  import("@/features/dashboard-actions").then((module) => ({
    default: module.DashboardSendByEmailModal,
  }))
);

export const ModalsController: FC = () => {
  const type = useModalsStore.use.type();
  const open = useModalsStore.use.open();

  if (!type || !open) return null;

  const content = (() => {
    switch (type) {
      case EModalsTypes.EDIT_UPLOADING:
        return <FileUploadingModal type={EModalsTypes.EDIT_UPLOADING} />;

      case EModalsTypes.FILE_UPLOAD_ERROR:
        return (
          <Suspense fallback={<div />}>
            <FileUploadErrorModal />
          </Suspense>
        );

      case EModalsTypes.SELECT_COMPRESSION_LEVEL:
        return (
          <Suspense fallback={<div />}>
            <SelectCompressionLevelModal />
          </Suspense>
        );

      case EModalsTypes.COMPRESSING_FILE_MODAL:
        return (
          <Suspense fallback={<div />}>
            <ProgressModifyFileModal
              text={""} // add text if needed else remove prop
              data-testid="compressing-file-modal"
            />
          </Suspense>
        );

      case EModalsTypes.SELECT_OCR_EXPORT_FORMAT:
        return (
          <Suspense fallback={<div />}>
            <SelectOCRExportFormatModal />
          </Suspense>
        );

      case EModalsTypes.WATERMARK_REMOVING:
        return (
          <Suspense fallback={<div />}>
            <FileUploadingModal type={EModalsTypes.WATERMARK_REMOVING} />
          </Suspense>
        );

      case EModalsTypes.REMOVE_PDF_WATERMARK_MODAL:
        return (
          <Suspense fallback={<div />}>
            <RemovePdfWatermarkModal />
          </Suspense>
        );

      case EModalsTypes.UNLOCK_PDF_MODAL:
        return (
          <Suspense fallback={<div />}>
            <UnlockPdfModal />
          </Suspense>
        );

      case EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL:
        return (
          <Suspense fallback={<div />}>
            <ChooseFormatAndConvertModal />
          </Suspense>
        );

      case EModalsTypes.SELECT_IMAGE_FORMAT_CONVERTER_MODAL:
        return (
          <Suspense fallback={<div />}>
            <SelectImageFormatConverterModal />
          </Suspense>
        );

      case EModalsTypes.REVEAL_EMAIL_MODAL:
        return (
          <Suspense fallback={<div />}>
            <RevealEmailModal />
          </Suspense>
        );

      case EModalsTypes.SELECT_TRANSLATE_LANGUAGE:
        return (
          <Suspense fallback={<div />}>
            <SelectTranslateLanguageModal />
          </Suspense>
        );

      case EModalsTypes.DASHBOARD_RENAME_FILE:
        return (
          <Suspense fallback={<div />}>
            <DashboardRenameModal />
          </Suspense>
        );

      case EModalsTypes.DASHBOARD_DELETE_FILES:
        return (
          <Suspense fallback={<div />}>
            <DashboardDeleteModal />
          </Suspense>
        );

      case EModalsTypes.DASHBOARD_SHARE_LINK:
        return (
          <Suspense fallback={<div />}>
            <DashboardShareLinkModal />
          </Suspense>
        );

      case EModalsTypes.DASHBOARD_SEND_BY_EMAIL:
        return (
          <Suspense fallback={<div />}>
            <DashboardSendByEmailModal />
          </Suspense>
        );

      default:
        return null;
    }
  })();

  return <div>{content}</div>;
};
