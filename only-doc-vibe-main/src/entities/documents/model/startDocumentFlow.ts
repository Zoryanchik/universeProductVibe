import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";
import type { InternalFileType } from "@/shared/constants/file-type";
import { logger } from "@/shared/lib/utils/logger";

import type { EFunnels } from "./constants/funnels";
import type { EServiceType } from "./constants/service";
import { startFlow } from "./store/documents-store";
import { getWillDownloadBySSE } from "../lib/getWillDownloadBySSE";

interface IStartDocumentFlowParams {
  funnel: EFunnels;
  service: EServiceType;
  formatTo: InternalFileType;
  file?: File;
  filename?: string;
  fileSize?: number;
  formatFrom?: InternalFileType;
}

export const startDocumentFlow = async ({
  file,
  funnel,
  service,
  formatTo,
  filename,
  formatFrom,
  fileSize,
}: IStartDocumentFlowParams) => {
  const fileName = filename || file?.name || "default";
  const from = (getFIleTypeFromFilename(fileName) || formatFrom)!;

  const willDownloadBySSE = getWillDownloadBySSE({
    service,
    formatFrom: from,
    formatTo,
  });

  logger.log(
    `[startDocumentFlow] Starting flow - service: ${service}, funnel: ${funnel}, file: ${fileName}`
  );

  startFlow({
    formatFrom: from,
    formatTo,
    funnel,
    serviceType: service,
    filename: getFileNameWithoutFormat(fileName),
    initialFileSize: fileSize || file?.size || 0,
    willDownloadBySSE,
  });
};
