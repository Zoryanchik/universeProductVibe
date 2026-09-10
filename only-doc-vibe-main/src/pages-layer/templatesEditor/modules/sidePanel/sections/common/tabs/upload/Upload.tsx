import type { FC } from "react";

import { type UploadDropAreaProps } from "../../../../../../ui/UploadDropArea";
import { UploadSection } from "./sections/Upload";
import {
  MyUploadsSection,
  type MyUploadsSectionProps,
} from "./sections/MyUploads";

interface UploadTabProps extends UploadDropAreaProps, MyUploadsSectionProps {}

export const UploadTab: FC<UploadTabProps> = ({
  tool,
  from,
  maxSize,
  formats,
  buttonLabel,
  onFileUpload,
  count,
  uploadLabel,
  UploadList,
}) => {
  return (
    <>
      <UploadSection
        tool={tool}
        from={from}
        formats={formats}
        buttonLabel={buttonLabel}
        onFileUpload={onFileUpload}
        maxSize={maxSize}
      />
      <MyUploadsSection
        count={count}
        uploadLabel={uploadLabel}
        UploadList={UploadList}
      />
    </>
  );
};
