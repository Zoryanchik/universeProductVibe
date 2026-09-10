import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { ELanguages } from "@/shared/constants/languages";

import type {
  EditorPageSettings,
  EditorSelectedElement,
  PDFEditorInstance,
} from "./types";

export type EditorToolModalId =
  | "watermark"
  | "signature"
  | "qrcode"
  | "barcode"
  | "material"
  | null;

export type EditorMergeMode = "funnel" | "editor";

export interface EditorDocumentToLoad {
  url: string;
  filename?: string;
}

interface OpenMergeOptions {
  mode?: EditorMergeMode;
  seedFiles?: File[];
}

interface EditorContextValue {
  locale: ELanguages;
  instance: PDFEditorInstance | null;
  setInstance: (instance: PDFEditorInstance | null) => void;
  pageCount: number;
  setPageCount: (count: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  filename: string;
  setFilename: (name: string) => void;
  isDownloadOpen: boolean;
  openDownload: () => void;
  closeDownload: () => void;
  isMergeOpen: boolean;
  mergeMode: EditorMergeMode;
  mergeSeedFiles: File[];
  openMerge: (options?: OpenMergeOptions) => void;
  closeMerge: () => void;
  documentToLoad: EditorDocumentToLoad | null;
  loadDocumentIntoEditor: (url: string, filename?: string) => void;
  clearDocumentToLoad: () => void;
  documentSource: string | null;
  setDocumentSource: (source: string | null) => void;
  isSplitOpen: boolean;
  openSplit: () => void;
  closeSplit: () => void;
  isDocumentLoaded: boolean;
  setIsDocumentLoaded: (value: boolean) => void;
  isDocumentLoading: boolean;
  setIsDocumentLoading: (value: boolean) => void;
  /** True once the initial page thumbnails have finished rendering. */
  isInitialThumbnailsRendered: boolean;
  setIsInitialThumbnailsRendered: (value: boolean) => void;
  selectedElement: EditorSelectedElement | null;
  setSelectedElement: (element: EditorSelectedElement | null) => void;
  pageSettings: EditorPageSettings | null;
  setPageSettings: (settings: EditorPageSettings | null) => void;
  openToolModal: EditorToolModalId;
  openTool: (id: Exclude<EditorToolModalId, null>) => void;
  closeTool: () => void;
  isHandActive: boolean;
  setHandActive: (active: boolean) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  children: React.ReactNode;
  initialFilename?: string;
  locale: ELanguages;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  initialFilename = "",
  locale,
}) => {
  const [instance, setInstance] = useState<PDFEditorInstance | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [filename, setFilename] = useState(initialFilename);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeMode, setMergeMode] = useState<EditorMergeMode>("editor");
  const [mergeSeedFiles, setMergeSeedFiles] = useState<File[]>([]);
  const [documentToLoad, setDocumentToLoad] =
    useState<EditorDocumentToLoad | null>(null);
  const [documentSource, setDocumentSource] = useState<string | null>(null);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [isInitialThumbnailsRendered, setIsInitialThumbnailsRendered] =
    useState(false);
  const [selectedElement, setSelectedElement] =
    useState<EditorSelectedElement | null>(null);
  const [pageSettings, setPageSettings] = useState<EditorPageSettings | null>(
    null
  );
  const [openToolModal, setOpenToolModal] = useState<EditorToolModalId>(null);
  const [isHandActive, setIsHandActive] = useState(false);

  const openDownload = useCallback(() => setIsDownloadOpen(true), []);
  const closeDownload = useCallback(() => setIsDownloadOpen(false), []);
  const openMerge = useCallback((options?: OpenMergeOptions) => {
    setMergeMode(options?.mode ?? "editor");
    setMergeSeedFiles(options?.seedFiles ?? []);
    setIsMergeOpen(true);
  }, []);
  const closeMerge = useCallback(() => {
    setIsMergeOpen(false);
    setMergeMode("editor");
    setMergeSeedFiles([]);
  }, []);
  const loadDocumentIntoEditor = useCallback(
    (url: string, filename?: string) => setDocumentToLoad({ url, filename }),
    []
  );
  const clearDocumentToLoad = useCallback(() => setDocumentToLoad(null), []);
  const openSplit = useCallback(() => setIsSplitOpen(true), []);
  const closeSplit = useCallback(() => setIsSplitOpen(false), []);
  const openTool = useCallback(
    (id: Exclude<EditorToolModalId, null>) => setOpenToolModal(id),
    []
  );
  const closeTool = useCallback(() => setOpenToolModal(null), []);
  const setHandActive = useCallback((active: boolean) => {
    setIsHandActive(active);
  }, []);

  const value = useMemo<EditorContextValue>(
    () => ({
      locale,
      instance,
      setInstance,
      pageCount,
      setPageCount,
      currentPage,
      setCurrentPage,
      zoom,
      setZoom,
      filename,
      setFilename,
      isDownloadOpen,
      openDownload,
      closeDownload,
      isMergeOpen,
      mergeMode,
      mergeSeedFiles,
      openMerge,
      closeMerge,
      documentToLoad,
      loadDocumentIntoEditor,
      clearDocumentToLoad,
      documentSource,
      setDocumentSource,
      isSplitOpen,
      openSplit,
      closeSplit,
      isDocumentLoaded,
      setIsDocumentLoaded,
      isDocumentLoading,
      setIsDocumentLoading,
      isInitialThumbnailsRendered,
      setIsInitialThumbnailsRendered,
      selectedElement,
      setSelectedElement,
      pageSettings,
      setPageSettings,
      openToolModal,
      openTool,
      closeTool,
      isHandActive,
      setHandActive,
    }),
    [
      locale,
      instance,
      pageCount,
      currentPage,
      zoom,
      filename,
      isDownloadOpen,
      openDownload,
      closeDownload,
      isMergeOpen,
      mergeMode,
      mergeSeedFiles,
      openMerge,
      closeMerge,
      documentToLoad,
      loadDocumentIntoEditor,
      clearDocumentToLoad,
      documentSource,
      isSplitOpen,
      openSplit,
      closeSplit,
      isDocumentLoaded,
      isDocumentLoading,
      isInitialThumbnailsRendered,
      selectedElement,
      pageSettings,
      openToolModal,
      openTool,
      closeTool,
      isHandActive,
      setHandActive,
    ]
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextValue => {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider");
  }

  return ctx;
};
