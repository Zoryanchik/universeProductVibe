interface ISwConfig {
  readonly APP_URL: string;
  readonly CACHE_NAME: string;
  readonly CACHE_URLS: readonly string[];
  readonly MAIN_APP_BASE: string;
  readonly NETWORK_FIRST_PATTERNS: readonly RegExp[];
  readonly CACHE_FIRST_PATTERNS: readonly RegExp[];
  readonly MAX_CACHE_SIZE: number;
  readonly CACHE_LIFETIME: number;
  readonly MAX_RETRY_ATTEMPTS: number;
  readonly RETRY_DELAY: number;
}

interface Window {
  grecaptcha: {
    enterprise: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  };

  Firebug: {
    chrome: { isInitialized: boolean };
  };

  dataLayer: unknown[];

  fbq: (command: string, event: string, props: Record<string, unknown>) => void;

  hj: typeof hj;

  analytics: ICustomerIOAnalytics;

  uetq: (string | Record<string, unknown>)[];

  SW_CONFIG: ISwConfig;

  updateServiceWorker: () => Promise<void>;
}

declare const SW_CONFIG: ISwConfig;

function hj(
  identify: "identify",
  userId: string,
  properties: Record<string, unknown>
): void;
function hj(event: "event", data?: Record<string, unknown> | null): void;

interface ICustomerIOAnalytics {
  initialize: boolean;
  invoked: boolean;
  methods: string[];
  factory: (e: string) => (...params: any[]) => any;
  push: (args: any[]) => void;
  load: (key: string, options?: any) => void;
  page: () => void;
  _writeKey: string;
  _loadOptions: any;
  SNIPPET_VERSION: string;
  [key: string]: any;
}
