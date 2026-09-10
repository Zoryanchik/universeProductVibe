import type { FC } from "react";

import { cn } from "../../../lib/utils/cn";
import { Title } from "../../title";
import { UploadButton } from "../../upload-button";
import { useBottomCtaStyles } from "../lib/useBottomCtaStyles";
import type { BottomCtaSectionProps } from "../model/types";

export const BottomCtaSection: FC<BottomCtaSectionProps> = ({
  title,
  subtitle,
  buttonLabel,
  onFileUpload,
  acceptedFormats,
  className,
}) => {
  const {
    outerContainerClassName,
    innerContainerClassName,
    titleSubtitleWrapperClassName,
    titleClassName,
    subtitleClassName,
  } = useBottomCtaStyles();

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1460px] px-3 py-6 md:py-15 lg:w-[calc(100%-24px)]",
        className
      )}
      aria-label={title}
    >
      <div className={outerContainerClassName}>
        <div className={innerContainerClassName}>
          <div className={titleSubtitleWrapperClassName}>
            <Title
              level="h2"
              variant="desktop-title-2"
              align="center"
              className={titleClassName}
            >
              {title}
            </Title>
            <p className={subtitleClassName}>{subtitle}</p>
          </div>

          <div>
            <UploadButton
              label={buttonLabel}
              onFileUpload={onFileUpload}
              acceptedFormats={acceptedFormats}
              showGlow={true}
              buttonClassName="w-full min-w-[200px] max-w-[280px] sm:w-[320px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
