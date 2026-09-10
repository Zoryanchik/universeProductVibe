import { create } from "zustand";

import type { ISelectCompressionLevelModalOptions } from "@/features/compress";
import type { ISelectOCRExportFormatModalOptions } from "@/features/ocr";
import type {
  IRemoveImageWatermarkModalOptions,
  IRemovePdfWatermarkModalOptions,
} from "@/features/remove-watermark";
import type { IEnhanceImageModalOptions } from "@/features/enhance-image";
import type { ISelectImageFormatConverterModalOptions } from "@/features/convert";
import type { IRevealEmailModalOptions } from "@/features/auth-reveal";
import type { ISelectTranslateLanguageModalOptions } from "@/features/translate-pdf";
import type { IUnlockPdfModalOptions } from "@/features/unlock-pdf";

import type { IFileUploadErrorModalOptions } from "@/widgets/FileErrorModal";

import type { IFileUploadingModalOptions } from "../../ui/file-upload-modal";
import type { IProgressModifyFileModalOptions } from "../../ui/progress-modify-file-modal";
import type { IChooseFormatAndConvertModalOptions } from "../../ui/choose-format-modal";
import type { EModalsTypes } from "../../constants/modals-keys";
import { createSelectors } from "../state/createSelectors";
import type {
  IDashboardDeleteModalOptions,
  IDashboardRenameModalOptions,
  IDashboardSendByEmailModalOptions,
  IDashboardShareLinkModalOptions,
} from "./dashboard-modal-options";

type ModalsOptions = {
  [EModalsTypes.EDIT_UPLOADING]: IFileUploadingModalOptions;
  [EModalsTypes.WATERMARK_REMOVING]: IFileUploadingModalOptions;
  [EModalsTypes.COMPRESSING_FILE_MODAL]: IProgressModifyFileModalOptions;
  [EModalsTypes.FILE_UPLOAD_ERROR]: IFileUploadErrorModalOptions;
  [EModalsTypes.SELECT_COMPRESSION_LEVEL]: ISelectCompressionLevelModalOptions;
  [EModalsTypes.SELECT_OCR_EXPORT_FORMAT]: ISelectOCRExportFormatModalOptions;

  [EModalsTypes.REMOVE_IMAGE_WATERMARK_MODAL]: IRemoveImageWatermarkModalOptions;
  [EModalsTypes.REMOVE_PDF_WATERMARK_MODAL]: IRemovePdfWatermarkModalOptions;
  [EModalsTypes.ENHANCE_IMAGE_MODAL]: IEnhanceImageModalOptions;
  [EModalsTypes.UNLOCK_PDF_MODAL]: IUnlockPdfModalOptions;

  [EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL]: IChooseFormatAndConvertModalOptions;
  [EModalsTypes.SELECT_IMAGE_FORMAT_CONVERTER_MODAL]: ISelectImageFormatConverterModalOptions;

  [EModalsTypes.REVEAL_EMAIL_MODAL]: IRevealEmailModalOptions;
  [EModalsTypes.SELECT_TRANSLATE_LANGUAGE]: ISelectTranslateLanguageModalOptions;

  [EModalsTypes.DASHBOARD_RENAME_FILE]: IDashboardRenameModalOptions;
  [EModalsTypes.DASHBOARD_DELETE_FILES]: IDashboardDeleteModalOptions;
  [EModalsTypes.DASHBOARD_SHARE_LINK]: IDashboardShareLinkModalOptions;
  [EModalsTypes.DASHBOARD_SEND_BY_EMAIL]: IDashboardSendByEmailModalOptions;
};

interface IModalState {
  type: keyof ModalsOptions | null;
  options: ModalsOptions[keyof ModalsOptions] | null;
  open: boolean;
}

const getInitialState = () => ({
  type: null,
  options: null,
  open: false,
});

const modalsStore = create<IModalState>()(() => getInitialState());

export const openModal = <T extends keyof ModalsOptions>({
  type,
  options,
}: {
  type: T;
  options?: ModalsOptions[T];
}) => {
  modalsStore.setState({ type, options, open: true });
};

export const closeModal = (type: keyof ModalsOptions) => {
  if (modalsStore.getState().type === type) {
    modalsStore.setState(getInitialState());
  }
};

export const useModalsStore = createSelectors(modalsStore);

export const resetModalsStore = () => {
  modalsStore.setState(getInitialState());
};

export const useCurrentModalOptions = <T extends keyof ModalsOptions>(
  _type: T
) => {
  return useModalsStore.use.options() as ModalsOptions[T];
};

export const updateCurrentModalOptions = <T extends keyof ModalsOptions>(
  type: T,
  options:
    | Partial<ModalsOptions[T]>
    | ((prev: ModalsOptions[T]) => ModalsOptions[T])
) => {
  modalsStore.setState((prev): IModalState => {
    if (prev.type !== type) return prev;

    if (typeof options === "function") {
      return {
        ...prev,
        type,
        options: options(prev.options as ModalsOptions[T]),
      };
    }

    return {
      ...prev,
      type,
      options: { ...prev.options, ...options } as ModalsOptions[T],
    };
  });
};
