import React from "react";
import { ReactComponent as FitIcon } from "@public/assets/editor/bottom-bar/fit.svg?react";
import { ReactComponent as MinusIcon } from "@public/assets/editor/bottom-bar/minus.svg?react";
import { ReactComponent as PlusIcon } from "@public/assets/editor/bottom-bar/plus.svg?react";
import { ReactComponent as RotateIcon } from "@public/assets/editor/bottom-bar/rotate.svg?react";

/** 20×20 — matches Figma icon-button / fit & rotate assets */
export const FitToScreenIcon: React.FC = () => (
  <FitIcon className="block size-5 shrink-0" aria-hidden />
);

export const RotatePageIcon: React.FC = () => (
  <RotateIcon className="block size-5 shrink-0" aria-hidden />
);

/** 12×2 / 12×12 — keep native asset dimensions (do not scale to 20×20) */
export const ZoomOutIcon: React.FC = () => (
  <MinusIcon className="block h-0.5 w-3 shrink-0" aria-hidden />
);

export const ZoomInIcon: React.FC = () => (
  <PlusIcon className="block size-3 shrink-0" aria-hidden />
);
