import { useCallback } from "react";

import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";
import { logger } from "@/shared/lib/utils/logger";

import {
  bulkDeleteFiles,
  deleteFile,
  duplicateFile,
  getDownloadInfo,
  getShareLink,
  renameFile,
  shareFileViaEmail,
  type IUserFile,
} from "@/entities/documents";
import {
  addDashboardFile,
  removeDashboardFiles,
  updateDashboardFile,
} from "@/entities/documents";

/**
 * Hook collecting all dashboard row/bulk actions wired against the BE.
 * Each action updates the dashboard store on success so the UI can refresh
 * without having to refetch.
 */
export const useDashboardActions = () => {
  const downloadOne = useCallback(async (file: IUserFile): Promise<boolean> => {
    try {
      const info = await getDownloadInfo(file.id);
      downloadByUrl({ url: info.url, filename: info.filename });

      return true;
    } catch (error) {
      logger.error("Failed to download file", error);

      return false;
    }
  }, []);

  const downloadMany = useCallback(
    async (files: IUserFile[]): Promise<void> => {
      for (const file of files) {
        await downloadOne(file);
      }
    },
    [downloadOne]
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteFile(id);
      removeDashboardFiles([id]);

      return true;
    } catch (error) {
      logger.error("Failed to delete file", error);

      return false;
    }
  }, []);

  const removeMany = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return true;

    try {
      await bulkDeleteFiles(ids);
      removeDashboardFiles(ids);

      return true;
    } catch (error) {
      logger.error("Failed to bulk-delete files", error);

      return false;
    }
  }, []);

  const rename = useCallback(
    async (id: string, filename: string): Promise<boolean> => {
      try {
        await renameFile(id, filename);
        updateDashboardFile(id, { filename });

        return true;
      } catch (error) {
        logger.error("Failed to rename file", error);

        return false;
      }
    },
    []
  );

  const duplicate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const copy = await duplicateFile(id);
      addDashboardFile({
        id: copy.id,
        filename: copy.filename,
        internal_type: copy.internal_type,
        creation_type: "USER",
        processing_status: copy.processing_status,
        size: Number(copy.size) || 0,
        created_at: copy.created_at,
        aws_url: copy.aws_url,
        original_file_id: null,
      });

      return true;
    } catch (error) {
      logger.error("Failed to duplicate file", error);

      return false;
    }
  }, []);

  const fetchShareLink = useCallback(
    async (id: string): Promise<string | null> => {
      try {
        return await getShareLink(id);
      } catch (error) {
        logger.error("Failed to fetch share link", error);

        return null;
      }
    },
    []
  );

  const sendByEmail = useCallback(
    async (data: {
      fileId: string;
      filename: string;
      recipientEmail: string;
      message?: string;
    }): Promise<boolean> => {
      try {
        await shareFileViaEmail(data);

        return true;
      } catch (error) {
        logger.error("Failed to send file via email", error);

        return false;
      }
    },
    []
  );

  const print = useCallback(async (file: IUserFile): Promise<boolean> => {
    try {
      const info = await getDownloadInfo(file.id);
      const printWindow = window.open(info.url, "_blank");
      if (!printWindow) return false;

      printWindow.addEventListener("load", () => {
        try {
          printWindow.print();
        } catch (error) {
          logger.error("Failed to invoke print()", error);
        }
      });

      return true;
    } catch (error) {
      logger.error("Failed to print file", error);

      return false;
    }
  }, []);

  return {
    downloadOne,
    downloadMany,
    remove,
    removeMany,
    rename,
    duplicate,
    fetchShareLink,
    sendByEmail,
    print,
  };
};
