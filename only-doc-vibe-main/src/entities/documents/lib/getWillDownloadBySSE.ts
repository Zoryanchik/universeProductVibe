import {
  InternalFileType,
  isUnconvertibleOnFeFileType,
} from "@/shared/constants/file-type";

import { EServiceType } from "../model/constants/service";

interface IGetWillDownloadBySSEParams {
  service: EServiceType;
  formatFrom: InternalFileType;
  formatTo: InternalFileType;
}

const SSE_SERVICES = [
  EServiceType.COMPRESSOR,
  EServiceType.OCR,
  EServiceType.TRANSLATE,
  EServiceType.UNLOCK_PDF,
];

export const getWillDownloadBySSE = ({
  formatFrom,
  formatTo,
  service,
}: IGetWillDownloadBySSEParams): boolean => {
  const isConverter = service === EServiceType.CONVERTOR;

  if (SSE_SERVICES.includes(service)) return true;

  if (isConverter && isUnconvertibleOnFeFileType(formatFrom)) return true;

  if (isConverter && formatTo !== InternalFileType.PDF) return true;

  return false;
};
