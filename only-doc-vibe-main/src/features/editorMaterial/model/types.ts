export interface MaterialShapeInsertOptions {
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly viewBox?: readonly [number, number];
  readonly pathFormula?: string;
  readonly special?: boolean;
  readonly outlined?: boolean;
}

export interface MaterialLineInsertOptions {
  readonly points: readonly { readonly x: number; readonly y: number }[];
  readonly startStyle?: string;
  readonly endStyle?: string;
  readonly style?: "solid" | "dashed";
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly isBroken?: boolean;
  readonly isCurve?: boolean;
  readonly isCubic?: boolean;
}
