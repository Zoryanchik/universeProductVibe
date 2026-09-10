export const getFilenameExtensionFromFile = (
  fileName: string
): string | null => {
  const extension = fileName.split(".").pop();

  return extension || null;
};
