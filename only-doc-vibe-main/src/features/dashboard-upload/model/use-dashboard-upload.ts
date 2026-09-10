import { useState } from "react";

import { logger } from "@/shared/lib/utils/logger";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { showToast } from "@/shared/lib/toast/toast-store";
import { useTranslation } from "@/shared/lib/translations";

import {
  getUploadLink,
  registerUploadedFile,
  uploadFileToBucket,
  type IUploadLink,
  type IUserFile,
} from "@/entities/documents";
import {
  addDashboardFile,
  setDashboardPreviewFileId,
} from "@/entities/documents";

interface UseDashboardUploadResult {
  /** Number of in-flight uploads. */
  inFlight: number;
  /** Last error message, cleared on next successful upload. */
  error: string | null;
  /** Upload one or more File objects. Returns the registered server records. */
  upload: (files: File[]) => Promise<IUserFile[]>;
}

const fileToUserFile = (file: {
  id: string;
  filename: string;
  internal_type: string;
  size: string | number;
  created_at: string;
  aws_url: string;
  processing_status: string;
}): IUserFile => ({
  id: file.id,
  filename: file.filename,
  internal_type: file.internal_type,
  creation_type: "USER",
  processing_status: file.processing_status,
  size: typeof file.size === "string" ? Number(file.size) || 0 : file.size,
  created_at: file.created_at,
  aws_url: file.aws_url,
  original_file_id: null,
});

export const useDashboardUpload = (): UseDashboardUploadResult => {
  const { t } = useTranslation();
  const [inFlight, setInFlight] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadOne = async (file: File): Promise<IUserFile | null> => {
    try {
      const link = (await getUploadLink<string>(
        file.name
      )) as IUploadLink | null;
      if (!link) throw new Error("upload-link-failed");

      await uploadFileToBucket({ url: link.url, file });
      const key = getFileKeyFromAWSLink(link.url);

      const stored = await registerUploadedFile({
        filename: file.name,
        size: file.size,
        key,
        pagesCount: null,
      });

      const userFile = fileToUserFile(stored);
      addDashboardFile(userFile);
      showToast(String(t("dashboard.toast.fileAdded")), {
        type: "success",
        icon: "check",
        position: "top",
        duration: 4000,
        action: {
          label: String(t("dashboard.toast.open")),
          onClick: () => setDashboardPreviewFileId(userFile.id),
        },
      });

      return userFile;
    } catch (err) {
      logger.error("Dashboard upload failed", err);

      return null;
    }
  };

  const upload = async (files: File[]): Promise<IUserFile[]> => {
    if (files.length === 0) return [];

    setError(null);
    setInFlight((n) => n + files.length);
    try {
      const results = await Promise.all(files.map(uploadOne));
      const successes = results.filter((r): r is IUserFile => r !== null);
      if (successes.length < files.length) {
        setError(String(t("dashboard.toast.uploadError")));
      }

      return successes;
    } finally {
      setInFlight((n) => Math.max(0, n - files.length));
    }
  };

  return { inFlight, error, upload };
};
