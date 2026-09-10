/**
 * Per-chat PDF blob cache backed by IndexedDB.
 *
 * The store holds a sentinel URL `ai-summarizer-blob://<chatId>`;
 * `resolveChatPreviewUrl` converts it to a real `blob:` URL on demand.
 * Object URLs are memoized in `CHAT_BLOB_OBJECT_URLS` so successive resolves
 * don't leak new ones, and `isCachedChatPreviewObjectUrl` lets the store's
 * revoke wrapper skip URLs we still want to reuse.
 */

const AI_SUMMARIZER_BLOB_DB_NAME = "ai-summarizer-pdf-blobs";
const AI_SUMMARIZER_BLOB_STORE_NAME = "chat-pdfs";
const AI_SUMMARIZER_BLOB_KEY_PREFIX = "chat:";
const AI_SUMMARIZER_BLOB_URL_PREFIX = "ai-summarizer-blob://";

const CHAT_BLOB_OBJECT_URLS = new Map<string, string>();

const getBlobKey = (chatId: string): string =>
  `${AI_SUMMARIZER_BLOB_KEY_PREFIX}${chatId}`;

const openDb = async (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(AI_SUMMARIZER_BLOB_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AI_SUMMARIZER_BLOB_STORE_NAME)) {
        db.createObjectStore(AI_SUMMARIZER_BLOB_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Failed to open PDF blob database"));
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(AI_SUMMARIZER_BLOB_STORE_NAME, mode);
    const store = tx.objectStore(AI_SUMMARIZER_BLOB_STORE_NAME);
    const request = work(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Failed IndexedDB operation"));
    tx.oncomplete = () => db.close();
    tx.onerror = () =>
      reject(tx.error || new Error("Failed IndexedDB transaction"));
  });
};

const getPdfBlobForChat = (chatId: string): Promise<Blob | null> =>
  withStore<Blob | undefined>("readonly", (store) =>
    store.get(getBlobKey(chatId))
  ).then((blob) => blob ?? null);

export const getStoredPdfBlobUrlToken = (chatId: string): string =>
  `${AI_SUMMARIZER_BLOB_URL_PREFIX}${chatId}`;

export const savePdfBlobForChat = async (
  chatId: string,
  file: File | Blob
): Promise<void> => {
  await withStore("readwrite", (store) => store.put(file, getBlobKey(chatId)));
};

export const removePdfBlobForChat = async (chatId: string): Promise<void> => {
  const existingUrl = CHAT_BLOB_OBJECT_URLS.get(chatId);
  if (existingUrl) {
    URL.revokeObjectURL(existingUrl);
    CHAT_BLOB_OBJECT_URLS.delete(chatId);
  }

  try {
    await withStore("readwrite", (store) => store.delete(getBlobKey(chatId)));
  } catch {
    /* best-effort */
  }
};

export const resolveChatPreviewUrl = async (
  fileUrl?: string | null
): Promise<string | null> => {
  if (!fileUrl) return null;

  if (!fileUrl.startsWith(AI_SUMMARIZER_BLOB_URL_PREFIX)) return fileUrl;

  const chatId = fileUrl.slice(AI_SUMMARIZER_BLOB_URL_PREFIX.length);

  const cached = CHAT_BLOB_OBJECT_URLS.get(chatId);
  if (cached) return cached;

  const blob = await getPdfBlobForChat(chatId);
  if (!blob) return null;

  const objectUrl = URL.createObjectURL(blob);
  CHAT_BLOB_OBJECT_URLS.set(chatId, objectUrl);

  return objectUrl;
};

export const isCachedChatPreviewObjectUrl = (
  url: string | null | undefined
): boolean => {
  if (!url) return false;

  for (const cached of CHAT_BLOB_OBJECT_URLS.values()) {
    if (cached === url) return true;
  }

  return false;
};
