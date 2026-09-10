import type { StoreType } from "polotno/model/store";
import { unitToPx, type UnitType } from "polotno/utils/unit";
import { useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { useApplyCanvasSizeToAllPages } from "../../../../../helpers/applyCanvasSizeToAllPages";
import { Card } from "../../../../../ui/Card";
import instagramIcon from "./assets/instagram.svg?url";
import facebookIcon from "./assets/facebook.svg?url";
import youtubeIcon from "./assets/youtube.svg?url";
import linkedinIcon from "./assets/linkedin.svg?url";
import twitterIcon from "./assets/twitter.svg?url";
import videoIcon from "./assets/video.svg?url";
import printIcon from "./assets/print.svg?url";

interface SizePreset {
  nameKey: string;
  width: number;
  height: number;
  unit: UnitType;
  icon: string;
}

interface SizeCategory {
  nameKey: string;
  icon: string;
  sizes: SizePreset[];
}

const CAT = "templatesEditor.side_panel.size_presets.categories";
const SIZE = "templatesEditor.side_panel.size_presets.sizes";

const SIZE_CATEGORIES: SizeCategory[] = [
  {
    nameKey: `${CAT}.instagram`,
    icon: instagramIcon,
    sizes: [
      {
        nameKey: `${SIZE}.post`,
        width: 1080,
        height: 1080,
        unit: "px",
        icon: "crop_square",
      },
      {
        nameKey: `${SIZE}.story`,
        width: 1080,
        height: 1920,
        unit: "px",
        icon: "crop_9_16",
      },
      {
        nameKey: `${SIZE}.ad`,
        width: 1080,
        height: 1080,
        unit: "px",
        icon: "crop_square",
      },
    ],
  },
  {
    nameKey: `${CAT}.facebook`,
    icon: facebookIcon,
    sizes: [
      {
        nameKey: `${SIZE}.post`,
        width: 1200,
        height: 630,
        unit: "px",
        icon: "crop_landscape",
      },
      {
        nameKey: `${SIZE}.post`,
        width: 1080,
        height: 1080,
        unit: "px",
        icon: "crop_square",
      },
      {
        nameKey: `${SIZE}.cover`,
        width: 851,
        height: 315,
        unit: "px",
        icon: "crop_16_9",
      },
    ],
  },
  {
    nameKey: `${CAT}.youtube`,
    icon: youtubeIcon,
    sizes: [
      {
        nameKey: `${SIZE}.thumbnail`,
        width: 1280,
        height: 720,
        unit: "px",
        icon: "crop_16_9",
      },
      {
        nameKey: `${SIZE}.channel`,
        width: 2560,
        height: 1440,
        unit: "px",
        icon: "crop_16_9",
      },
      {
        nameKey: `${SIZE}.short`,
        width: 1080,
        height: 1920,
        unit: "px",
        icon: "crop_9_16",
      },
    ],
  },
  {
    nameKey: `${CAT}.linkedin`,
    icon: linkedinIcon,
    sizes: [
      {
        nameKey: `${SIZE}.post`,
        width: 1200,
        height: 627,
        unit: "px",
        icon: "crop_landscape",
      },
      {
        nameKey: `${SIZE}.banner`,
        width: 1584,
        height: 396,
        unit: "px",
        icon: "view_day",
      },
      {
        nameKey: `${SIZE}.square`,
        width: 1080,
        height: 1080,
        unit: "px",
        icon: "crop_square",
      },
    ],
  },
  {
    nameKey: `${CAT}.twitter`,
    icon: twitterIcon,
    sizes: [
      {
        nameKey: `${SIZE}.post`,
        width: 1600,
        height: 900,
        unit: "px",
        icon: "crop_landscape",
      },
      {
        nameKey: `${SIZE}.header`,
        width: 1500,
        height: 500,
        unit: "px",
        icon: "view_day",
      },
      {
        nameKey: `${SIZE}.square`,
        width: 1080,
        height: 1080,
        unit: "px",
        icon: "crop_square",
      },
    ],
  },
  {
    nameKey: `${CAT}.video`,
    icon: videoIcon,
    sizes: [
      {
        nameKey: `${SIZE}.full_hd`,
        width: 1920,
        height: 1080,
        unit: "px",
        icon: "full_hd",
      },
      {
        nameKey: `${SIZE}.uhd_4k`,
        width: 3840,
        height: 2160,
        unit: "px",
        icon: "4k",
      },
      {
        nameKey: `${SIZE}.vertical_hd`,
        width: 1080,
        height: 1920,
        unit: "px",
        icon: "crop_portrait",
      },
      {
        nameKey: `${SIZE}.square_hd`,
        width: 1080,
        height: 1080,
        unit: "px",
        icon: "crop_square",
      },
    ],
  },
  {
    nameKey: `${CAT}.print`,
    icon: printIcon,
    sizes: [
      {
        nameKey: `${SIZE}.invitation`,
        width: 14,
        height: 14,
        unit: "cm",
        icon: "crop_square",
      },
      {
        nameKey: `${SIZE}.a4_portrait`,
        width: 21,
        height: 29.7,
        unit: "cm",
        icon: "crop_portrait",
      },
      {
        nameKey: `${SIZE}.a4_landscape`,
        width: 29.7,
        height: 21,
        unit: "cm",
        icon: "crop_landscape",
      },
      {
        nameKey: `${SIZE}.a3`,
        width: 29.7,
        height: 42,
        unit: "cm",
        icon: "crop_portrait",
      },
      {
        nameKey: `${SIZE}.letter_portrait`,
        width: 8.5,
        height: 11,
        unit: "in",
        icon: "crop_portrait",
      },
      {
        nameKey: `${SIZE}.letter`,
        width: 11,
        height: 8.5,
        unit: "in",
        icon: "crop_landscape",
      },
      {
        nameKey: `${SIZE}.business_card`,
        width: 3.5,
        height: 2,
        unit: "in",
        icon: "id_card",
      },
      {
        nameKey: `${SIZE}.poster`,
        width: 18,
        height: 24,
        unit: "in",
        icon: "image",
      },
    ],
  },
];

const formatDimension = (
  width: number,
  height: number,
  unit: UnitType
): string => {
  if (unit === "px") {
    return `${width}\u00D7${height}px`;
  }

  return `${width}\u00D7${height} ${unit}`;
};

interface PresetsSectionProps {
  store: StoreType;
}

export const PresetsSection: FC<PresetsSectionProps> = ({ store }) => {
  const { t } = useTranslation();
  const { applyCanvasSizeToAllPages } = useApplyCanvasSizeToAllPages({ store });

  const handlePresetClick = useCallback(
    (preset: SizePreset) => {
      const pxWidth = unitToPx({
        unitVal: preset.width,
        dpi: store.dpi,
        unit: preset.unit,
      });
      const pxHeight = unitToPx({
        unitVal: preset.height,
        dpi: store.dpi,
        unit: preset.unit,
      });

      store.setUnit({ unit: preset.unit, dpi: store.dpi });
      applyCanvasSizeToAllPages(pxWidth, pxHeight);
    },
    [applyCanvasSizeToAllPages, store]
  );

  return (
    <div className="flex w-full flex-col gap-[18px]">
      {SIZE_CATEGORIES.map((category) => {
        const categoryName = t(category.nameKey) as string;

        return (
          <div key={category.nameKey} className="flex w-full flex-col gap-1">
            <div className="flex items-center rounded-[12px]">
              <div className="box-border flex h-8 min-h-[32px] w-8 min-w-[32px] items-center justify-center rounded-[8px] p-1.5">
                <img
                  src={category.icon}
                  alt={categoryName}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="flex-1 overflow-hidden [font-family:'Outfit',sans-serif] text-base leading-[22px] font-normal text-ellipsis whitespace-nowrap text-[var(--color-text-primary)]">
                {categoryName}
              </span>
            </div>
            <div className="grid w-full grid-cols-3 gap-2">
              {category.sizes.map((preset, index) => {
                const presetName = t(preset.nameKey) as string;

                return (
                  <div key={`${preset.nameKey}-${index}`} className="p-1">
                    <Card
                      borderRadius="large"
                      onClick={() => handlePresetClick(preset)}
                    >
                      <div className="flex w-full flex-col items-center justify-center gap-[10px]">
                        <div className="flex items-center justify-center rounded-[8px] bg-[var(--color-bg-white-bg)] p-2">
                          <span className="material-symbols-rounded text-[40px] text-[#323232]">
                            {preset.icon}
                          </span>
                        </div>
                        <div className="flex w-full flex-col items-center gap-1 text-center whitespace-nowrap">
                          <span className="w-full overflow-hidden [font-family:'Outfit',sans-serif] text-sm leading-[18px] font-semibold text-ellipsis text-[var(--color-text-primary)]">
                            {presetName}
                          </span>
                          <span className="w-full overflow-hidden [font-family:'Outfit',sans-serif] text-[13px] leading-4 font-normal tracking-[0.26px] text-ellipsis text-[var(--color-text-secondary)]">
                            {formatDimension(
                              preset.width,
                              preset.height,
                              preset.unit
                            )}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
