"use client";

import type { FC } from "react";

import { Title } from "@/shared/ui/title";
import { UploadArea, type IUploadAreaProps } from "@/shared/ui/upload-area";
import { UploadButton } from "@/shared/ui/upload-button";

export interface IDefaultHeroProps extends IUploadAreaProps {
  readonly title: string;
  readonly subtitle: string;
}

export const DefaultHero: FC<IDefaultHeroProps> = ({
  title,
  subtitle,
  buttonLabel,
  supportedFormatsText,
  maxSizeText,
  dropText,
  acceptedFormats,
  onFileUpload,
  validationError,
  setValidationError,
  multiple,
  showUnlockIllustration,
}) => {
  return (
    <div className="mx-auto flex max-w-[1140px] flex-col items-center gap-6 md:flex-row md:items-stretch">
      <div className="flex flex-col gap-1 text-center md:flex-1 md:justify-center md:gap-4 md:text-start">
        <Title
          level="h1"
          variant="desktop-title-1"
          align="center"
          className="text-black/87 md:text-start"
        >
          {title}
        </Title>

        <p className="text-subtitle font-medium text-black/60 md:text-xl md:leading-[1.2]">
          {subtitle}
        </p>
      </div>

      <UploadButton
        label={buttonLabel}
        onFileUpload={onFileUpload}
        acceptedFormats={acceptedFormats}
        multiple={multiple}
        showGlow={false}
        showIcon
        className="w-full md:hidden"
        buttonClassName="w-full"
      />

      <div className="hidden md:block md:flex-1">
        <UploadArea
          buttonLabel={buttonLabel}
          supportedFormatsText={supportedFormatsText}
          maxSizeText={maxSizeText}
          dropText={dropText}
          acceptedFormats={acceptedFormats}
          onFileUpload={onFileUpload}
          validationError={validationError}
          setValidationError={setValidationError}
          multiple={multiple}
          showUnlockIllustration={showUnlockIllustration}
        />
      </div>
    </div>
  );
};
