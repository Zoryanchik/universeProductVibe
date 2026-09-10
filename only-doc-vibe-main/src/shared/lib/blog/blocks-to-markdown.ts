type BlockChild = {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  url?: string;
  children?: BlockChild[];
};

type Block = {
  type: string;
  level?: number;
  format?: string;
  children?: BlockChild[];
  image?: { url: string; alternativeText?: string };
  language?: string;
};

const childToMarkdown = (child: BlockChild): string => {
  let text = child.text ?? "";

  if (child.type === "link") {
    const inner = (child.children ?? []).map(childToMarkdown).join("");

    return `[${inner}](${child.url ?? ""})`;
  }

  if (child.code) text = `\`${text}\``;

  if (child.bold) text = `**${text}**`;

  if (child.italic) text = `*${text}*`;

  if (child.underline) text = `<u>${text}</u>`;

  return text;
};

const blockToMarkdown = (block: Block): string => {
  const children = block.children ?? [];
  const inline = children.map(childToMarkdown).join("");

  switch (block.type) {
    case "heading":
      return `${"#".repeat(block.level ?? 2)} ${inline}`;
    case "paragraph":
      return inline;
    case "list": {
      const isOrdered = block.format === "ordered";

      return children
        .map((item, i) => {
          const itemText = (item.children ?? []).map(childToMarkdown).join("");

          return isOrdered ? `${i + 1}. ${itemText}` : `- ${itemText}`;
        })
        .join("\n");
    }
    case "quote":
      return `> ${inline}`;
    case "code":
      return `\`\`\`${block.language ?? ""}\n${inline}\n\`\`\``;
    case "image": {
      const src = block.image?.url ?? "";
      const alt = block.image?.alternativeText ?? "";

      return `![${alt}](${src})`;
    }
    default:
      return inline;
  }
};

/**
 * Converts a Strapi v5 rich-text blocks array to a plain markdown string.
 * Returns the value unchanged if it is already a string.
 */
export const blocksToMarkdown = (content: unknown): string => {
  if (typeof content === "string") return content;

  if (!Array.isArray(content)) return "";

  return (content as Block[])
    .map(blockToMarkdown)
    .filter((line) => line !== "")
    .join("\n\n");
};
