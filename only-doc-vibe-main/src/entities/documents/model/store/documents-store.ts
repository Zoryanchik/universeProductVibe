import { create } from "zustand";

import type { InternalFileType } from "@/shared/constants/file-type";
import { createSelectors } from "@/shared/lib/state/createSelectors";

import {
  clearEditorHandoffPdf,
  setEditorHandoffPdf,
} from "../../lib/editor-handoff-storage";
import { DocumentsStorage } from "./documents-storage";
import type { EFunnels } from "../constants/funnels";
import type { EServiceType } from "../constants/service";

interface IDocumentsStore {
  formatFrom: InternalFileType | null;
  formatTo: InternalFileType | null;
  filename: string | null;
  pdfFileContent: string | null;
  funnel: EFunnels | null;
  serviceType: EServiceType | null;
  initialFileSize: number | null;
  initialPagesCount: number | null;
  fileKey: string | null;
  documentId: string | null;
  uploadUrl: string | null;
  urlExpiresAt: number | null;
  previewUrl: string | null;
  resultFileUrl: string | null;
  originalFileUrl: string | null;
  willDownloadBySSE: boolean | null;
  previewFileContent: string | null;
}

const getInitialState = (): IDocumentsStore => ({
  formatFrom: DocumentsStorage.getFormatFrom(),
  formatTo: DocumentsStorage.getFormatTo(),
  filename: DocumentsStorage.getFilename(),
  pdfFileContent: null,
  funnel: DocumentsStorage.getFunnel(),
  serviceType: DocumentsStorage.getServiceType(),
  initialFileSize: DocumentsStorage.getInitialFileSize(),
  initialPagesCount: DocumentsStorage.getInitialPagesCount(),
  fileKey: DocumentsStorage.getFileKey(),
  uploadUrl: DocumentsStorage.getUploadUrl(),
  documentId: DocumentsStorage.getDocumentId(),
  urlExpiresAt: DocumentsStorage.getUrlExpiresAt(),
  previewUrl: DocumentsStorage.getPreviewUrl(),
  resultFileUrl: DocumentsStorage.getResultFileUrl(),
  originalFileUrl: null,
  willDownloadBySSE: null,
  previewFileContent: null,
});

const documentsStore = create<IDocumentsStore>(getInitialState);

export async function asyncInitDocumentsStore() {
  const pdfFileContent = await DocumentsStorage.getPDFfileContent();
  const previewFileContent = await DocumentsStorage.getPreviewFileContent();

  documentsStore.setState({ pdfFileContent, previewFileContent });
}

// init documents store on start of the app
asyncInitDocumentsStore();

export const setFormatFrom = (formatFrom: InternalFileType) => {
  DocumentsStorage.setFormatFrom(formatFrom);
  documentsStore.setState({ formatFrom });
};

export const setFormatTo = (formatTo: InternalFileType) => {
  DocumentsStorage.setFormatTo(formatTo);
  documentsStore.setState({ formatTo });
};

export const setFilename = (filename: string) => {
  DocumentsStorage.setFilename(filename);
  documentsStore.setState({ filename });
};

export const setPdfFileContent = async (pdfFileContent: string) => {
  documentsStore.setState({ pdfFileContent });
  await DocumentsStorage.setPDFfileContent(pdfFileContent);
};

export const setFunnel = (funnel: EFunnels) => {
  DocumentsStorage.setFunnel(funnel);
  documentsStore.setState({ funnel });
};

export const clearFunnel = () => {
  DocumentsStorage.clearFunnel();
  documentsStore.setState({ funnel: null });
};

export const setServiceType = (serviceType: EServiceType) => {
  DocumentsStorage.setServiceType(serviceType);
  documentsStore.setState({ serviceType });
};

export const setInitialFileSize = (initialFileSize: number) => {
  DocumentsStorage.setInitialFileSize(initialFileSize);
  documentsStore.setState({ initialFileSize });
};

export const setInitialPagesCount = (initialPagesCount: number) => {
  DocumentsStorage.setInitialPagesCount(initialPagesCount);
  documentsStore.setState({ initialPagesCount });
};

export const setFileKey = (fileKey: string) => {
  DocumentsStorage.setFileKey(fileKey);
  documentsStore.setState({ fileKey });
};

export const setUploadUrl = (uploadUrl: string) => {
  DocumentsStorage.setUploadUrl(uploadUrl);
  documentsStore.setState({ uploadUrl });
};

export const setDocumentId = (documentId: string) => {
  DocumentsStorage.setDocumentId(documentId);
  documentsStore.setState({ documentId });
};

const GET_DEFAULT_URL_EXPIRES_AT = () => Date.now() + 5 * 60 * 1000;

export const setUrlExpiresAt = (
  urlExpiresAt: number = GET_DEFAULT_URL_EXPIRES_AT()
) => {
  DocumentsStorage.setUrlExpiresAt(urlExpiresAt);
  documentsStore.setState({ urlExpiresAt });
};

export const setPreviewUrl = (previewUrl: string) => {
  DocumentsStorage.setPreviewUrl(previewUrl);
  documentsStore.setState({ previewUrl });
};

export const setResultFileUrl = (resultFileUrl: string) => {
  DocumentsStorage.setResultFileUrl(resultFileUrl);
  documentsStore.setState({ resultFileUrl });
};

export const setOriginalFileUrl = (originalFileUrl: string) => {
  documentsStore.setState({ originalFileUrl });
};

export const clearDocumentsStorage = () => {
  DocumentsStorage.clearAll();
  void clearEditorHandoffPdf();
  documentsStore.setState(getInitialState());
};

export const setPreviewFileContent = async (previewFileContent: string) => {
  documentsStore.setState({ previewFileContent });
  await DocumentsStorage.setPreviewFileContent(previewFileContent);
};

export const clearPreviewFileContent = async () => {
  documentsStore.setState({ previewFileContent: null });
  await DocumentsStorage.clearPreviewFileContent();
};

export const clearPdfFileContent = async () => {
  documentsStore.setState({ pdfFileContent: null });
  await DocumentsStorage.clearPDFfileContent();
  await clearEditorHandoffPdf();
};

/** Drop any persisted upload handoff after the editor has loaded the document. */
export const finalizeEditorHandoff = async () => {
  await clearPdfFileContent();
};

export const prepareEditorHandoff = async (data: {
  funnel: EFunnels;
  filename: string;
  formatFrom: InternalFileType;
  formatTo: InternalFileType;
  initialFileSize: number;
  initialPagesCount: number;
  pdfFileContent: string;
}) => {
  DocumentsStorage.clearAll();
  DocumentsStorage.setFormatFrom(data.formatFrom);
  DocumentsStorage.setFormatTo(data.formatTo);
  DocumentsStorage.setFunnel(data.funnel);
  DocumentsStorage.setInitialFileSize(data.initialFileSize);
  DocumentsStorage.setFilename(data.filename);
  DocumentsStorage.setInitialPagesCount(data.initialPagesCount);

  documentsStore.setState({
    ...getInitialState(),
    formatFrom: data.formatFrom,
    formatTo: data.formatTo,
    funnel: data.funnel,
    filename: data.filename,
    initialFileSize: data.initialFileSize,
    initialPagesCount: data.initialPagesCount,
  });

  await DocumentsStorage.clearPDFfileContent();
  // Clear any stale handoff first, then set, so the new value is the last
  // write that wins on the IndexedDB cache (avoids a clear/set race).
  await clearEditorHandoffPdf();
  await setEditorHandoffPdf(data.pdfFileContent);
};

/**
 * Lighter handoff for the merge funnel: no PDF is handed off to the canvas
 * because the raw files are arranged in the merge window first. Only the funnel
 * and a default filename are persisted so the editor opens the merge window.
 */
export const prepareMergeEditorHandoff = (data: {
  funnel: EFunnels;
  filename: string;
}) => {
  DocumentsStorage.clearAll();
  void clearEditorHandoffPdf();
  DocumentsStorage.setFunnel(data.funnel);
  DocumentsStorage.setFilename(data.filename);

  documentsStore.setState({
    ...getInitialState(),
    funnel: data.funnel,
    filename: data.filename,
  });
};

export const startFlow = (data: {
  serviceType: EServiceType;
  funnel: EFunnels;
  filename: string;
  formatFrom: InternalFileType;
  initialFileSize: number;
  formatTo: InternalFileType;
  willDownloadBySSE: boolean;
}) => {
  DocumentsStorage.clearAll();
  void clearEditorHandoffPdf();
  DocumentsStorage.setFormatFrom(data.formatFrom);
  DocumentsStorage.setFormatTo(data.formatTo);
  DocumentsStorage.setFunnel(data.funnel);
  DocumentsStorage.setServiceType(data.serviceType);
  DocumentsStorage.setInitialFileSize(data.initialFileSize);
  DocumentsStorage.setFilename(data.filename);
  DocumentsStorage.setWillDownloadBySSE(data.willDownloadBySSE);

  documentsStore.setState({
    ...getInitialState(),
    formatFrom: data.formatFrom,
    formatTo: data.formatTo,
    funnel: data.funnel,
    filename: data.filename,
    serviceType: data.serviceType,
    initialFileSize: data.initialFileSize,
  });
};

export const useDocumentsStore = createSelectors(documentsStore);
