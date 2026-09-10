export type MaterialLinePoint = "" | "arrow" | "dot";

export interface MaterialLineItem {
  readonly path: string;
  readonly style: "solid" | "dashed";
  readonly points: readonly [MaterialLinePoint, MaterialLinePoint];
  readonly data: readonly { readonly x: number; readonly y: number }[];
  readonly isBroken?: boolean;
  readonly isCurve?: boolean;
  readonly isCubic?: boolean;
}

export interface MaterialLineSection {
  readonly type: string;
  readonly children: readonly MaterialLineItem[];
}

export const MATERIAL_LINE_LIBS: MaterialLineSection[] = [
  {
    type: "Straight Line",
    children: [
      {
        path: "M 0 0 L 20 20",
        style: "solid",
        points: ["", ""],
        data: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
      {
        path: "M 0 0 L 20 20",
        style: "dashed",
        points: ["", ""],
        data: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
      {
        path: "M 0 0 L 20 20",
        style: "solid",
        points: ["", "arrow"],
        data: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
      {
        path: "M 0 0 L 20 20",
        style: "dashed",
        points: ["", "arrow"],
        data: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
      {
        path: "M 0 0 L 20 20",
        style: "solid",
        points: ["", "dot"],
        data: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
    ],
  },
  {
    type: "Polyline, Curve",
    children: [
      {
        path: "M 0 0 L 0 20 L 20 20",
        style: "solid",
        points: ["", "arrow"],
        isBroken: true,
        data: [
          { x: 0, y: 0 },
          { x: 0, y: 100 },
          { x: 200, y: 100 },
        ],
      },
      {
        path: "M 0 0 Q 0 20 20 20",
        style: "solid",
        points: ["", "arrow"],
        isCurve: true,
        data: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
      {
        path: "M 0 0 C 20 0 0 20 20 20",
        style: "solid",
        points: ["", "arrow"],
        isCubic: true,
        data: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
    ],
  },
];
