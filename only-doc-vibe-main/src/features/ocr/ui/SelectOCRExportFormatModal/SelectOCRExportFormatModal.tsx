import { useState, type FC } from "react";
import { Button } from "@universe-forma/ui-pes";
import chevronLeftIcon from "@public/assets/icons/chevron-left-icon.svg?url";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { useCmsModalContent } from "@/shared/lib/cms-modal-content";
import { BaseModal } from "@/shared/ui/base-modal";

import {
  EOcrExportFormat,
  type SupportedOcrExportFormat,
} from "../../model/types";
import { OCR_EXPORT_FORMATS } from "../../model/constants/ocr-export-formats";
import { OCRFormatItem } from "./OCRFormatItem";

export interface ISelectOCRExportFormatModalOptions {
  filename: string;
  onSubmit: (options: {
    exportFormat: SupportedOcrExportFormat;
    filename: string;
  }) => void;
}

export const SelectOCRExportFormatModal: FC = () => {
  const cms = useCmsModalContent("modals.ocr-modal");
  const cmsFormats = cms?.formats ?? [];
  const { filename, onSubmit } = useCurrentModalOptions(
    EModalsTypes.SELECT_OCR_EXPORT_FORMAT
  );

  const [selectedFormat, setSelectedFormat] =
    useState<SupportedOcrExportFormat>(EOcrExportFormat.DOCX);
  const [editedFilename, setEditedFilename] = useState(filename);

  const handleSubmit = () => {
    onSubmit({
      exportFormat: selectedFormat,
      filename: editedFilename,
    });
  };

  const handleCancel = () => {
    closeModal(EModalsTypes.SELECT_OCR_EXPORT_FORMAT);
  };

  return (
    <BaseModal
      headerTitle={cms?.title}
      canClose
      rootClassName="max-md:items-end"
      className="flex w-full max-w-[640px] flex-col items-center max-md:mx-0 max-md:max-w-full max-md:rounded-b-none"
      data-testid="choose-format-modal"
      modalType={EModalsTypes.SELECT_OCR_EXPORT_FORMAT}
    >
      {/* Mobile drag handle */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 md:hidden">
        <div className="h-1.5 w-10 rounded-full bg-[#e0e0e0]" />
      </div>

      {/* Back button - desktop only */}
      <button
        className="absolute start-5 top-5 flex cursor-pointer items-center justify-center rounded-xl border border-black/15 p-3 max-md:hidden"
        onClick={handleCancel}
        data-testid="ocr-back-button"
      >
        <img
          src={chevronLeftIcon}
          alt="Back"
          className="size-6 rtl:rotate-180"
        />
      </button>

      {/* Content */}
      <div className="flex w-full flex-col items-start gap-5 px-5 pt-6 pb-6">
        {/* File name input */}
        <div className="flex w-full flex-col pb-6">
          <label className="pb-1 text-[13px] leading-[14px] font-light text-black/60">
            {cms?.file_name_label}
          </label>
          <input
            type="text"
            value={editedFilename}
            onChange={(e) => setEditedFilename(e.target.value)}
            className="w-full rounded-xl border border-black/[0.14] px-3 py-4 text-base leading-6 font-light text-black/[0.87] outline-none focus:border-black/30"
            data-testid="file-name-input"
          />
        </div>

        {/* Format options */}
        <div className="flex w-full flex-col gap-3">
          {OCR_EXPORT_FORMATS.map((item, index) => {
            const cmsFormat = cmsFormats[index];

            return (
              <OCRFormatItem
                key={item.to}
                to={item.to}
                index={index}
                title={cmsFormat?.title ?? ""}
                description={cmsFormat?.value ?? ""}
                icon={cmsFormat?.icon?.url ?? item.icon}
                active={selectedFormat === item.to}
                onSelect={setSelectedFormat}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom buttons - sticky for mobile scroll */}
      <div className="sticky bottom-0 z-10 flex w-full items-center justify-between gap-3 bg-white px-5 pt-3 pb-5">
        <Button
          className="h-12 rounded-xl"
          variant="outlined"
          color="primary"
          size="md"
          onClick={handleCancel}
          data-testid="cancel-button"
        >
          {cms?.cancel_button}
        </Button>
        <Button
          className="h-12 flex-1 rounded-xl"
          variant="filled"
          color="primary"
          size="md"
          onClick={handleSubmit}
          data-testid="convert-button"
        >
          {cms?.download_button}
        </Button>
      </div>
    </BaseModal>
  );
};
