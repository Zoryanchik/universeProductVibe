// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type JsPdf = typeof import("jspdf");

let jsPdf: JsPdf | null = null;

export const loadJsPdf = async (): Promise<JsPdf> => {
  if (jsPdf) return jsPdf;

  jsPdf = await import("jspdf");

  return jsPdf;
};
