// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type HeicTo = typeof import("heic-to").heicTo;

export const loadHeicTo = async (): Promise<HeicTo> => {
  return (await import("heic-to")).heicTo;
};
