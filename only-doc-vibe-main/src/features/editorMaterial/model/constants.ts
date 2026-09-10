import type {
  MaterialLineInsertOptions,
  MaterialShapeInsertOptions,
} from "./types";

export const DEFAULT_MATERIAL_SHAPE_STYLE: MaterialShapeInsertOptions = {
  fill: "#F3F4F6",
  stroke: "#111111",
  strokeWidth: 2,
};

export const DEFAULT_MATERIAL_LINE_STYLE: Omit<
  MaterialLineInsertOptions,
  "points" | "startStyle" | "endStyle" | "style"
> = {
  stroke: "#111111",
  strokeWidth: 4,
};
