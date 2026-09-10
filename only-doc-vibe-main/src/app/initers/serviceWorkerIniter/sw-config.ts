// Конфігурація для service worker (TypeScript)
// APP_URL береться з env під час білду скриптом scripts/build-sw.mjs

// Значення заміняється esbuild-ом через define({ 'process.env.APP_URL': '"..."' })

const MAIN_APP_BASE = process.env.MAIN_APP_BASE!;
const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE!;

// @ts-expect-error here we define sw config for global scope
const SW_CONFIG: ISwConfig = {
  // URL основного додатку для кешування
  APP_URL: MAIN_APP_BASE,

  // Назва кешу
  CACHE_NAME: "only-doc-app-cache-v1",

  // Ресурси для кешування при встановленні
  CACHE_URLS: [
    getLocalizedPath(""),
    getLocalizedPath("/editor"),
    getLocalizedPath("/choose-plan"),
  ],

  MAIN_APP_BASE,

  // Патерни для Network First стратегії (завжди з мережі)
  NETWORK_FIRST_PATTERNS: [
    /\/api\//,
    /\/auth\//,
    /\/upload/,
    /\/download/,
    /\.json$/,
    /\/user\//,
    /\/files\//,
  ],

  // Патерни для Cache First стратегії (кеш першочергово)
  CACHE_FIRST_PATTERNS: [
    /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/,
    /\/static\//,
    /\/assets\//,
    /\/images\//,
    /\/icons\//,
  ],

  // Максимальний розмір кешу (в байтах)
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB

  // Час життя кешу (в мілісекундах)
  CACHE_LIFETIME: 1 * 24 * 60 * 60 * 1000, // 7 днів

  // Кількість спроб для повторних запитів
  MAX_RETRY_ATTEMPTS: 1,

  // Затримка між спробами (в мілісекундах)
  RETRY_DELAY: 1000,
} as const;

// Експортуємо конфіг для використання в service worker (classic worker)
// Робимо доступним як self.SW_CONFIG під час виконання у воркері
try {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SW_CONFIG;
  } else if (typeof window !== "undefined") {
    window.SW_CONFIG = SW_CONFIG;
  }
} catch {
  // no-op
}

function getLocalizedPath(path: string) {
  const language = getCurrentLanguage();
  const isDefaultLocale = language === DEFAULT_LOCALE;

  if (isDefaultLocale) {
    return removeTrailingSlashes(`${MAIN_APP_BASE}${path}`);
  }

  return removeTrailingSlashes(`${MAIN_APP_BASE}/${language}${path}`);
}

function getCurrentLanguage() {
  const href = typeof self.location !== "undefined" ? self.location.href : "";

  const url = new URL(href);

  return url.searchParams.get("lang") || DEFAULT_LOCALE;
}

function removeTrailingSlashes(str: string): string {
  return str.replace(/\/+$/, "");
}
