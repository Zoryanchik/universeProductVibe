import { MAIN_APP_BASE as MAIN_APP_BASE_RAW } from "astro:env/client";

const MAIN_APP_BASE = MAIN_APP_BASE_RAW?.replace(/\/$/, "") ?? "";

export const PAGE_LINKS = {
  HOME: MAIN_APP_BASE,
  DASHBOARD: `${MAIN_APP_BASE}/dashboard`,
  LOGIN: `${MAIN_APP_BASE}/login`,
  SIGN_UP: `${MAIN_APP_BASE}/sign-up`,
  TEST: `${MAIN_APP_BASE}/test`,
  CHOOSING_PLAN: `${MAIN_APP_BASE}/choose-plan`,
  EDITOR: `${MAIN_APP_BASE}/editor`,
  CONTACT_US: `${MAIN_APP_BASE}/contact-us`,
  // Served by this SEO front-end at the site root, so it is intentionally not
  // prefixed with MAIN_APP_BASE.
  PDF_TEMPLATES: "/pdf-templates",
  TERMS: `${MAIN_APP_BASE}/terms`,
  TERMS_AND_CONDITIONS: `${MAIN_APP_BASE}/terms-and-conditions`,
  PRIVACY_POLICY: `${MAIN_APP_BASE}/privacy-policy`,
};
