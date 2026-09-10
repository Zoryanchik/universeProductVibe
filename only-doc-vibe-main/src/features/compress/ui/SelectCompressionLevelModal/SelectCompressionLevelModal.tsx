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

import { ECompressionLevel } from "../../model/constants/compression-level";
import { formatOriginalSize } from "../../lib/getCompressedSize";
import {
  CompressionLevelItem,
  type ICompressList,
} from "./SelectCompressionLevelItem";

export interface ISelectCompressionLevelModalOptions {
  filename: string;
  fileSize: number;
  isImage: boolean;
  onSubmit: (compressionLevel: ECompressionLevel) => void;
}

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

const LEVEL_ORDER = [
  ECompressionLevel.HIGH,
  ECompressionLevel.MEDIUM,
  ECompressionLevel.LOW,
] as const;

const LEVEL_TEST_IDS: Record<ECompressionLevel, string> = {
  [ECompressionLevel.HIGH]: "high-compression-level-item",
  [ECompressionLevel.MEDIUM]: "medium-compression-level-item",
  [ECompressionLevel.LOW]: "low-compression-level-item",
};

export const SelectCompressionLevelModal: FC = () => {
  const cms = useCmsModalContent("modals.compress-modal");
  const { filename, fileSize, onSubmit } = useCurrentModalOptions(
    EModalsTypes.SELECT_COMPRESSION_LEVEL
  );

  const [selectedLevel, setSelectedLevel] = useState<ECompressionLevel>(
    ECompressionLevel.HIGH
  );

  const cmsLevels = cms?.levels ?? [];

  const compressionLevels: ICompressList[] = LEVEL_ORDER.map((level, i) => ({
    id: level,
    title: cmsLevels[i]?.title ?? "",
    text: cmsLevels[i]?.description ?? "",
  }));

  const handleSubmit = () => {
    onSubmit(selectedLevel);
  };

  return (
    <BaseModal
      headerTitle={cms?.title}
      headerSubtitle={cms?.subtitle}
      canClose
      rootClassName="max-md:items-end"
      className="flex w-full max-w-[800px] flex-col items-center max-md:mx-0 max-md:max-w-full max-md:rounded-b-none"
      data-testid="choose-compression-level-modal"
      modalType={EModalsTypes.SELECT_COMPRESSION_LEVEL}
    >
      {/* Mobile drag handle */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 md:hidden">
        <div className="h-1 w-9 rounded-full bg-black/20" />
      </div>

      <button
        className="absolute start-5 top-5 flex cursor-pointer items-center justify-center rounded-xl border border-black/15 p-3 max-md:hidden"
        onClick={() => closeModal(EModalsTypes.SELECT_COMPRESSION_LEVEL)}
        data-testid="compression-back-button"
      >
        <img
          src={chevronLeftIcon}
          alt="Back"
          className="size-6 rtl:rotate-180"
        />
      </button>

      <div className="flex w-full flex-col items-start gap-5 px-8 pb-6 max-md:px-5">
        <div className="flex w-full items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-4">
          <span
            className="text-text-primary min-w-0 flex-1 truncate text-base font-light"
            data-testid="compress-file-name"
          >
            {filename}
          </span>
          <span
            className="shrink-0 text-base font-light text-black/[0.48]"
            data-testid="compress-file-size"
          >
            {formatOriginalSize(fileSize)}
          </span>
        </div>

        <div className="flex w-full gap-3 max-md:flex-col max-md:gap-0 md:flex-row">
          {compressionLevels.map((item) => (
            <CompressionLevelItem
              key={item.id}
              item={item}
              fileSize={fileSize}
              isSelected={selectedLevel === item.id}
              onSelect={setSelectedLevel}
              finalSizeLabel={cms?.final_size_label ?? ""}
              testId={LEVEL_TEST_IDS[item.id]}
            />
          ))}
        </div>
      </div>

      {/* Submit button - sticky for mobile scroll */}
      <div className="sticky bottom-0 z-10 flex w-full items-center justify-center self-stretch bg-white px-5 pt-3 pb-5">
        <Button
          className="h-12 w-full rounded-xl"
          variant="filled"
          color="primary"
          size="lg"
          leftIcon={
            <span className="flex items-center max-md:hidden">
              <ChevronLeftWhite />
            </span>
          }
          onClick={handleSubmit}
          data-testid="compress-button"
        >
          {cms?.submit_button}
        </Button>
      </div>
    </BaseModal>
  );
};
