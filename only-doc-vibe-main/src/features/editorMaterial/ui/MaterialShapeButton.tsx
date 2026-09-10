import React from "react";

import { cn } from "@/shared/lib/utils/cn";

interface MaterialShapeButtonProps {
  readonly path: string;
  readonly viewBox: readonly [number, number];
  readonly strokeWidth?: number;
  readonly title: string;
  readonly onSelect: () => void;
}

export const MaterialShapeButton: React.FC<MaterialShapeButtonProps> = ({
  path,
  viewBox,
  strokeWidth,
  title,
  onSelect,
}) => {
  // The incoming strokeWidth is the SDK insertion weight, which is far too thin
  // for the small preview when the viewBox is large (e.g. 2 in a 200 viewBox is a
  // ~0.3px hairline). Scale it to a visible fraction of the viewBox so previews
  // read clearly regardless of viewBox magnitude.
  const previewStrokeWidth = Math.max(strokeWidth ?? 0, viewBox[0] / 14, 2);

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onSelect}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded border border-transparent",
        "text-white/80 transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/10 hover:text-white"
      )}
    >
      <svg
        viewBox={`0 0 ${viewBox[0]} ${viewBox[1]}`}
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={previewStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={path} />
      </svg>
    </button>
  );
};
