import React from "react";
import Markdown from "markdown-to-jsx";

interface AiResponseBodyProps {
  content: string;
}

/**
 * Explicit element overrides so the rendered markdown has a single, intentional
 * type scale and spacing rhythm. Without these, `markdown-to-jsx` emits bare
 * `<p>`/`<ul>`/headings that fall back to inconsistent UA defaults (oversized
 * text, large margins), which is why the summary looked off.
 */
const markdownOverrides = {
  p: {
    props: {
      className: "text-[15px] leading-[21px] text-black/87",
    },
  },
  strong: {
    props: { className: "font-semibold" },
  },
  ul: {
    props: {
      className: "my-1 flex list-disc flex-col gap-1 ps-5",
    },
  },
  ol: {
    props: {
      className: "my-1 flex list-decimal flex-col gap-1 ps-5",
    },
  },
  li: {
    props: { className: "text-[15px] leading-[21px] text-black/87" },
  },
  h1: {
    props: { className: "text-lg font-semibold text-black/87" },
  },
  h2: {
    props: { className: "text-base font-semibold text-black/87" },
  },
  h3: {
    props: { className: "text-base font-semibold text-black/87" },
  },
  a: {
    props: {
      className: "text-[color:var(--color-primary)] underline",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  },
} as const;

export const AiResponseBody: React.FC<AiResponseBodyProps> = ({ content }) => (
  <div className="flex max-w-none flex-col gap-2 text-[15px] leading-[21px] text-black/87">
    <Markdown
      options={{
        forceBlock: true,
        disableParsingRawHTML: true,
        overrides: markdownOverrides,
      }}
    >
      {content}
    </Markdown>
  </div>
);
