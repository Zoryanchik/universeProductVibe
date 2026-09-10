import { memo, type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

import { Card } from "./Card";
import { IconButton } from "./IconButton";
import { Checkbox } from "./Checkbox";

interface ImageCardProps {
  src: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDelete?: (src: string) => void;
  onClick?: () => void;
  onDrop?: (
    position?: { x: number; y: number },
    targetElement?: unknown
  ) => void;
}

export const ImageCard: FC<ImageCardProps> = memo(
  ({ src, selected, onSelect, onDelete, onDrop, onClick }) => {
    return (
      <Card
        borderRadius="large"
        onDrop={onDrop}
        onClick={onClick}
        active={selected}
      >
        <div className="group relative aspect-square w-full">
          <div className="relative flex h-full min-h-0 w-full flex-[1_0_0] flex-col items-center justify-center overflow-clip rounded-lg">
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover will-change-transform"
            />
          </div>
          <div
            className={cn(
              "absolute inset-0 box-border flex flex-col items-start p-1.5 transition-opacity duration-150",
              "group-hover:pointer-events-auto group-hover:opacity-100",
              selected
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            )}
          >
            <div className="flex w-full items-center justify-between">
              {(onSelect || selected) && (
                <Checkbox checked={selected} onChange={onSelect} />
              )}
              {onDelete && (
                <IconButton
                  iconName="delete_forever"
                  onClick={() => onDelete(src)}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

ImageCard.displayName = "ImageCard";
