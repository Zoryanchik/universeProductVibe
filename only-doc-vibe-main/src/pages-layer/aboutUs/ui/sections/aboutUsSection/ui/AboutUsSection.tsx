import type { FC } from "react";
import Markdown from "markdown-to-jsx";

import { Title } from "@/shared/ui/title";
import { Image } from "@/shared/ui/image";

import type { IAboutUsSectionProps } from "../model/types";

const BOLD_TITLE_REGEX = /^\*\*(.+?)\*\*[ \t]*(\n|$)/m;

const extractBoldTitle = (
  raw: string
): { sectionTitle: string | null; body: string } => {
  const match = raw.match(BOLD_TITLE_REGEX);
  if (!match) return { sectionTitle: null, body: raw };

  return {
    sectionTitle: match[1],
    body: raw.replace(BOLD_TITLE_REGEX, "").trim(),
  };
};

export const AboutUsSection: FC<IAboutUsSectionProps> = ({
  title,
  subtitle,
  content,
  imageUrl,
  imageAlt,
}) => {
  const { sectionTitle, body } = extractBoldTitle(content);

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 min-[1024px]:gap-10 min-[1024px]:px-[114px] min-[1024px]:py-12 min-[1440px]:px-[150px]">
      <div className="flex max-w-[871px] flex-col gap-2 text-[#020F20]">
        <Title level="h1" variant="desktop-title-1" align="left">
          {title}
        </Title>
        <span className="text-body-2 min-[1024px]:text-desktop-title-6 text-black/60">
          {subtitle}
        </span>
      </div>
      <div className="grid items-center gap-4 min-[1024px]:grid-cols-2 min-[1024px]:gap-10">
        <div className="h-[342px] overflow-hidden rounded-[20px] bg-white">
          <Image
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="text-text-primary flex flex-col gap-2">
          {sectionTitle && (
            <Title level="h2" variant="desktop-title-5" align="left">
              {sectionTitle}
            </Title>
          )}
          <Markdown
            options={{
              overrides: {
                p: {
                  component: "p",
                  props: {
                    className:
                      "text-body-2 min-[1024px]:text-subtitle text-black/60",
                  },
                },
              },
              forceBlock: true,
            }}
          >
            {body}
          </Markdown>
        </div>
      </div>
    </section>
  );
};
