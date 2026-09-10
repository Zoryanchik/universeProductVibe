import type { FC } from "react";
import { cn } from "@universe-forma/ui-pes";
import radioOn from "@public/assets/modal/radio-on.svg?url";
import radioOff from "@public/assets/modal/radio-off.svg?url";

import type { SupportedOcrExportFormat } from "../../model/types";

interface Props {
  to: SupportedOcrExportFormat;
  index: number;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  onSelect: (format: SupportedOcrExportFormat) => void;
}

export const OCRFormatItem: FC<Props> = ({
  to,
  index,
  title,
  description,
  icon,
  active,
  onSelect,
}) => {
  return (
    <button
      type="button"
      data-testid={`modal-format-item-${index + 1}`}
      onClick={() => onSelect(to)}
      className={cn(
        "flex cursor-pointer flex-col gap-1 rounded-xl p-3 text-start transition-colors",
        active
          ? "border-primary-opacity-20 bg-primary-opacity-8 border-2"
          : "bg-material-grey-50"
      )}
    >
      <div className="flex w-full items-center gap-2">
        <div className="flex items-center p-2">
          <img
            src={active ? radioOn : radioOff}
            alt={active ? "Selected format" : "Not selected format"}
            className="size-6"
          />
        </div>
        <span className="text-text-primary flex-1 text-base leading-[22px] font-normal">
          {title}
        </span>
        <img src={icon} alt={`${title} format icon`} className="size-8" />
      </div>

      <p className="text-text-disabled text-sm leading-[18px]">{description}</p>
    </button>
  );
};
