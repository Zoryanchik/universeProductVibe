import { loadPdfJsLib } from "../lazy-load/loadPdfJsLib";

export const getHasPdfUserPassword = async (file: File): Promise<boolean> => {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const pdfJsLib = await loadPdfJsLib();
    await pdfJsLib.getDocument({ data: arrayBuffer, password: "" }).promise;

    return false;
  } catch (err) {
    if (err instanceof Error && err.name === "PasswordException") {
      return true;
    }

    return false;
  }
};
