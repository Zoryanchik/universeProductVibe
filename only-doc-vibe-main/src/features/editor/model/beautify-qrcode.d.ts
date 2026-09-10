declare module "beautify-qrcode" {
  export interface BeautifyCodeOption {
    text: string;
    correctLevel: number;
    width?: number;
    height?: number;
    isSpace?: boolean;
  }

  export const encodeData: (option: BeautifyCodeOption) => string;
  export const renderer25D: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererRect: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererRound: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererRandRound: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererDSJ: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererRandRect: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererImage: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererCircle: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererLine: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererLine2: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererFuncA: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
  export const rendererFuncB: (
    data: string,
    options?: Record<string, unknown>
  ) => string;
}
