"use client";

import { Button } from "@universe-forma/ui-pes";
import type { FC } from "react";
import { ReactComponent as UploadIcon } from "@public/assets/icons/upload.svg?react";

import { usePrimaryButtonGlow } from "../../primary-button";
import { useUploadButton } from "../lib/useUploadButton";
import type { IUploadButtonProps } from "../types";

export const UploadButton: FC<IUploadButtonProps> = ({
  label,
  onFileUpload,
  acceptedFormats,
  multiple = false,
  showGlow = true,
  showIcon = true,
  className,
  buttonClassName,
}) => {
  const { fileInputRef, handleClick, handleFileChange, acceptString } =
    useUploadButton({ onFileUpload, acceptedFormats });

  const { glowAnimationStyles, glowClassName } = usePrimaryButtonGlow({
    showGlow,
  });

  const combinedWrapperClassName = [glowClassName, className]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <style>{glowAnimationStyles}</style>
      <div className={combinedWrapperClassName}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
        <Button
          className={buttonClassName}
          variant="filled"
          size="lg"
          color="primary"
          rightIcon={
            showIcon ? (
              <UploadIcon
                width={18}
                height={18}
                style={{
                  width: "18px",
                  height: "18px",
                  display: "block",
                }}
              />
            ) : undefined
          }
          onClick={handleClick}
        >
          {label}
        </Button>
      </div>
    </>
  );
};
