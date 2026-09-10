const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const toColorInputValue = (color: string | undefined): string => {
  if (!color || color === "transparent") return "#000000";

  if (HEX_COLOR.test(color)) {
    if (color.length === 4) {
      const [, r, g, b] = color;

      return `#${r}${r}${g}${g}${b}${b}`;
    }

    return color;
  }

  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);

  if (!match) return "#000000";

  const toHex = (value: string): string =>
    Number.parseInt(value, 10).toString(16).padStart(2, "0");

  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
};
