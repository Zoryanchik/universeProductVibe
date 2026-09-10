import React from "react";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { useEditorActions } from "@/features/editor/@x/editor-material";
import { ToolModal } from "@/features/editorTools/@x/editor-material";

import {
  DEFAULT_MATERIAL_LINE_STYLE,
  DEFAULT_MATERIAL_SHAPE_STYLE,
} from "../model/constants";
import { MATERIAL_LINE_LIBS } from "../model/materialLines";
import type { MaterialLineItem } from "../model/materialLines";
import { MATERIAL_SHAPE_LIBS } from "../model/materialShapes";
import type { MaterialPathItem } from "../model/materialShapes";
import { MaterialShapeButton } from "./MaterialShapeButton";

interface MaterialPanelProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const SectionHeader: React.FC<{ readonly title: string }> = ({ title }) => (
  <div className="mb-2 flex items-stretch overflow-hidden rounded-sm border border-white/5 bg-[#2A2D33]">
    <span className="w-1 shrink-0 bg-[#3B82F6]" />
    <span className="px-3 py-1.5 text-xs font-medium text-white/70">
      {title}
    </span>
  </div>
);

export const MaterialPanel: React.FC<MaterialPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const actions = useEditorActions();

  const insertLine = (item: MaterialLineItem) => {
    actions.addMaterialLine({
      ...DEFAULT_MATERIAL_LINE_STYLE,
      points: item.data.map((point) => ({ x: point.x, y: point.y })),
      startStyle: item.points[0],
      endStyle: item.points[1],
      style: item.style,
      isBroken: item.isBroken,
      isCurve: item.isCurve,
      isCubic: item.isCubic,
    });
    onClose();
  };

  const insertShape = (item: MaterialPathItem) => {
    actions.addMaterialShape(item.path, {
      ...DEFAULT_MATERIAL_SHAPE_STYLE,
      viewBox: item.viewBox,
      pathFormula: item.pathFormula,
      special: item.special,
      outlined: item.outlined,
      fill: item.outlined ? "" : DEFAULT_MATERIAL_SHAPE_STYLE.fill,
      strokeWidth:
        item.strokeWidth ??
        (item.outlined ? 2 : DEFAULT_MATERIAL_SHAPE_STYLE.strokeWidth),
    });
    onClose();
  };

  return (
    <ToolModal
      isOpen={isOpen}
      title={String(t("editor_page.material_panel.title"))}
      onClose={onClose}
      width={560}
    >
      <div className="max-h-[min(70vh,640px)] overflow-y-auto pe-1">
        {MATERIAL_LINE_LIBS.map((section) => (
          <section key={section.type} className="mb-5">
            <SectionHeader title={section.type} />
            <div className="grid grid-cols-5 gap-1 px-1">
              {section.children.map((item, index) => (
                <MaterialShapeButton
                  key={`${section.type}-${index}`}
                  path={item.path}
                  viewBox={[20, 20]}
                  title={`${section.type} ${index + 1}`}
                  onSelect={() => insertLine(item)}
                />
              ))}
            </div>
          </section>
        ))}

        {MATERIAL_SHAPE_LIBS.map((section) => (
          <section key={section.type} className="mb-5">
            <SectionHeader title={section.type} />
            <div className="grid grid-cols-5 gap-1 px-1">
              {section.children.map((item, index) => (
                <MaterialShapeButton
                  key={`${section.type}-${index}`}
                  path={item.path}
                  viewBox={item.viewBox}
                  strokeWidth={
                    item.strokeWidth ??
                    (item.outlined
                      ? 2
                      : DEFAULT_MATERIAL_SHAPE_STYLE.strokeWidth)
                  }
                  title={item.label ?? `${section.type} ${index + 1}`}
                  onSelect={() => insertShape(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </ToolModal>
  );
};
