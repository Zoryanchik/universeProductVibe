export interface ITocItem {
  readonly id: string;
  readonly level: 2 | 3;
  readonly text: string;
}

/**
 * Slugify a heading text into a stable, URL-safe id. Exported so the markdown
 * renderer can derive the same id when it emits `<h2>`/`<h3>` elements.
 */
export const slugifyHeading = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const slugify = slugifyHeading;

const stripHtmlTags = (value: string): string =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const cleanHeadingText = (value: string): string =>
  value
    .replace(/\{#([a-z0-9-]+)\}/gi, "")
    .replace(/[*_`]/g, "")
    .trim();

const MARKDOWN_HEADING_PATTERN =
  /^(#{2,3})\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?\s*#*$/;

const HTML_H2_PATTERN = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi;
const HTML_H3_PATTERN = /<h3(\s[^>]*)?>([\s\S]*?)<\/h3>/gi;

/**
 * Normalizes Strapi richtext/HTML headings into markdown `##` / `###` lines so
 * ToC extraction, CTA splitting, and the markdown renderer share one format.
 */
export const normalizeBlogArticleContent = (content: string): string => {
  if (!content || !/<h[23]\b/i.test(content)) return content;

  return content
    .replace(HTML_H2_PATTERN, (_, _attrs, inner) => {
      const text = stripHtmlTags(inner);

      return text ? `\n\n## ${text}\n\n` : "";
    })
    .replace(HTML_H3_PATTERN, (_, _attrs, inner) => {
      const text = stripHtmlTags(inner);

      return text ? `\n\n### ${text}\n\n` : "";
    });
};

const addTocItem = (
  items: ITocItem[],
  used: Set<string>,
  level: 2 | 3,
  rawText: string
): void => {
  const text = cleanHeadingText(rawText);
  if (!text) return;

  const baseId = slugify(text) || `section-${items.length + 1}`;
  let id = baseId;
  let suffix = 2;
  while (used.has(id)) {
    id = `${baseId}-${suffix++}`;
  }
  used.add(id);

  items.push({ id, level, text });
};

/**
 * Extract a flat list of `## ` and `### ` headings from a markdown string.
 * Stable, build-time safe — no DOM access required.
 */
export const extractToc = (markdown: string | undefined | null): ITocItem[] => {
  if (!markdown) return [];

  const normalized = normalizeBlogArticleContent(markdown);
  const items: ITocItem[] = [];
  const used = new Set<string>();

  const lines = normalized.split(/\r?\n/);
  let inFence = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmedStart = line.trimStart();

    if (trimmedStart.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const match = MARKDOWN_HEADING_PATTERN.exec(trimmedStart);
    if (!match) continue;

    const level = match[1].length === 2 ? 2 : 3;
    addTocItem(items, used, level as 2 | 3, match[2]);
  }

  return items;
};

/**
 * Inject `id` attributes into the rendered markdown so the ToC links resolve
 * to the matching headings. Operates on the same `## `/`### ` lines we extract,
 * by appending the markdown header `{#id}` syntax which `markdown-to-jsx` honors.
 */
export const annotateMarkdownWithTocIds = (
  markdown: string | undefined | null,
  toc: ReadonlyArray<ITocItem>
): string => {
  if (!markdown || toc.length === 0) return markdown ?? "";

  const normalized = normalizeBlogArticleContent(markdown);
  let cursor = 0;
  const lines = normalized.split(/\r?\n/);
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedStart = line.trimStart();

    if (trimmedStart.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const match = MARKDOWN_HEADING_PATTERN.exec(trimmedStart);
    if (!match) continue;

    if (cursor >= toc.length) break;

    const item = toc[cursor++];
    if (line.includes("{#")) continue;

    const leadingWhitespace = line.slice(0, line.length - trimmedStart.length);
    lines[i] = `${leadingWhitespace}${match[1]} ${match[2]} {#${item.id}}`;
  }

  return lines.join("\n");
};
