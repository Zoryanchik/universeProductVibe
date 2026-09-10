export const parseJson = <T>(json: string | null | undefined): T | null => {
  if (!json) return null;

  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};
