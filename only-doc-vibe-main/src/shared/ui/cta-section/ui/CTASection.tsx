import { Button } from "@universe-forma/ui-pes";
import type { FC, ReactNode } from "react";
import { ReactComponent as UploadIcon } from "@public/assets/icons/upload.svg?react";

import { cn } from "../../../lib/utils/cn";
import { Image } from "../../image";
import { TitleUnderline } from "../../title-underline/ui/TitleUnderline";
import { Title } from "../../title";
import { useHighlightWidth } from "../lib/useHighlightWidth";
import type { ICTASectionProps, ICTABadge } from "../model/types";
import { CTABadge } from "./CTABadge";

interface ICTARootProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Root container for CTA section. Provides layout structure.
 */
export const CTARoot: FC<ICTARootProps> = ({ children, className }) => (
  <section className={cn("mx-auto max-w-[1460px] lg:py-40", className)}>
    <div
      className={cn(
        "mx-auto flex w-[calc(100%-24px)] flex-col items-center justify-center gap-6 rounded-[40px] bg-black px-6 py-10",
        "lg:mx-auto lg:w-[calc(100%-24px)] lg:flex-row lg:justify-between lg:gap-10 lg:rounded-[60px] lg:px-16 lg:py-16"
      )}
    >
      {children}
    </div>
  </section>
);

interface ICTAIllustrationProps {
  readonly src: string;
  readonly alt?: string;
  readonly className?: string;
}

/**
 * Floating illustration for CTA section.
 */
export const CTAIllustration: FC<ICTAIllustrationProps> = ({
  src,
  alt = "CTA illustration",
  className,
}) => (
  <div
    className={cn(
      "animate-floating flex shrink-0 items-center justify-center",
      className
    )}
  >
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      className="h-[160px] w-[160px] lg:h-[200px] lg:w-[200px]"
    />
  </div>
);

interface ICTATitleProps {
  readonly prefix: string;
  readonly highlight: string;
  readonly className?: string;
}

/**
 * CTA title with underlined highlight text.
 */
export const CTATitle: FC<ICTATitleProps> = ({
  prefix,
  highlight,
  className,
}) => {
  const { highlightRef, width } = useHighlightWidth(highlight);

  return (
    <Title
      variant="desktop-title-2"
      level="h2"
      className={cn(
        "flex flex-col items-center justify-center gap-2 self-stretch text-center lg:items-start lg:text-start",
        className
      )}
    >
      <span className="text-mobile-title-2 lg:text-desktop-title-2 text-white">
        {prefix}
      </span>
      <span className="relative inline-block whitespace-nowrap">
        <span
          ref={highlightRef}
          className="text-mobile-title-2 lg:text-desktop-title-2 relative z-10 text-white"
        >
          {highlight}
        </span>

        {width > 0 && (
          <TitleUnderline
            width={width + 8}
            className="absolute bottom-0 left-1/2 z-0 -translate-x-1/2 translate-y-[15%]"
          />
        )}
      </span>
    </Title>
  );
};

interface ICTABadgeListProps {
  readonly badges: readonly ICTABadge[];
  readonly className?: string;
}

/**
 * List of feature badges for CTA section.
 */
export const CTABadgeList: FC<ICTABadgeListProps> = ({ badges, className }) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-center gap-5 lg:justify-start",
      className
    )}
    role="list"
    aria-label="Features"
  >
    {badges.map((badge) => (
      <CTABadge key={badge.id} {...badge} />
    ))}
  </div>
);

interface ICTAContentProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Content wrapper for CTA section (illustration + text content).
 */
export const CTAContent: FC<ICTAContentProps> = ({ children, className }) => (
  <div
    className={cn(
      "flex w-full flex-col items-center justify-center sm:flex-row lg:gap-10",
      className
    )}
  >
    {children}
  </div>
);

interface ICTATextContentProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Text content wrapper (title + badges).
 */
export const CTATextContent: FC<ICTATextContentProps> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col items-center gap-6 lg:items-start lg:gap-8",
      className
    )}
  >
    {children}
  </div>
);

interface ICTAActionProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Action container for CTA button.
 */
export const CTAAction: FC<ICTAActionProps> = ({ children, className }) => (
  <div className={cn("flex shrink-0 items-center justify-center", className)}>
    {children}
  </div>
);

interface ICTAButtonProps {
  readonly label: string;
  readonly onClick?: () => void;
  readonly icon?: ReactNode;
}

/**
 * CTA action button with upload icon.
 */
export const CTAButton: FC<ICTAButtonProps> = ({
  label,
  onClick,
  icon = (
    <UploadIcon
      width={16}
      height={16}
      style={{
        width: "16px",
        height: "16px",
        display: "block",
      }}
    />
  ),
}) => (
  <Button
    variant="filled"
    size="lg"
    color="primary"
    rightIcon={icon}
    onClick={onClick}
  >
    {label}
  </Button>
);

export const CTASection: FC<ICTASectionProps> = ({
  titlePrefix,
  titleHighlight,
  badges,
  buttonLabel,
  illustrationSrc,
  onButtonClick,
}) => (
  <CTARoot>
    <CTAContent>
      <CTAIllustration
        src={illustrationSrc}
        alt="PDF conversion illustration"
      />
      <CTATextContent>
        <CTATitle prefix={titlePrefix} highlight={titleHighlight} />
        <CTABadgeList badges={badges} />
      </CTATextContent>
    </CTAContent>
    <CTAAction>
      <CTAButton label={buttonLabel} onClick={onButtonClick} />
    </CTAAction>
  </CTARoot>
);
