import type { FC } from "react";
import { useEffect } from "react";

import { EModalsTypes } from "../../constants/modals-keys";
import { useAnimatedProgress } from "../../lib/ui/useAnimatedProgress";
import {
  updateCurrentModalOptions,
  useCurrentModalOptions,
} from "../../lib/modals/modals-store";

interface IProgressModifyFileModalProps {
  text: string;
}

export interface IProgressModifyFileModalOptions {
  downloadProgress: number;
  onFinished?: () => void;
  durationSeconds?: number;
}

const PROGRESS_TO_BAR_PROGRESS_MAP = {
  10: 10,
  35: 20,
  50: 35,
  70: 50,
  80: 70,
  90: 93,
};

const ProgressModifyFileModal: FC<IProgressModifyFileModalProps> = ({
  text,
}) => {
  const { downloadProgress, durationSeconds = 5 } = useCurrentModalOptions(
    EModalsTypes.COMPRESSING_FILE_MODAL
  );

  const { progress } = useAnimatedProgress({
    durationInSeconds: durationSeconds,
    progressBarMap: PROGRESS_TO_BAR_PROGRESS_MAP,
  });

  useEffect(() => {
    if (progress > downloadProgress) {
      updateCurrentModalOptions(
        EModalsTypes.COMPRESSING_FILE_MODAL,
        (prev: { downloadProgress: number }) =>
          prev.downloadProgress >= 100
            ? prev
            : { ...prev, downloadProgress: progress }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return <>{text}</>;
};

export default ProgressModifyFileModal;
