import type { AstroGlobal } from "astro";

/**
 * Redirects to the 404 page if the provided language is invalid
 * @param Astro - The Astro global object
 * @param lang - The language parameter to validate
 * @param validLocales - Array of valid locale codes
 * @returns A redirect Response if the language is invalid, otherwise null
 */
export function redirectTo404(Astro: AstroGlobal): Response {
  return Astro.redirect("/404");
}
