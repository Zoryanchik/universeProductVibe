import { availableLocales } from "@/shared/config/locale";

export async function fetchContactUsSlugMap(): Promise<Record<string, string>> {
  return Object.fromEntries(
    availableLocales.map((locale) => [locale, "contact-us"])
  );
}
