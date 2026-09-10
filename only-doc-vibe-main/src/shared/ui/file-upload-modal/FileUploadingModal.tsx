import type { FC } from "react";
import { useEffect } from "react";
import hintIcon from "@public/assets/modal/hint-icon.svg?url";
import fileIcon from "@public/assets/modal/file-icon-animated.svg?url";

import {
  updateCurrentModalOptions,
  useCurrentModalOptions,
} from "../../lib/modals/modals-store";
import { useCmsModalContent } from "../../lib/cms-modal-content";
import { useAnimatedProgress } from "../../lib/ui/useAnimatedProgress";
import type { EModalsTypes } from "../../constants/modals-keys";
import { BaseModal } from "../base-modal";
import { ProgressBar } from "./model/ProgressBar";
import { PROGRESS_TO_BAR_PROGRESS_MAP } from "./model/constants";
import type { IFileUploadingModalOptions } from "./model/types";

interface IProps {
  type: EModalsTypes.EDIT_UPLOADING | EModalsTypes.WATERMARK_REMOVING;
}

export const FileUploadingModal: FC<IProps> = ({ type }) => {
  const {
    downloadProgress,
    durationSeconds = 5,
    filename,
  }: IFileUploadingModalOptions = useCurrentModalOptions(type);
  const cms = useCmsModalContent("modals.upload-processing-modal");

  const { progress, barProgress } = useAnimatedProgress({
    durationInSeconds: durationSeconds,
    progressBarMap: PROGRESS_TO_BAR_PROGRESS_MAP,
  });

  useEffect(() => {
    if (progress > downloadProgress) {
      updateCurrentModalOptions(type, (prev) =>
        prev.downloadProgress >= 100
          ? prev
          : { ...prev, downloadProgress: progress }
      );
    }
    // eslint-disable-next-line
  }, [progress]);

  return (
    <BaseModal
      className="flex max-w-[432px] flex-col items-center overflow-hidden px-2 max-sm:mx-6"
      modalType={type}
      data-testid="progress-edit-file-modal"
      canClose={false}
    >
      <div className="flex w-full flex-col items-center gap-8 self-stretch p-8">
        {/* Document icon */}
        <div className="flex h-[140px] items-center justify-center self-stretch">
          <div className="relative flex items-center justify-center">
            {/* Background glow behind the document card */}
            <div
              className="absolute -inset-6 blur-[30px]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(53,165,149,0.35) 0%, rgba(53,165,149,0.15) 40%, transparent 70%)",
              }}
            />
            <img
              src={fileIcon}
              className="relative z-10 h-[200px] w-auto"
              alt=""
            />
          </div>
        </div>

        {/* Title, filename, progress */}
        <div className="flex w-full flex-col items-center gap-2">
          <span className="text-desktop-title-5 text-text-primary text-center font-semibold">
            {cms?.processing_text}
          </span>

          {filename && (
            <span className="w-full truncate text-center text-sm leading-[18px]">
              {filename}
            </span>
          )}

          <ProgressBar className="mt-0" progress={barProgress} />

          <div className="text-text-primary text-center text-base leading-5 font-bold">
            {barProgress}%
          </div>
        </div>

        <div className="border-primary flex items-start gap-4 self-stretch rounded-2xl border-2 bg-white/75 p-4 backdrop-blur-[50px] max-sm:-mx-6.5">
          <div className="bg-state-primary-hover flex size-10 items-center justify-center self-stretch rounded-xl p-2">
            <img src={hintIcon} alt="Hint" />
          </div>
          <div className="text-text-primary flex min-h-10 flex-1 flex-col items-start justify-center">
            <span className="self-stretch text-[18px] leading-5 font-semibold">
              {cms?.tip_title}
            </span>
            <span className="text-body self-stretch">{cms?.tip_message}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
