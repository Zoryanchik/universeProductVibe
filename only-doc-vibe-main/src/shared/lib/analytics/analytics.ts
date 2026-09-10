import {
  AMPLITUDE_KEY,
  ANALYTICS_PRODUCT,
  ENVIRONMENT,
} from "astro:env/client";
import {
  Identify,
  identify,
  init,
  setUserId,
  track,
} from "@amplitude/analytics-browser";
import Cookies from "js-cookie";

import { defaultLocale } from "../../config/locale";
import { COOKIES_KEYS } from "../../constants/cookies-keys";
import {
  ALL_LANGUAGES,
  isELanguage,
  type ELanguages,
} from "../../constants/languages";
import { LOCAL_STORAGE_KEYS } from "../../constants/local-storage-keys";
import { getPathWithoutLocale } from "../navigation/getPathWithoutLocale";
import { appStorage } from "../storage/app-storage";
import { getIsClient } from "../utils/getIsClient";
import {
  EAnalyticsEvents,
  type AnalyticsEventName,
  type AnalyticsEventProperties,
} from "./events";

export interface AnalyticsUser {
  id: string;
  email?: string;
  status?: string;
  countryCode?: string;
}

interface AnalyticsContext {
  product: string;
  page: string;
  local_page: string;
  device: "mobile" | "tablet" | "desktop";
  ab_test: string | null;
  env: string;
}

let isAmplitudeInitialized = false;
let identifiedUserId: string | null = null;

const hasAnalyticsConsent = (): boolean => {
  if (!getIsClient()) return false;

  const navigatorWithPrivacyControl = window.navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };

  if (
    navigatorWithPrivacyControl.globalPrivacyControl ||
    window.localStorage.getItem("gpc") === "true"
  ) {
    return false;
  }

  const rawCookieSettings = appStorage.getItem(
    LOCAL_STORAGE_KEYS.COOKIES_ACTIVE_SETTINGS
  );

  if (!rawCookieSettings) {
    return true;
  }

  try {
    const parsedSettings = JSON.parse(rawCookieSettings) as
      | Record<string, unknown>
      | boolean;

    if (typeof parsedSettings === "boolean") {
      return parsedSettings;
    }

    const analyticsValue =
      parsedSettings.analytics ??
      parsedSettings.analytics_storage ??
      parsedSettings.statistics;

    if (typeof analyticsValue === "boolean") {
      return analyticsValue;
    }

    if (typeof analyticsValue === "string") {
      return analyticsValue !== "denied" && analyticsValue !== "false";
    }
  } catch {
    return rawCookieSettings !== "false";
  }

  return true;
};

const normalizePath = (path: string): string => {
  if (!path) return "/";

  return path.startsWith("/") ? path : `/${path}`;
};

const resolveLocaleFromPath = (pathname: string): ELanguages => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment && isELanguage(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
};

const resolveDeviceType = (): AnalyticsContext["device"] => {
  if (!getIsClient()) return "desktop";

  const userAgent = window.navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/tablet|ipad/.test(userAgent) || (width >= 768 && width < 1024)) {
    return "tablet";
  }

  if (/mobi|android|iphone|ipod/.test(userAgent) || width < 768) {
    return "mobile";
  }

  return "desktop";
};

const stringifyAbTest = (value: unknown): string | null => {
  if (!value) return null;

  if (typeof value === "string") {
    return value || null;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyAbTest(item))
      .filter(Boolean)
      .join("|");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, variant]) => `${key}:${variant}`)
      .join("|");
  }

  return String(value);
};

const resolveAbTest = (): string | null => {
  const rawAbTest =
    appStorage.getItem(LOCAL_STORAGE_KEYS.AB_TESTS) ??
    appStorage.getItem(LOCAL_STORAGE_KEYS.APPENDED_AB_TESTS) ??
    Cookies.get(COOKIES_KEYS.AB_TESTS);

  if (!rawAbTest) return null;

  try {
    return stringifyAbTest(JSON.parse(rawAbTest));
  } catch {
    return stringifyAbTest(rawAbTest);
  }
};

const resolveAnalyticsContext = (): AnalyticsContext => {
  if (!getIsClient()) {
    return {
      product: ANALYTICS_PRODUCT,
      page: "main",
      local_page: "main",
      device: "desktop",
      ab_test: null,
      env: ENVIRONMENT,
    };
  }

  const localPath = normalizePath(window.location.pathname);
  const locale = resolveLocaleFromPath(localPath);
  const page =
    getPathWithoutLocale(localPath, locale).replace(/^\/+/, "") || "main";
  const local_page = localPath.replace(/^\/+/, "") || "main";

  return {
    product: ANALYTICS_PRODUCT,
    page,
    local_page,
    device: resolveDeviceType(),
    ab_test: resolveAbTest(),
    env: ENVIRONMENT,
  };
};

/**
 * Ensures Amplitude is initialized if consent is given.
 * TODO: Add a banner later to ask for consent. For now assume consent is given.
 * Returns true only when Amplitude is ready to accept events.
 */
const ensureAmplitudeInitialized = (): boolean => {
  if (!getIsClient() || !AMPLITUDE_KEY || !hasAnalyticsConsent()) {
    return false;
  }

  if (!isAmplitudeInitialized) {
    init(AMPLITUDE_KEY, undefined, {
      defaultTracking: false,
      logLevel: ENVIRONMENT === "production" ? 1 : 2,
    });

    isAmplitudeInitialized = true;
  }

  return true;
};

const formatFileSize = (fileSize: number): string => {
  if (fileSize >= 1_000_000) {
    return `${(fileSize / 1_000_000).toFixed(2)} MB`;
  }

  if (fileSize >= 1_000) {
    return `${(fileSize / 1_000).toFixed(2)} KB`;
  }

  return `${fileSize} B`;
};

export const normalizeFeatureName = (value: string): string =>
  value.replaceAll("_", "-");

export const initAnalytics = (): void => {
  ensureAmplitudeInitialized();
};

export const trackEvent = (
  eventName: AnalyticsEventName,
  eventProperties: AnalyticsEventProperties = {},
  contextOverride?: Partial<Pick<AnalyticsContext, "page" | "local_page">>
): void => {
  if (!ensureAmplitudeInitialized()) return;

  const sanitizedEventProperties = { ...eventProperties };

  delete sanitizedEventProperties.page;
  delete sanitizedEventProperties.local_page;

  track(eventName, {
    ...sanitizedEventProperties,
    ...resolveAnalyticsContext(),
    ...contextOverride,
  });
};

export const identifyAnalyticsUser = (user: AnalyticsUser | null): void => {
  if (!user?.id || !ensureAmplitudeInitialized()) return;

  if (identifiedUserId !== user.id) {
    setUserId(user.id);
    identifiedUserId = user.id;
  }

  const identifyPayload = new Identify();

  if (user.email) {
    identifyPayload.set("email", user.email);
  }

  if (user.status) {
    identifyPayload.set("status", user.status);
  }

  if (user.countryCode) {
    identifyPayload.set("countryCode", user.countryCode);
  }

  identify(identifyPayload);
};

export const trackFileUploadStatus = ({
  file,
  status,
  errorCode,
}: {
  file: File;
  status: "success" | "error" | "cancel";
  errorCode?: string;
}): void => {
  trackEvent(EAnalyticsEvents.FILE_UPLOAD_STATUS, {
    accurate_size: Number((file.size / 1_000_000).toFixed(4)),
    size: formatFileSize(file.size),
    status,
    ...(errorCode ? { error_code: errorCode } : {}),
  });
};

export const getCurrentPageCategory = (): string => {
  if (!getIsClient()) return "unknown";

  const pathname = normalizePath(window.location.pathname);

  if (
    pathname === "/" ||
    ALL_LANGUAGES.some((lang) => pathname === `/${lang}`)
  ) {
    return "landing_page";
  }

  return pathname.replaceAll("/", "_").replace(/^_+/, "") || "landing_page";
};
