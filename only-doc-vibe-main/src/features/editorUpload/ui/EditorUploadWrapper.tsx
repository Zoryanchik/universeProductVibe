"use client";

import { useCallback, useState, type FC, type PropsWithChildren } from "react";
import { Toaster } from "@universe-forma/ui-pes";

import { CustomSlot } from "@/shared/ui/CustomSlot";
import type { InternalFileType } from "@/shared/constants/file-type";
import { validateFile } from "@/shared/lib/documents/validateFIle";
import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { logger } from "@/shared/lib/utils/logger";

import { EFunnels, type EFunnels as EFunnelsType } from "@/entities/documents";

import { useEditorUploadFlow } from "../model/useEditorUploadFlow";

interface Props extends PropsWithChildren {
  funnel: EFunnelsType;
  acceptedFormats: InternalFileType[];
}

export const EditorUploadWrapper: FC<Props> = ({
  funnel,
  acceptedFormats,
  children,
}) => {
  const { t } = useTranslation();
  const { uploadToEditor } = useEditorUploadFlow({ funnel });
  const [error, setError] = useState<string | null>(null);
  const multiple = funnel === EFunnels.MERGE_PDF;

  const onFileUpload = useCallback(
    async (files: FileList) => {
      setError(null);

      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      if (funnel === EFunnels.MERGE_PDF && fileArray.length < 2) {
        setError(String(t("api_errors.error.processing.merge-pdfs-min-files")));

        return;
      }

      for (const file of fileArray) {
        const validationResult = await validateFile({
          file,
          allowedFileTypes: acceptedFormats,
          t,
        });

        if (!validationResult.valid) {
          setError(validationResult.error);

          return;
        }
      }

      try {
        await uploadToEditor(fileArray);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : String(t("api_errors.error.file.file-missing"));

        setError(message);
        logger.error("Editor upload wrapper failed:", err);
      }
    },
    [acceptedFormats, funnel, t, uploadToEditor]
  );

  return (
    <>
      <CustomSlot onFileUpload={onFileUpload} multiple={multiple}>
        {children}
      </CustomSlot>
      {error ? (
        <p className="mt-2 text-center text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      <Toaster />
    </>
  );
};
