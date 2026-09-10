import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { Tooltip } from "./Tooltip";

const SWATCH_SHADOW =
  "shadow-[0px_0px_0px_4px_var(--color-primary-opacity-12),0px_1px_2px_0px_rgba(0,0,0,0.08)]";
const SWATCH_SHADOW_HOVER =
  "hover:shadow-[0px_0px_0px_4px_var(--color-primary-opacity-12),0px_1px_2px_0px_rgba(0,0,0,0.08)]";

interface ColorsProps {
  colors: string[];
  activeColor?: string;
  onSelectColor: (color: string) => void;
  onClickAddColor?: () => void;
}

export const Colors: FC<ColorsProps> = ({
  colors,
  activeColor,
  onSelectColor,
  onClickAddColor,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-between">
      {colors.map((color) => {
        const isActive =
          !!activeColor && activeColor.toLowerCase() === color.toLowerCase();

        return (
          <button
            key={color}
            type="button"
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
            className={cn(
              "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border-none p-0 transition-shadow duration-150 outline-none",
              SWATCH_SHADOW_HOVER,
              isActive && SWATCH_SHADOW
            )}
          >
            {isActive && (
              <span className="material-symbols-rounded text-2xl text-white">
                check
              </span>
            )}
          </button>
        );
      })}
      {onClickAddColor && (
        <button
          type="button"
          onClick={onClickAddColor}
          className={cn(
            "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border-[3px] border-solid border-transparent p-0 text-2xl text-[var(--color-bg-dark-blue-grey)] transition-shadow duration-150 outline-none",
            "bg-[linear-gradient(white,white)_padding-box,conic-gradient(#ff0000,#ff9900,#ffff00,#00ff00,#0099ff,#6633ff,#ff0000)_border-box]",
            SWATCH_SHADOW_HOVER
          )}
        >
          <Tooltip
            content={t("templatesEditor.ui.pick_a_color") as string}
            placement="top"
            offset={15}
          >
            <span className="material-symbols-rounded">add</span>
          </Tooltip>
        </button>
      )}
    </div>
  );
};
