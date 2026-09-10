export type InlineCtaPosition = "top" | "middle" | "bottom";

export interface ISplitContent {
  readonly before: string;
  readonly after: string;
}

const H2_MARKDOWN_PATTERN = /^##\s+(?!#)/;
const H2_HTML_PATTERN = /^<h2[\s>]/i;

const isH2Line = (line: string, inFence: boolean): boolean => {
  if (inFence) return false;

  const trimmed = line.trimStart();

  return H2_MARKDOWN_PATTERN.test(trimmed) || H2_HTML_PATTERN.test(trimmed);
};

/**
 * Splits markdown/HTML article content into top-level H2 sections.
 * The first chunk may contain intro copy before the first heading.
 */
export const splitIntoH2Sections = (content: string): readonly string[] => {
  if (!content.trim()) return [""];

  const sections: string[] = [];
  let current = "";
  let inFence = false;

  for (const rawLine of content.split(/\r?\n/)) {
    const trimmedStart = rawLine.trimStart();

    if (trimmedStart.startsWith("```")) {
      inFence = !inFence;
    }

    if (isH2Line(rawLine, inFence) && current.trim()) {
      sections.push(current);
      current = `${rawLine}\n`;
      continue;
    }

    current += `${rawLine}\n`;
  }

  if (current.trim()) {
    sections.push(current);
  }

  return sections.length > 0 ? sections : [content];
};

/**
 * Splits the article markdown into a `before` / `after` pair around the inline
 * CTA banner. The split happens on top-level H2 headings so the banner
 * always lands between sections, never inside one.
 *
 * Accepts either:
 * - A named position: `"top"` | `"middle"` | `"bottom"`
 * - A numeric section index from the CMS `cta_after_section` field (0-based).
 *   Index 0 = before all sections (top), index ≥ section count = after all (bottom).
 */
export const splitContentForCta = (
  content: string,
  positionOrSection: InlineCtaPosition | number
): ISplitContent => {
  if (typeof content !== "string") return { before: "", after: "" };

  const sections = splitIntoH2Sections(content);

  let splitIndex: number;

  if (typeof positionOrSection === "number") {
    splitIndex = Math.max(0, Math.min(positionOrSection, sections.length));
  } else if (positionOrSection === "top") {
    splitIndex = 0;
  } else if (positionOrSection === "bottom") {
    splitIndex = sections.length;
  } else {
    splitIndex = Math.ceil(sections.length / 2);
  }

  return {
    before: sections.slice(0, splitIndex).join("").trimEnd(),
    after: sections.slice(splitIndex).join("").trimStart(),
  };
};
