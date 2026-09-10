/// <reference types="astro/client" />

declare module "*.svg" {
  const content: {
    src: string;
  };
  export default content;
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module "*.svg?react" {
  const content: {
    src: string;
  };
  export default content;
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module "eslint-plugin-next-fsd" {
  const nextFsd: any;
  export default nextFsd;
}

declare module "*.json" {
  const content: Record<string, unknown>;
  export default content;
}

declare module "*.astro" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const src: string;
  export default src;
}
