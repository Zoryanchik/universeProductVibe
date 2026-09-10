import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage-keys";
import { IDBStorage } from "@/shared/lib/storage/indexeddb-storage";

const EDITOR_HANDOFF_KEY = LOCAL_STORAGE_KEYS.EDITOR_HANDOFF_PDF;

/** In-memory cache so React Strict Mode remount does not consume the handoff twice. */
let handoffCache: string | null | undefined;

/**
 * One-time PDF transfer from upload funnel → editor (same tab, survives full page load).
 * IndexedDB is used (not sessionStorage) so large PDFs do not hit the ~5MB session quota.
 */
export const setEditorHandoffPdf = async (pdfBase64: string): Promise<void> => {
  handoffCache = undefined;

  try {
    const storage = await IDBStorage.getInstance();
    storage.setItem(EDITOR_HANDOFF_KEY, pdfBase64);
  } catch {
    // no-op
  }
};

export const peekEditorHandoffPdf = async (): Promise<string | null> => {
  if (handoffCache !== undefined) {
    return handoffCache;
  }

  try {
    const storage = await IDBStorage.getInstance();

    return storage.getItem(EDITOR_HANDOFF_KEY);
  } catch {
    return null;
  }
};

/** Read handoff PDF once per navigation, then remove it from storage. */
export const consumeEditorHandoffPdf = async (): Promise<string | null> => {
  if (handoffCache !== undefined) {
    return handoffCache;
  }

  let pdf: string | null = null;

  try {
    const storage = await IDBStorage.getInstance();
    pdf = storage.getItem(EDITOR_HANDOFF_KEY);
    storage.removeItem(EDITOR_HANDOFF_KEY);
  } catch {
    pdf = null;
  }

  handoffCache = pdf;

  return pdf;
};

export const clearEditorHandoffPdf = async (): Promise<void> => {
  handoffCache = null;

  try {
    const storage = await IDBStorage.getInstance();
    storage.removeItem(EDITOR_HANDOFF_KEY);
  } catch {
    // no-op
  }
};
