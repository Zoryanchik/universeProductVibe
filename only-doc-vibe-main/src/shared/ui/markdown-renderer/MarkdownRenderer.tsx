import React, { type JSX, type ReactNode } from "react";
import Markdown from "markdown-to-jsx";

import { cn } from "../../lib/utils/cn";
import { slugifyHeading } from "../../lib/blog/extract-toc";

interface MarkdownRendererProps {
  readonly content: string;
  readonly className?: string;
}

/**
 * Preprocesses markdown content to fix common formatting issues:
 * - Converts numbered list items with headers (e.g., "1. ## **TITLE**") to proper headers with section numbers
 */
const preprocessMarkdown = (content: string): string => {
  // Pattern: numbered list followed by header markers (e.g., "1. ## **TITLE**" or "12. ### **TITLE**")
  // Converts to: proper header with section number (e.g., "## 1. **TITLE**")
  return content.replace(
    /^(\d+)\.\s+##\s+(.+)$/gm,
    (_, number, title) => `## ${number}. ${title}`
  );
};

const HEADING_ID_PATTERN = /\s*\{#([a-z0-9-]+)\}\s*$/i;

/**
 * Walk the rendered children of a heading and extract:
 *  - the plain-text content (used to derive a slugified id),
 *  - an explicit `{#id}` if the markdown was annotated with one,
 *  - a copy of the children with the `{#id}` literal stripped.
 *
 * `markdown-to-jsx` does not support the `{#id}` (remark-attr) syntax, so the
 * blog ToC's annotated headings would otherwise render the literal `{#...}` as
 * visible text and never receive an `id` attribute, breaking in-page anchor
 * navigation.
 */
const processHeadingChildren = (
  children: ReactNode
): { id: string; cleanedChildren: ReactNode } => {
  let textContent = "";
  let explicitId: string | undefined;

  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      const match = HEADING_ID_PATTERN.exec(node);
      if (match) {
        explicitId = match[1];
        const stripped = node.replace(HEADING_ID_PATTERN, "");
        textContent += stripped;

        return stripped;
      }

      textContent += node;

      return node;
    }

    if (typeof node === "number") {
      textContent += String(node);

      return node;
    }

    if (Array.isArray(node)) {
      return node.map(walk);
    }

    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{ children?: ReactNode }>;
      const next = walk(element.props.children);

      return React.cloneElement(element, undefined, next);
    }

    return node;
  };

  const cleanedChildren = walk(children);
  const id = explicitId ?? slugifyHeading(textContent.trim());

  return { id, cleanedChildren };
};

const makeHeadingComponent = (
  Tag: "h1" | "h2" | "h3" | "h4",
  className: string
) => {
  const Heading = ({ children }: { children?: ReactNode }): JSX.Element => {
    const { id, cleanedChildren } = processHeadingChildren(children);

    return (
      <Tag id={id || undefined} className={className}>
        {cleanedChildren}
      </Tag>
    );
  };
  Heading.displayName = `MarkdownHeading(${Tag})`;

  return Heading;
};

const MarkdownTable = ({ children }: { children?: ReactNode }): JSX.Element => (
  <div className="my-6 w-full max-w-full overflow-x-auto">
    <table className="w-full min-w-[280px] border-collapse">{children}</table>
  </div>
);
MarkdownTable.displayName = "MarkdownTable";

export const MarkdownRenderer = ({
  content,
  className,
}: MarkdownRendererProps): JSX.Element => {
  const processedContent = preprocessMarkdown(content);

  return (
    <div
      className={cn(
        "prose prose-lg w-full max-w-none min-w-0 overflow-x-clip",
        // Headings - SEO hierarchy styling
        "prose-h1:text-desktop-title-1 prose-h1:mb-6 prose-h1:mt-8 prose-h1:font-bold prose-h1:text-[var(--color-text-primary)]",
        "prose-h2:text-desktop-title-3 prose-h2:mb-4 prose-h2:mt-8 prose-h2:font-semibold prose-h2:text-[var(--color-text-primary)]",
        "prose-h3:text-desktop-title-5 prose-h3:mb-3 prose-h3:mt-6 prose-h3:font-semibold prose-h3:text-[var(--color-text-primary)]",
        "prose-h4:text-desktop-title-6 prose-h4:mb-2 prose-h4:mt-4 prose-h4:font-medium prose-h4:text-[var(--color-text-primary)]",
        // Paragraphs
        "prose-p:text-body prose-p:mb-4 prose-p:leading-relaxed prose-p:break-words prose-p:text-[var(--color-text-secondary)]",
        // Links
        "prose-a:text-[var(--color-primary-dark)] prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
        // Lists - bullet and ordered
        "prose-ul:my-4 prose-ul:list-disc prose-ul:ps-6",
        "prose-ol:my-4 prose-ol:list-decimal prose-ol:ps-6",
        "prose-li:text-body prose-li:mb-2 prose-li:text-[var(--color-text-secondary)]",
        // Strong and emphasis
        "prose-strong:font-semibold prose-strong:text-[var(--color-text-primary)]",
        "prose-em:italic",
        // Blockquotes
        "prose-blockquote:border-s-4 prose-blockquote:border-[var(--color-primary)] prose-blockquote:ps-4 prose-blockquote:italic prose-blockquote:text-[var(--color-text-secondary)]",
        // Horizontal rules
        "prose-hr:my-8 prose-hr:border-gray-200",
        // Tables
        "prose-table:w-full prose-table:border-collapse prose-table:my-6",
        "prose-th:border prose-th:border-gray-300 prose-th:bg-yellow-50 prose-th:p-3 prose-th:text-start prose-th:font-semibold prose-th:whitespace-normal",
        "prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:whitespace-normal prose-td:break-words",
        // Media
        "prose-img:my-4 prose-img:h-auto prose-img:max-w-full",
        // Mobile responsive
        "max-md:prose-h1:text-mobile-title-1",
        "max-md:prose-h2:text-mobile-title-3",
        "max-md:prose-h3:text-mobile-title-5",
        "max-md:prose-h4:text-mobile-title-6",
        className
      )}
    >
      <Markdown
        options={{
          overrides: {
            h1: {
              component: makeHeadingComponent(
                "h1",
                "text-desktop-title-1 max-md:text-mobile-title-1 mb-6 mt-8 scroll-mt-24 font-bold text-[var(--color-text-primary)]"
              ),
            },
            h2: {
              component: makeHeadingComponent(
                "h2",
                "text-desktop-title-3 max-md:text-mobile-title-3 mb-4 mt-8 scroll-mt-24 font-semibold text-[var(--color-text-primary)]"
              ),
            },
            h3: {
              component: makeHeadingComponent(
                "h3",
                "text-desktop-title-5 max-md:text-mobile-title-5 mb-3 mt-6 scroll-mt-24 font-semibold text-[var(--color-text-primary)]"
              ),
            },
            h4: {
              component: makeHeadingComponent(
                "h4",
                "text-desktop-title-6 max-md:text-mobile-title-6 mb-2 mt-4 scroll-mt-24 font-medium text-[var(--color-text-primary)]"
              ),
            },
            p: {
              component: "p",
              props: {
                className:
                  "text-body mb-4 leading-relaxed break-words text-[var(--color-text-secondary)]",
              },
            },
            img: {
              component: "img",
              props: {
                className: "my-4 h-auto max-w-full",
                loading: "lazy",
              },
            },
            a: {
              component: "a",
              props: {
                className:
                  "text-[var(--color-primary-dark)] font-medium no-underline hover:underline",
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
            ul: {
              component: "ul",
              props: {
                className:
                  "my-4 list-disc ps-6 text-[var(--color-text-secondary)]",
              },
            },
            ol: {
              component: "ol",
              props: {
                className:
                  "my-4 list-decimal ps-6 text-[var(--color-text-secondary)]",
              },
            },
            li: {
              component: "li",
              props: {
                className: "text-body mb-2 text-[var(--color-text-secondary)]",
              },
            },
            strong: {
              component: "strong",
              props: {
                className: "font-semibold text-[var(--color-text-primary)]",
              },
            },
            em: {
              component: "em",
              props: {
                className: "italic",
              },
            },
            blockquote: {
              component: "blockquote",
              props: {
                className:
                  "border-s-4 border-[var(--color-primary)] ps-4 italic text-[var(--color-text-secondary)] my-4",
              },
            },
            hr: {
              component: "hr",
              props: {
                className: "my-8 border-gray-200",
              },
            },
            table: {
              component: MarkdownTable,
            },
            th: {
              component: "th",
              props: {
                className:
                  "border border-gray-300 bg-yellow-50 p-3 text-start font-semibold whitespace-normal",
              },
            },
            td: {
              component: "td",
              props: {
                className:
                  "border border-gray-300 p-3 whitespace-normal break-words",
              },
            },
          },
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
};
