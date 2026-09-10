import type { FC, ReactNode } from "react";
import { cn } from "@universe-forma/ui-pes";
import radioOn from "@public/assets/modal/radio-on.svg?url";
import radioOff from "@public/assets/modal/radio-off.svg?url";

import type { ECompressionLevel } from "../../model/constants/compression-level";
import { getCompressedSize } from "../../lib/getCompressedSize";

export interface ICompressList {
  title: ReactNode;
  text: ReactNode;
  id: ECompressionLevel;
}

interface IProps {
  item: ICompressList;
  fileSize: number;
  isSelected: boolean;
  onSelect: (level: ECompressionLevel) => void;
  finalSizeLabel: string;
  testId: string;
}

export const CompressionLevelItem: FC<IProps> = ({
  item,
  fileSize,
  isSelected,
  onSelect,
  finalSizeLabel,
  testId,
}) => {
  const { compressedSize, sizeUnit } = getCompressedSize(fileSize, item.id);

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex cursor-pointer flex-col gap-2 p-3 text-start transition-colors md:flex-1",
        isSelected
          ? "border-primary-opacity-20 bg-primary-opacity-8 rounded-xl border-2"
          : cn(
              "md:border-material-grey-50 md:bg-material-grey-50 md:rounded-xl md:border-2",
              "max-md:border-b max-md:border-black/[0.08]"
            )
      )}
    >
      <div className="flex w-full items-center gap-3">
        <span className="text-text-primary flex-1 text-lg leading-[26px] font-medium">
          {item.title}
        </span>
        <div className="flex items-center justify-center p-2">
          <img
            src={isSelected ? radioOn : radioOff}
            alt=""
            className="size-6"
          />
        </div>
      </div>

      <p className="text-sm leading-[18px]">{item.text}</p>

      <div className="flex items-center rounded-md border-2 border-white bg-[#e0e0e0] px-1.5 py-0.5 backdrop-blur-[40px]">
        <span className="text-text-primary text-sm leading-5 font-medium">
          {finalSizeLabel}: ~{compressedSize} {sizeUnit}
        </span>
      </div>
    </button>
  );
};
