import { useCallback, useEffect, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { fileToBase64 } from "@/shared/lib/documents/fileToBase64";
import { generatePDFCover } from "@/shared/lib/documents/generatePdfCover";
import { mergePdfFiles } from "@/shared/lib/documents/mergePdfFiles";
import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { logger } from "@/shared/lib/utils/logger";

import { consumeMergeHandoffFiles } from "@/entities/documents";

import {
  DEFAULT_EDITOR_EXPORT_SETTINGS,
  exportDocumentPdf,
  useEditor,
} from "@/features/editor/@x/editor-document-actions";

const PDF_MIME = "application/pdf";
const THUMBNAIL_WIDTH = 280;
const MIN_MERGE_FILES = 2;
const MAX_MERGE_FILES = 15;

export interface MergeItem {
  id: string;
  file: File;
  previewUrl: string | null;
  pageCount: number;
  isCurrentDocument: boolean;
}

export const isPdfFile = (file: File): boolean =>
  file.type === PDF_MIME || /\.pdf$/i.test(file.name);

const stripExtension = (name: string): string =>
  name.replace(/\.(pdf|png|jpe?g)$/i, "");

const createId = (): string =>
  `merge-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const generateCover = async (file: File): Promise<string | null> => {
  try {
    const buffer = await file.arrayBuffer();
    const blob = await generatePDFCover({
      pdfFileArrayBuffer: buffer,
      width: THUMBNAIL_WIDTH,
    });

    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
};

const safeCountPages = async (file: File): Promise<number> => {
  try {
    return Math.max(await countPdfPages(file), 1);
  } catch {
    return 1;
  }
};

const buildItem = async (
  file: File,
  isCurrentDocument = false
): Promise<MergeItem> => {
  const [previewUrl, pageCount] = await Promise.all([
    generateCover(file),
    safeCountPages(file),
  ]);

  return { id: createId(), file, previewUrl, pageCount, isCurrentDocument };
};

const deriveOutputName = (
  filename: string | null,
  mode: "funnel" | "editor"
): string => {
  if (mode === "funnel") return "merged";

  const base = stripExtension(filename || "");

  return base ? `${base}-merged` : "merged";
};

export const useMergeWindow = () => {
  const { t } = useTranslation();
  const {
    isMergeOpen,
    mergeMode,
    mergeSeedFiles,
    closeMerge,
    instance,
    filename,
    loadDocumentIntoEditor,
  } = useEditor();

  const [items, setItems] = useState<MergeItem[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [outputName, setOutputName] = useState("merged");
  const [error, setError] = useState<string | null>(null);
  const [invalidWarning, setInvalidWarning] = useState<string | null>(null);

  const itemsRef = useRef<MergeItem[]>([]);
  itemsRef.current = items;

  const mergeSeedFilesRef = useRef<File[]>(mergeSeedFiles);
  mergeSeedFilesRef.current = mergeSeedFiles;
  const filenameRef = useRef<string | null>(filename);
  filenameRef.current = filename;
  const instanceRef = useRef(instance);
  instanceRef.current = instance;

  const seedSessionRef = useRef(0);

  const revokeAll = useCallback(() => {
    itemsRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, []);

  const exportCurrentDocument = useCallback(async (): Promise<File | null> => {
    if (!instanceRef.current) return null;

    try {
      const blob = await exportDocumentPdf(
        instanceRef.current,
        DEFAULT_EDITOR_EXPORT_SETTINGS
      );
      const base =
        stripExtension(filenameRef.current || "document") || "document";

      return new File([blob], `${base}.pdf`, { type: PDF_MIME });
    } catch (err) {
      logger.error("Failed to export current document for merge", err);

      return null;
    }
  }, []);

  // Seed the working list whenever the window opens, and tear it down on close.
  useEffect(() => {
    if (!isMergeOpen) {
      revokeAll();
      setItems([]);
      setError(null);
      setInvalidWarning(null);
      setIsSeeding(false);

      return;
    }

    const session = ++seedSessionRef.current;
    setIsSeeding(true);
    setError(null);
    setInvalidWarning(null);
    setOutputName(deriveOutputName(filenameRef.current, mergeMode));

    void (async () => {
      try {
        const seedFiles: { file: File; isCurrent: boolean }[] = [];

        if (mergeMode === "funnel") {
          const handoff = await consumeMergeHandoffFiles();
          handoff.forEach((file) => seedFiles.push({ file, isCurrent: false }));
        } else {
          const current = await exportCurrentDocument();
          if (current) seedFiles.push({ file: current, isCurrent: true });

          mergeSeedFilesRef.current
            .filter(isPdfFile)
            .forEach((file) => seedFiles.push({ file, isCurrent: false }));
        }

        const cappedSeedFiles = seedFiles.slice(0, MAX_MERGE_FILES);

        const built = await Promise.all(
          cappedSeedFiles.map(({ file, isCurrent }) =>
            buildItem(file, isCurrent)
          )
        );

        if (session !== seedSessionRef.current) {
          built.forEach((item) => {
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          });

          return;
        }

        setItems(built);

        if (seedFiles.length > MAX_MERGE_FILES) {
          setInvalidWarning(
            String(
              t("editor_page.merge_modal.max_files_hint", {
                count: MAX_MERGE_FILES,
              })
            )
          );
        }
      } catch (err) {
        logger.error("Failed to seed merge window", err);

        if (session === seedSessionRef.current) {
          setError(String(t("editor_page.merge_modal.seed_failed")));
        }
      } finally {
        if (session === seedSessionRef.current) setIsSeeding(false);
      }
    })();
    // Reseeding only happens on open/mode change; files added later are appended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMergeOpen, mergeMode]);

  useEffect(() => revokeAll, [revokeAll]);

  const addFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const incomingArray = Array.from(incoming);
      const valid = incomingArray.filter(isPdfFile);
      const invalid = incomingArray.filter((file) => !isPdfFile(file));

      if (invalid.length > 0) {
        setInvalidWarning(
          String(
            t("editor_page.merge_modal.invalid_file", {
              filename: invalid.map((file) => file.name).join(", "),
            })
          )
        );
      } else {
        setInvalidWarning(null);
      }

      if (valid.length === 0) return;

      const availableSlots = MAX_MERGE_FILES - itemsRef.current.length;

      if (availableSlots <= 0) {
        setInvalidWarning(
          String(
            t("editor_page.merge_modal.max_files_hint", {
              count: MAX_MERGE_FILES,
            })
          )
        );

        return;
      }

      const accepted = valid.slice(0, availableSlots);
      if (accepted.length < valid.length) {
        setInvalidWarning(
          String(
            t("editor_page.merge_modal.max_files_hint", {
              count: MAX_MERGE_FILES,
            })
          )
        );
      }

      const built = await Promise.all(accepted.map((file) => buildItem(file)));
      setItems((prev) => [...prev, ...built]);
    },
    [t]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);

      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const moveItem = useCallback((activeId: string, overId: string) => {
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === activeId);
      const newIndex = prev.findIndex((item) => item.id === overId);
      if (oldIndex < 0 || newIndex < 0) return prev;

      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const submitMerge = useCallback(async () => {
    const current = itemsRef.current;

    if (current.length < MIN_MERGE_FILES) {
      setError(String(t("editor_page.merge_modal.min_files_hint")));

      return;
    }

    setIsMerging(true);
    setError(null);

    try {
      const baseName = stripExtension(outputName || "merged") || "merged";
      const merged = await mergePdfFiles(
        current.map((item) => item.file),
        `${baseName}.pdf`
      );
      const base64 = await fileToBase64(merged);

      loadDocumentIntoEditor(base64, baseName);
      closeMerge();
    } catch (err) {
      logger.error("Merge failed", err);
      setError(String(t("editor_page.merge_modal.merge_failed")));
    } finally {
      setIsMerging(false);
    }
  }, [outputName, loadDocumentIntoEditor, closeMerge, t]);

  return {
    items,
    isSeeding,
    isMerging,
    error,
    invalidWarning,
    outputName,
    setOutputName,
    addFiles,
    removeItem,
    moveItem,
    submitMerge,
    closeMerge,
    canMerge: items.length >= MIN_MERGE_FILES,
    canAddMore: items.length < MAX_MERGE_FILES,
  };
};
