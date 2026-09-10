import { useCallback } from "react";

import { fileToBase64 } from "@/shared/lib/documents/fileToBase64";
import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { generatePDFCover } from "@/shared/lib/documents/generatePdfCover";
import { blobToFile } from "@/shared/lib/documents/blobToFile";

import {
  uploadFileToBucket,
  useGetUploadLink,
  type IUploadLink,
} from "@/entities/documents";

import { useUploadFileToRemoveWatermark } from "../api/api-hooks";

export const useRemoveWatermarkFromPDFBE = () => {
  const getUploadLink = useGetUploadLink();
  const uploadFileToRemoveWatermark = useUploadFileToRemoveWatermark();

  const downloadPdfWithRetry = useCallback(
    async ({
      url,
      filename,
      attempts = 6,
      delayMs = 1000,
    }: {
      url: string;
      filename: string;
      attempts?: number;
      delayMs?: number;
    }) => {
      for (let attempt = 1; attempt <= attempts; attempt += 1) {
        const response = await fetch(url);

        if (response.ok) {
          const blob = await response.blob();

          return blobToFile(blob, filename);
        }

        if (response.status !== 403 && response.status !== 404) {
          throw new Error(response.statusText);
        }

        if (attempt === attempts) {
          throw new Error(response.statusText);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      throw new Error("Failed to download file");
    },
    []
  );

  const uploadFile = useCallback(
    async ({
      file,
      uploadLink: paramUploadLink,
      texts,
    }: {
      file: File;
      uploadLink?: IUploadLink;
      texts?: string[];
    }) => {
      const [uploadLink, pagesCount] = await Promise.all([
        paramUploadLink
          ? Promise.resolve(paramUploadLink)
          : getUploadLink(file.name),
        countPdfPages(file),
      ]);

      if (!uploadLink) {
        throw new Error("Upload link not found");
      }

      if (!paramUploadLink) {
        await uploadFileToBucket({ file, url: uploadLink.url });
      }

      const document = await uploadFileToRemoveWatermark({
        file,
        uploadUrl: uploadLink.url,
        text: texts,
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return { document, uploadLink, pagesCount };
    },
    [getUploadLink, uploadFileToRemoveWatermark]
  );

  // uploadLink is passed only to remove watermark from existing pdf file (already uploaded to bucket)
  return useCallback(
    async ({
      file,
      uploadLink: paramUploadLink,
      texts,
    }: {
      file: File;
      uploadLink?: IUploadLink;
      texts?: string[];
    }) => {
      const { document, uploadLink, pagesCount } = await uploadFile({
        file,
        uploadLink: paramUploadLink,
        texts,
      });

      const newFile = await downloadPdfWithRetry({
        url: document.document.url,
        filename: file.name,
      });

      const arrayBuffer = await newFile.arrayBuffer();

      const [previewBlob, base64] = await Promise.all([
        generatePDFCover({
          pdfFileArrayBuffer: arrayBuffer,
          width: 700,
          throwError: true,
        }),
        fileToBase64(newFile),
      ]);

      if (!previewBlob) {
        throw new Error("Preview blob not found");
      }

      const previewFile = blobToFile(previewBlob, "preview.png");

      const previewBase64 = await fileToBase64(previewBlob);

      return {
        document: document.document,
        uploadLink,
        base64,
        pagesCount,
        newFile,
        previewFile,
        previewBase64,
      };
    },
    [uploadFile, downloadPdfWithRetry]
  );
};
