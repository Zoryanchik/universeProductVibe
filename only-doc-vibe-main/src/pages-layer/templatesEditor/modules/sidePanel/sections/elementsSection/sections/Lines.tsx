import { useMemo, type FC } from "react";
import type { StoreType } from "polotno/model/store";
import { svgToURL } from "polotno/utils/svg";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../../ui/SidePanelSectionLabel";
import UploadList from "../../../../../components/uploadList/UploadList";
import type { UploadListImage } from "../../../../../model/element-types";
import { ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE } from "../../../../../constants/colors";

interface LinePreset {
  id: string;
  svg: string;
  data: Record<string, unknown>;
}

const S = ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE;

const LINE_PRESETS: LinePreset[] = [
  {
    id: "solid",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path stroke="${S}" stroke-width="2.5" d="M 8 40 L 72 40"/>
    </svg>`,
    data: {},
  },
  {
    id: "dashed",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path stroke="${S}" stroke-width="2.5" stroke-dasharray="8 5" d="M 8 40 L 72 40"/>
    </svg>`,
    data: { dash: [4, 2] },
  },
  {
    id: "dotted",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path stroke="${S}" stroke-width="2.5" stroke-dasharray="2 3" d="M 8 40 L 72 40"/>
    </svg>`,
    data: { dash: [1, 1] },
  },
  {
    id: "arrow-end",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path stroke="${S}" stroke-width="2.5" d="M 8 40 L 72 40" stroke-linecap="round"/>
      <path stroke="${S}" stroke-width="1.5" d="M 66 36 L 72 40 L 66 44" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`,
    data: { endHead: "arrow" },
  },
  {
    id: "circle-triangle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path stroke="${S}" stroke-width="2.5" d="M 8 40 L 72 40" stroke-linecap="round"/>
      <path stroke="${S}" stroke-width="1.5" d="M 66 36 L 72 40 L 66 44 Z" fill="${S}" stroke-linejoin="round"/>
      <circle cx="8" cy="40" r="3" fill="${S}"/>
    </svg>`,
    data: { startHead: "circle", endHead: "triangle" },
  },
  {
    id: "square-bar-dashed",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect x="5" y="37" width="6" height="6" fill="${S}"/>
      <path stroke="${S}" stroke-width="2.5" d="M 8 40 L 72 40" stroke-linecap="round" stroke-dasharray="5 3"/>
      <path stroke="${S}" stroke-width="2.5" d="M 72 36 L 72 44" stroke-linecap="round"/>
    </svg>`,
    data: { startHead: "square", endHead: "bar", dash: [2, 1] },
  },
];

interface LinesSectionProps {
  store: StoreType;
}

const LinesSection: FC<LinesSectionProps> = ({ store }) => {
  const { t } = useTranslation();
  const images: UploadListImage[] = useMemo(
    () =>
      LINE_PRESETS.map((preset) => ({
        id: preset.id,
        src: svgToURL(preset.svg),
        elementProps: preset.data,
      })),
    []
  );

  return (
    <div className="box-border flex w-full flex-shrink-0 flex-col gap-4 px-5">
      <SidePanelSectionLabel
        label={t("templatesEditor.side_panel.headers.lines") as string}
        type="sub-header"
      />
      <UploadList store={store} images={images} size="small" type="line" />
    </div>
  );
};

export default LinesSection;
