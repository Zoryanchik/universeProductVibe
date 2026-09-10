import { Button } from "@universe-forma/ui-pes";
import React from "react";

import { getIconById } from "../lib/getIconById";
import { usePrimaryButtonGlow } from "../lib/usePrimaryButtonGlow";
import type { PrimaryButtonProps } from "../model/types";

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onClick,
  size = "lg",
  variant = "filled",
  color = "primary",
  loading = false,
  disabled = false,
  rightIconId,
  leftIconId,
  iconSize,
  showGlow = true,
  className,
  buttonClassName,
  wrapperClassName,
}) => {
  const { glowAnimationStyles, glowClassName } = usePrimaryButtonGlow({
    showGlow,
  });

  const leftIcon = getIconById(leftIconId, iconSize);
  const rightIcon = getIconById(rightIconId, iconSize);

  const combinedWrapperClassName = [glowClassName, wrapperClassName, className]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <style>{glowAnimationStyles}</style>
      <div className={combinedWrapperClassName}>
        <Button
          className={buttonClassName}
          variant={variant}
          size={size}
          color={color}
          loading={loading}
          disabled={disabled}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          onClick={onClick}
        >
          {label}
        </Button>
      </div>
    </>
  );
};
