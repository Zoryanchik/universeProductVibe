import { sameColors } from "polotno/utils/svg";

export function hsvToRgb(
  h: number,
  s: number,
  v: number
): [number, number, number] {
  h /= 360;
  s /= 100;
  v /= 100;

  let r = 0,
    g = 0,
    b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace(/^#/, "");
  if (cleaned.length !== 6 && cleaned.length !== 3) return null;

  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;

  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  if (!match) return null;

  return [
    parseInt(match[1], 16),
    parseInt(match[2], 16),
    parseInt(match[3], 16),
  ];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function parseColorString(
  color: string
): { r: number; g: number; b: number; a: number } | null {
  const rgbaMatch = color.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a:
        rgbaMatch[4] !== undefined
          ? Math.round(parseFloat(rgbaMatch[4]) * 255)
          : 255,
    };
  }

  const rgb = hexToRgb(color);
  if (rgb) return { r: rgb[0], g: rgb[1], b: rgb[2], a: 255 };

  return null;
}

export function formatColor(
  r: number,
  g: number,
  b: number,
  a: number
): string {
  if (a >= 255) return rgbToHex(r, g, b);

  const alpha = Math.round((a / 255) * 100) / 100;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const extractOpaqueColor = (color: string): string => {
  const parsed = parseColorString(color);
  if (!parsed) return color;

  return rgbToHex(parsed.r, parsed.g, parsed.b);
};

export const extractAlphaPercent = (color: string): number => {
  const parsed = parseColorString(color);
  if (!parsed) return 100;

  return Math.round((parsed.a / 255) * 100);
};

export const applyAlphaToColor = (
  color: string,
  alphaPercent: number
): string => {
  const parsed = parseColorString(color);
  if (!parsed) return color;

  const a = Math.round((alphaPercent / 100) * 255);

  return formatColor(parsed.r, parsed.g, parsed.b, a);
};

export const findColorKey = (
  colorsReplace: Map<string, string>,
  targetColor: string
): string => {
  const keys = Array.from(colorsReplace.keys()) as string[];
  const matchedKey = keys.find((key) => !!sameColors(key, targetColor));

  return matchedKey || targetColor;
};

export const resolveColor = (
  colorsReplace: Map<string, string>,
  targetColor: string
): string => {
  const key = findColorKey(colorsReplace, targetColor);

  return colorsReplace.get(key) || targetColor;
};
