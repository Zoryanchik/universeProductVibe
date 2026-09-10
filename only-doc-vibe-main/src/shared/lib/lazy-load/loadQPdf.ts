/**
 * The qpdf-wasm package ships as a UMD bundle that calls `require("fs")` /
 * `require("path")` inside conditional branches for Node. Vite refuses to
 * bundle it for the browser, so we side-step the bundler entirely and load
 * the runtime via a `<script>` tag from /qpdf.js (copied at build time by
 * `viteStaticCopy` in astro.config.ts).
 *
 * Both `qpdf.js` and `qpdf.wasm` are served from the site root.
 */

type QPdfInstance = {
  FS: {
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string) => Uint8Array;
  };
  callMain: (args: string[]) => number | undefined;
};

type QPdfModuleOptions = {
  locateFile?: (path: string, scriptDir: string) => string;
  print?: (msg: string) => void;
  printErr?: (msg: string) => void;
  arguments?: string[];
  noInitialRun?: boolean;
};

export type QPdfFactory = (
  options?: QPdfModuleOptions
) => Promise<QPdfInstance>;

const QPDF_SCRIPT_URL = "/qpdf.js";

let factoryPromise: Promise<QPdfFactory> | null = null;

const readGlobalFactory = (): QPdfFactory | null => {
  const w = window as unknown as { Module?: QPdfFactory };

  return typeof w.Module === "function" ? w.Module : null;
};

/**
 * Lazy-load the qpdf-wasm module factory by injecting a `<script>` tag.
 * Resolves to the factory function — call it with options to get a fresh
 * runtime instance per decryption.
 */
export const loadQPdf = async (): Promise<QPdfFactory> => {
  if (factoryPromise) return factoryPromise;

  factoryPromise = new Promise<QPdfFactory>((resolve, reject) => {
    const existing = readGlobalFactory();
    if (existing) {
      resolve(existing);

      return;
    }

    const script = document.createElement("script");
    script.src = QPDF_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const factory = readGlobalFactory();
      if (factory) {
        resolve(factory);
      } else {
        reject(
          new Error(
            `qpdf.js loaded but did not expose a global Module factory (from ${QPDF_SCRIPT_URL}).`
          )
        );
      }
    };
    script.onerror = () => {
      reject(new Error(`Failed to load qpdf runtime from ${QPDF_SCRIPT_URL}.`));
      factoryPromise = null;
    };
    document.head.appendChild(script);
  });

  return factoryPromise;
};
