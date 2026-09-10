export const buildAcceptedExtensions = (
  acceptedFormats: readonly string[]
): readonly string[] => acceptedFormats.map((f) => f.toLowerCase());

export const buildFilePickerAccept = (
  acceptedFormats: readonly string[]
): string =>
  buildAcceptedExtensions(acceptedFormats)
    .map((ext) => `.${ext}`)
    .join(",");

export const isAcceptedExtension = (
  filename: string,
  acceptedFormats: readonly string[]
): boolean => {
  const parts = filename.toLowerCase().split(".");
  if (parts.length < 2) return false;

  const ext = parts.pop() ?? "";

  return buildAcceptedExtensions(acceptedFormats).includes(ext);
};
