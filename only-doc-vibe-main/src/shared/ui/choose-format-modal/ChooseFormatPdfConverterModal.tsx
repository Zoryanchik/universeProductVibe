import { useMemo, type FC } from "react";
import { Button } from "@universe-forma/ui-pes";
import chevronLeftIcon from "@public/assets/icons/chevron-left-icon.svg?url";

import { useCmsModalContent } from "../../lib/cms-modal-content";
import { EModalsTypes } from "../../constants/modals-keys";
import { BaseModal } from "../base-modal";
import { FormatItem } from "./FormatItem";
import { enrichFormatsWithCmsIcons } from "./lib/enrich-formats-with-cms-icons";
import { useChooseFormanModal } from "./model/useChooseFormatModal";

const ChevronLeftWhite = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="block"
  >
    <path
      d="M10.8 12L14.7 15.9C14.8833 16.0833 14.975 16.3167 14.975 16.6C14.975 16.8833 14.8833 17.1167 14.7 17.3C14.5167 17.4833 14.2833 17.575 14 17.575C13.7167 17.575 13.4833 17.4833 13.3 17.3L8.7 12.7C8.6 12.6 8.525 12.4917 8.475 12.375C8.44167 12.2583 8.425 12.1333 8.425 12C8.425 11.8667 8.44167 11.7417 8.475 11.625C8.525 11.5083 8.6 11.4 8.7 11.3L13.3 6.7C13.4833 6.51667 13.7167 6.425 14 6.425C14.2833 6.425 14.5167 6.51667 14.7 6.7C14.8833 6.88333 14.975 7.11667 14.975 7.4C14.975 7.68333 14.8833 7.91667 14.7 8.1L10.8 12Z"
      fill="currentColor"
    />
  </svg>
);

const FALLBACK_CONTENT = {
  title: "Choose Format",
  subtitle: "",
  file_name_label: "File name",
  cancel_button: "Cancel",
  download_button: "Convert",
};

export const ChooseFormatAndConvertModal: FC = () => {
  const cms = useCmsModalContent("modals.convert-modal");

  const {
    filename,
    currentFormat,
    dynamicFormatsList,
    setCurrentFormat,
    setFilename,
    handleCancel,
    handleSubmit,
  } = useChooseFormanModal();

  const enrichedFormats = useMemo(
    () => enrichFormatsWithCmsIcons(dynamicFormatsList, cms?.formats),
    [dynamicFormatsList, cms?.formats]
  );

  const title = cms?.title ?? FALLBACK_CONTENT.title;
  const subtitle = cms?.subtitle ?? FALLBACK_CONTENT.subtitle;
  const fileNameLabel =
    cms?.file_name_label ?? FALLBACK_CONTENT.file_name_label;
  const cancelButton = cms?.cancel_button ?? FALLBACK_CONTENT.cancel_button;
  const downloadButton =
    cms?.download_button ?? FALLBACK_CONTENT.download_button;

  return (
    <BaseModal
      headerTitle={title}
      headerSubtitle={subtitle}
      canClose
      rootClassName="max-md:items-end"
      className="flex w-full max-w-[552px] flex-col items-center max-md:mx-0 max-md:max-w-full max-md:rounded-b-none"
      data-testid="choose-format-modal"
      modalType={EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL}
    >
      {/* Mobile drag handle */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 md:hidden">
        <div className="h-1.5 w-10 rounded-full bg-[#e0e0e0]" />
      </div>

      {/* Back button - desktop */}
      <button
        type="button"
        className="border-action-stroke absolute start-5 top-5 flex cursor-pointer items-center justify-center rounded-xl border p-3 max-md:hidden"
        onClick={handleCancel}
        data-testid="choose-format-back-button"
      >
        <img
          src={chevronLeftIcon}
          alt="Back"
          className="size-6 rtl:rotate-180"
        />
      </button>

      <div className="flex flex-col items-start justify-center gap-5 self-stretch px-3 pt-6 max-md:px-4">
        <div className="grid w-full grid-cols-2 gap-3 px-2 max-md:px-0">
          {enrichedFormats.map((item, index) => (
            <FormatItem
              key={`modal-format-item-${index + 1}`}
              item={item}
              isSelected={currentFormat === item.to}
              onSelect={setCurrentFormat}
            />
          ))}
        </div>
        <div className="flex w-full flex-col items-start gap-1 px-2 pb-6 max-md:px-0">
          <label
            className="text-input-label text-[var(--color-input-label)]"
            htmlFor="fileName"
          >
            {fileNameLabel}
          </label>
          <input
            type="text"
            id="fileName"
            name="fileName"
            value={filename}
            data-testid="file-name-input"
            onChange={(e) => setFilename(e.target.value)}
            className="border-os-outline-border flex min-h-14 items-start justify-center gap-0.5 self-stretch rounded-xl border px-3 py-4 outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="sticky bottom-0 z-10 flex w-full items-center justify-center gap-3 rounded-b-[20px] bg-white px-5 pt-3 pb-5 max-md:bg-white/75 max-md:shadow-[0_-4px_12px_0_rgba(0,0,0,0.04)] max-md:backdrop-blur-[20px]">
        <Button
          className="h-12 w-full flex-1 rounded-xl border"
          variant="outlined"
          color="action"
          size="lg"
          onClick={handleCancel}
          data-testid="choose-format-cancel-button"
        >
          {cancelButton}
        </Button>
        <Button
          className="h-12 w-full flex-1 rounded-xl"
          variant="filled"
          color="primary"
          size="lg"
          leftIcon={
            <span className="flex items-center max-md:hidden">
              <ChevronLeftWhite />
            </span>
          }
          onClick={handleSubmit}
          data-testid="choose-format-download-button"
        >
          {downloadButton}
        </Button>
      </div>
    </BaseModal>
  );
};
