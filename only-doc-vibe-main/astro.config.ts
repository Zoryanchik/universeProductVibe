import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import compressor from "astro-compressor";
import * as dotenv from "dotenv";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";

dotenv.config();

const IS_ENV_LOCAL = process.env.ENVIRONMENT === "local";
const IS_REMOTE_BUILD =
  ["production", "staging", "development"].includes(
    process.env.ENVIRONMENT as string
  ) && !import.meta.env.DEV;

const PROTOCOL = IS_REMOTE_BUILD ? "https" : "http";
const HOST = process.env.WEB_HOST;
const PROJECT_BASE = process.env.PROJECT_BASE;

export default defineConfig({
  outDir: "./dist",
  site: `${PROTOCOL}://${HOST}${PROJECT_BASE || ""}`,
  base: process.env.PROJECT_BASE,
  env: {
    validateSecrets: true,
    schema: {
      // Server only
      CMS_HOST: envField.string({ context: "server", access: "secret" }),
      CMS_READ_TOKEN: envField.string({ context: "server", access: "secret" }),

      // Shared between server and client
      ENVIRONMENT: envField.enum({
        context: "client",
        access: "public",
        values: ["local", "development", "test", "staging", "production"],
      }),
      WEB_HOST: envField.string({ context: "client", access: "public" }),
      BACKEND_HOST: envField.string({ context: "client", access: "public" }),
      PROJECT_BASE: envField.string({
        context: "client",
        access: "public",
        default: "",
        optional: true,
      }),
      MAIN_APP_BASE: envField.string({ context: "client", access: "public" }),
      CAPTCHA_SITE_KEY: envField.string({
        context: "client",
        access: "public",
      }),
      CAPTCHA_LIMIT: envField.number({ context: "client", access: "public" }),
      GTAG_ID: envField.string({ context: "client", access: "public" }),
      MICROSOFT_CLARITY_ID: envField.string({
        context: "client",
        access: "public",
      }),
      AMPLITUDE_KEY: envField.string({ context: "client", access: "public" }),
      ANALYTICS_PRODUCT: envField.string({
        context: "client",
        access: "public",
      }),
      GOOGLE_AUTH_CLIENT_ID: envField.string({
        context: "client",
        access: "public",
      }),
      CUSTOMER_IO_KEY: envField.string({ context: "client", access: "public" }),

      // Local Only
      LOCAL_CMS_HOST: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      CMS_UPLOAD_LOCAL_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      CMS_UPLOAD_PROD_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      ASSETS_DIR: envField.string({
        context: "client",
        access: "public",
        default: "_astro",
        optional: true,
      }),
      SW_BASE: envField.string({
        context: "client",
        access: "public",
        default: "",
        optional: true,
      }),
      PDF_VIEWER_HOST: envField.string({
        context: "client",
        access: "public",
        default: "",
        optional: true,
      }),

      // AI Summarizer — SSE notifications
      REACT_APP_SSE_URL: envField.string({
        context: "client",
        access: "public",
      }),
      REACT_APP_SSE_MAX_RECONNECTION_ATTEMPTS: envField.number({
        context: "client",
        access: "public",
        default: 30,
        optional: true,
      }),
      REACT_APP_SSE_RECONNECTION_DELAY: envField.number({
        context: "client",
        access: "public",
        default: 30000,
        optional: true,
      }),

      // AI Summarizer — feature limits
      AI_SUMMARIZER_MAX_FILE_SIZE_MB: envField.number({
        context: "client",
        access: "public",
        default: 25,
        optional: true,
      }),
      AI_SUMMARIZER_MAX_MESSAGE_CHARS: envField.number({
        context: "client",
        access: "public",
        default: 2000,
        optional: true,
      }),
      AI_SUMMARIZER_MAX_PAGES: envField.number({
        context: "client",
        access: "public",
        default: 200,
        optional: true,
      }),

      // Templates Editor — Polotno
      PUBLIC_POLOTNO_API_KEY: envField.string({
        context: "client",
        access: "public",
        default: "",
        optional: true,
      }),
    },
  },
  integrations: [react(), ...(IS_ENV_LOCAL ? [compressor()] : [])],
  server: {
    host: true,
    port: 4322,
  },
  compressHTML: true,
  build: {
    // Inline the app's CSS into the HTML instead of a separate <link>, removing
    // the render-blocking stylesheet request (faster FCP/LCP on first load).
    inlineStylesheets: "always",
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
    ssr: {
      noExternal: ["@universe-forma/ui-pes"],
    },
    optimizeDeps: {
      include: ["picocolors", "pdf-lib"],
      exclude: ["pdfjs-dist"],
    },
    plugins: [
      tailwind(),
      svgr({
        include: "**/*.svg?react",
        svgrOptions: {
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm",
            dest: "",
          },
          {
            src: "node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.js",
            dest: "",
          },
        ],
      }),
    ],
  },
  output: "static",
  devToolbar: {
    enabled: false,
  },
  trailingSlash: "never",
  srcDir: "./",
});
