import { getUserPlatform } from "../utils/getUserOs";

const IOS_DEVICE_NAME = "iOS";

/**
 * Forcing a non-previewable MIME type makes mobile browsers (and social in-app
 * webviews) save the file instead of opening it inline. Without this, PDFs and
 * images are handed to the built-in viewer and the user ends up on a blob URL
 * (e.g. `blob:https://onlydoc.com/<uuid>`) instead of getting a download.
 */
const FORCE_DOWNLOAD_MIME = "application/octet-stream";

export const downloadByUrl = ({
  url,
  filename,
}: {
  url: string;
  filename?: string;
}) => {
  const filenameFromUrl = url.split("?")[0].split("/").pop() || "";
  const fileNameToUse = filename || filenameFromUrl;
  const isIos = getUserPlatform() === IOS_DEVICE_NAME;

  if (isIos) {
    void downloadOnIos(url, fileNameToUse);

    return;
  }

  void commonDownload(url, fileNameToUse);
};

async function commonDownload(url: string, filename: string) {
  if (!url) {
    throw new Error("empty-url");
  }

  try {
    const blob = await fetchAsDownloadBlob(url);
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, filename);

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  } catch {
    // Fallback for environments where CORS fetching is restricted.
    triggerDownload(url, filename);
  }
}

async function downloadOnIos(url: string, filename: string) {
  if (!url) {
    throw new Error("empty-url");
  }

  try {
    const blob = await fetchAsDownloadBlob(url);
    const dataUrl = await blobToDataUrl(blob);
    triggerDownload(dataUrl, filename);
  } catch {
    triggerDownload(url, filename);
  }
}

async function fetchAsDownloadBlob(url: string): Promise<Blob> {
  const response = await fetch(url, { mode: "cors" });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const blob = await response.blob();

  return new Blob([blob], { type: FORCE_DOWNLOAD_MIME });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.style.display = "none";
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
}
