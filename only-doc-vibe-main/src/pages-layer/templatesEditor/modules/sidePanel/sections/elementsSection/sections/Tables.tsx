import { useMemo, type FC } from "react";
import type { StoreType } from "polotno/model/store";
import { svgToURL } from "polotno/utils/svg";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../../ui/SidePanelSectionLabel";
import UploadList from "../../../../../components/uploadList/UploadList";
import type { UploadListImage } from "../../../../../model/element-types";

interface TablePreset {
  id: string;
  rows: number;
  cols: number;
}

const PREVIEW_STROKE = "#C0BFBF";

const TABLE_W = 80;
const TABLE_H = 60;
const VIEWBOX_SIZE = 100;
const PAD_X = (VIEWBOX_SIZE - TABLE_W) / 2;
const PAD_Y = (VIEWBOX_SIZE - TABLE_H) / 2;

function generateTablePreviewSvg(rows: number, cols: number): string {
  let lines = "";

  for (let i = 1; i < cols; i++) {
    const x = PAD_X + Math.round((i / cols) * TABLE_W);
    lines += `<line x1="${x}" y1="${PAD_Y}" x2="${x}" y2="${PAD_Y + TABLE_H}" stroke="${PREVIEW_STROKE}" stroke-width="1.5"/>`;
  }

  for (let i = 1; i < rows; i++) {
    const y = PAD_Y + Math.round((i / rows) * TABLE_H);
    lines += `<line x1="${PAD_X}" y1="${y}" x2="${PAD_X + TABLE_W}" y2="${y}" stroke="${PREVIEW_STROKE}" stroke-width="1.5"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}"><rect x="${PAD_X + 0.5}" y="${PAD_Y + 0.5}" width="${TABLE_W - 1}" height="${TABLE_H - 1}" fill="none" stroke="${PREVIEW_STROKE}" stroke-width="1.5" rx="2"/>${lines}</svg>`;
}

const TABLE_PRESETS: TablePreset[] = [
  { id: "table-2x2", rows: 2, cols: 2 },
  { id: "table-3x3", rows: 3, cols: 3 },
  { id: "table-4x3", rows: 4, cols: 3 },
  { id: "table-3x4", rows: 3, cols: 4 },
  { id: "table-4x4", rows: 4, cols: 4 },
  { id: "table-5x3", rows: 5, cols: 3 },
];

interface TablesSectionProps {
  store: StoreType;
}

const TablesSection: FC<TablesSectionProps> = ({ store }) => {
  const { t } = useTranslation();
  const images: UploadListImage[] = useMemo(
    () =>
      TABLE_PRESETS.map((preset) => ({
        id: preset.id,
        src: svgToURL(generateTablePreviewSvg(preset.rows, preset.cols)),
        elementProps: { rows: preset.rows, cols: preset.cols },
      })),
    []
  );

  return (
    <div className="box-border flex w-full flex-shrink-0 flex-col gap-4 px-5">
      <SidePanelSectionLabel
        label={t("templatesEditor.side_panel.headers.tables") as string}
        type="sub-header"
      />
      <UploadList store={store} images={images} size="small" type="table" />
    </div>
  );
};

export default TablesSection;
