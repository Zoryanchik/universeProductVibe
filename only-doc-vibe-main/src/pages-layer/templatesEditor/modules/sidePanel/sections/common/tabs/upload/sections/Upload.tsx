import type { FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import {
  UploadDropArea,
  type UploadDropAreaProps,
} from "../../../../../../../ui/UploadDropArea";

export const UploadSection: FC<UploadDropAreaProps> = ({
  tool,
  from,
  maxSize,
  formats,
  buttonLabel,
  onFileUpload,
}) => {
  const { t } = useTranslation();

  return (
    <UploadDropArea
      tool={tool}
      from={from}
      maxSize={maxSize}
      formats={formats}
      buttonLabel={
        buttonLabel ??
        (t("templatesEditor.side_panel.upload.choose_local_file") as string)
      }
      onFileUpload={onFileUpload}
    />
  );
};
