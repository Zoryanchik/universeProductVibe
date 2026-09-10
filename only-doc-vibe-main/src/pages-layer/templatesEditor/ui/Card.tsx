import { type FC, type ReactNode, useRef } from "react";
import { registerNextDomDrop } from "polotno/canvas/page";

import { cn } from "@/shared/lib/utils/cn";

export interface CardProps {
  children: ReactNode;
  borderRadius?: "small" | "medium" | "large";
  hoverVariant?: "outline" | "fill";
  active?: boolean;
  onClick?: () => void;
  onDrag?: () => void;
  onDrop?: (
    position?: { x: number; y: number },
    targetElement?: unknown
  ) => void;
}

const borderRadiusStyles: Record<
  NonNullable<CardProps["borderRadius"]>,
  string
> = {
  small: "rounded-lg",
  medium: "rounded-[10px]",
  large: "rounded-xl",
};

const ACTIVE_SHADOW =
  "shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0px_1px_4px_0px_var(--color-primary-opacity-24),inset_0px_-1px_4px_0px_var(--color-primary-opacity-24)]";
const HOVER_SHADOW =
  "hover:shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0px_1px_4px_0px_var(--color-primary-opacity-24),inset_0px_-1px_4px_0px_var(--color-primary-opacity-24)]";
const ACTIVE_PSEUDO_SHADOW =
  "active:shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0px_1px_4px_0px_var(--color-primary-opacity-24),inset_0px_-1px_4px_0px_var(--color-primary-opacity-24)]";

export const Card: FC<CardProps> = ({
  children,
  borderRadius = "medium",
  hoverVariant = "outline",
  active = false,
  onDrag,
  onDrop,
  onClick,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        contentRef.current,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }

    onDrag?.();
    if (onClick) {
      onClick();

      return;
    }

    registerNextDomDrop((pos, element) => {
      onDrop?.({ x: pos.x, y: pos.y }, element);
    });
  };

  const handleDragEnd = () => {
    if (onClick) {
      return;
    }

    registerNextDomDrop(null);
  };

  const handleClick = () => {
    onClick?.();
    onDrop?.();
  };

  return (
    <div
      className={cn(
        "polotno-close-panel flex w-full flex-[1_0_0] flex-col items-stretch justify-center p-1 select-none",
        "border border-[var(--color-action-stroke)] bg-[var(--color-bg-white-bg)]",
        "transition-[background-color,border-color,box-shadow] duration-150",
        borderRadiusStyles[borderRadius],
        onClick ? "cursor-pointer active:cursor-grabbing" : "cursor-grab",
        hoverVariant === "fill"
          ? "hover:bg-[var(--color-primary-opacity-12)]"
          : cn("hover:border-[var(--color-primary-opacity-50)]", HOVER_SHADOW),
        cn(
          "active:border-[var(--color-primary-opacity-50)]",
          ACTIVE_PSEUDO_SHADOW
        ),
        active && cn("border-[var(--color-primary-opacity-50)]", ACTIVE_SHADOW)
      )}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div ref={contentRef} className="flex w-full flex-col items-stretch">
        {children}
      </div>
    </div>
  );
};
