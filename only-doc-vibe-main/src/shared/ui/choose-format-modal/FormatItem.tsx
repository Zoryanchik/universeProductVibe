import type { FC } from "react";
import { cn } from "@universe-forma/ui-pes";
import radio_off from "@public/assets/modal/radio-off.svg?url";
import radio_on from "@public/assets/modal/radio-on.svg?url";

import type { InternalFileType } from "../../constants/file-type";
import { Image } from "../image";
import type { IFormatDictionaryOption } from "./model/constants";

interface Props {
  item: IFormatDictionaryOption;
  isSelected: boolean;
  onSelect: (item: InternalFileType) => void;
}

export const FormatItem: FC<Props> = ({ item, isSelected, onSelect }) => {
  return (
    <div
      className={cn(
        "bg-material-grey-50 border-material-grey-50 flex max-h-16 flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 p-3 max-sm:max-h-14",
        {
          "border-primary-opacity-20 bg-primary-opacity-8 border-2": isSelected,
        }
      )}
      onClick={() => onSelect(item.to)}
      role="button"
    >
      <div className="flex flex-1 items-center justify-start">
        <div className="flex max-h-10 min-h-10 max-w-10 min-w-10 flex-1 items-center justify-center p-2">
          <Image
            src={isSelected ? radio_on : radio_off}
            alt={isSelected ? "Selected format" : "Not selected format"}
          />
        </div>
        <span className="text-body text-text-primary max-sm:text-body-2! font-normal">
          {item.label}
        </span>
      </div>
      {item.icon && (
        <div className="flex size-8 items-center justify-center rounded-lg p-0.5 max-sm:size-6">
          <Image src={item.icon} alt={`${item.label} format icon`} />
        </div>
      )}
    </div>
  );
};
