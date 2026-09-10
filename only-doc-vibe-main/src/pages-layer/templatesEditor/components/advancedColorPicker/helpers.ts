import type { GradientStop } from "../../ui/GradientBar";

function splitStopParts(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of str) {
    if (char === "(") depth++;

    if (char === ")") depth--;

    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());

  return parts;
}

function findFirstCommaAtDepth0(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "," && depth === 0) return i;
  }

  return -1;
}

function extractLinearGradientInner(str: string): string | null {
  const trimmed = str.trim();
  const m = trimmed.match(/^\s*linear-gradient\s*\(/i);
  if (!m || m.index === undefined) return null;

  const start = m.index + m[0].length;
  let depth = 1;
  for (let i = start; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return trimmed.slice(start, i);
    }
  }

  return null;
}

function directionKeywordsToAngle(keywords: string): number | null {
  const k = keywords.trim().toLowerCase().replace(/\s+/g, " ");
  const map: Record<string, number> = {
    top: 0,
    right: 90,
    bottom: 180,
    left: 270,
    "top right": 45,
    "right top": 45,
    "bottom right": 135,
    "right bottom": 135,
    "bottom left": 225,
    "left bottom": 225,
    "top left": 315,
    "left top": 315,
  };

  return map[k] ?? null;
}

export function parseGradient(
  str: string
): { angle: number; stops: GradientStop[] } | null {
  const inner = extractLinearGradientInner(str);
  if (inner === null) return null;

  const commaIdx = findFirstCommaAtDepth0(inner);
  let angle: number;
  let stopsStr: string;

  if (commaIdx === -1) {
    stopsStr = inner.trim();
    angle = 180;
  } else {
    const first = inner.slice(0, commaIdx).trim();
    const rest = inner.slice(commaIdx + 1).trim();

    const degMatch = first.match(/^(\d+(?:\.\d+)?)deg$/i);
    if (degMatch) {
      angle = Math.round(parseFloat(degMatch[1]));
      stopsStr = rest;
    } else if (/^to\s+/i.test(first)) {
      const keyPart = first.replace(/^to\s+/i, "").trim();
      const mapped = directionKeywordsToAngle(keyPart);
      if (mapped === null) return null;

      angle = mapped;
      stopsStr = rest;
    } else {
      angle = 180;
      stopsStr = inner;
    }
  }

  const parts = splitStopParts(stopsStr);
  if (parts.length === 0) return null;

  const stops: GradientStop[] = parts.map((part, i) => {
    const percentMatch = part.match(/\s+(\d+(?:\.\d+)?)%\s*$/);
    const offset = percentMatch
      ? parseFloat(percentMatch[1]) / 100
      : i / Math.max(parts.length - 1, 1);
    const color = percentMatch
      ? part.slice(0, percentMatch.index).trim()
      : part.trim();

    return { offset, color };
  });

  return { angle, stops };
}

export function buildGradientString(
  angle: number,
  stops: GradientStop[]
): string {
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  const parts = sorted
    .map((s) => `${s.color} ${Math.round(s.offset * 100)}%`)
    .join(", ");

  return `linear-gradient(${angle}deg, ${parts})`;
}
