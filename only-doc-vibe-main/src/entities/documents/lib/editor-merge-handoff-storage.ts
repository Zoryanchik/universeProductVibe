import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage-keys";
import { IDBStorage } from "@/shared/lib/storage/indexeddb-storage";

interface SerializedMergeFile {
  name: string;
  type: string;
  /** Data URL (base64) of the file content. */
  dataUrl: string;
}

const MERGE_HANDOFF_KEY = LOCAL_STORAGE_KEYS.MERGE_FILES;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(file);
  });

const dataUrlToFile = async (
  entry: SerializedMergeFile
): Promise<File | null> => {
  try {
    const response = await fetch(entry.dataUrl);
    const blob = await response.blob();

    return new File([blob], entry.name, {
      type: entry.type || blob.type || "application/pdf",
    });
  } catch {
    return null;
  }
};

/**
 * One-time transfer of the raw (un-merged) files from the merge funnel upload to
 * the editor's merge window. IndexedDB is used (not sessionStorage) so multiple
 * large PDFs do not hit the ~5MB session storage quota.
 */
export const setMergeHandoffFiles = async (files: File[]): Promise<void> => {
  const serialized: SerializedMergeFile[] = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      dataUrl: await fileToDataUrl(file),
    }))
  );

  const storage = await IDBStorage.getInstance();
  storage.setItem(MERGE_HANDOFF_KEY, JSON.stringify(serialized));
};

export const hasMergeHandoff = async (): Promise<boolean> => {
  try {
    const storage = await IDBStorage.getInstance();

    return Boolean(storage.getItem(MERGE_HANDOFF_KEY));
  } catch {
    return false;
  }
};

/** Read the merge handoff files once, then remove them from storage. */
export const consumeMergeHandoffFiles = async (): Promise<File[]> => {
  let raw: string | null = null;

  try {
    const storage = await IDBStorage.getInstance();
    raw = storage.getItem(MERGE_HANDOFF_KEY);
    storage.removeItem(MERGE_HANDOFF_KEY);
  } catch {
    return [];
  }

  if (!raw) return [];

  let parsed: SerializedMergeFile[];
  try {
    parsed = JSON.parse(raw) as SerializedMergeFile[];
  } catch {
    return [];
  }

  const files = await Promise.all(parsed.map(dataUrlToFile));

  return files.filter((file): file is File => file !== null);
};

export const clearMergeHandoffFiles = async (): Promise<void> => {
  try {
    const storage = await IDBStorage.getInstance();
    storage.removeItem(MERGE_HANDOFF_KEY);
  } catch {
    // no-op
  }
};
