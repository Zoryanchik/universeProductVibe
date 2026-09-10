import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useEffect, useCallback, useMemo, type FC } from "react";
import { useSvgColors } from "polotno/utils/svg";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";
import { isMobileDevice } from "@/shared/lib/device/is-mobile";

import { Slider } from "../../../ui/Slider";
import AdvancedColors from "../../../components/AdvancedColors";
import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";
import { useAddElements } from "../../../helpers/addElements";
import { useLockElements } from "../../../helpers/lockElements";
import { findColorKey, resolveColor } from "../../../helpers/colors";
import { HorizontalTabs } from "../../../ui/HorizontalTabs";

interface DrawSectionPanelProps {
  store: StoreType;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SvgElement = any;

type DrawTool = "pencil" | "highlighter" | "selection";

const TOOLS: { id: DrawTool; icon: string; labelKey: string }[] = [
  {
    id: "pencil",
    icon: "stylus_pen",
    labelKey: "templatesEditor.side_panel.draw_tools.pencil",
  },
  {
    id: "highlighter",
    icon: "stylus_highlighter",
    labelKey: "templatesEditor.side_panel.draw_tools.highlighter",
  },
  {
    id: "selection",
    icon: "ads_click",
    labelKey: "templatesEditor.side_panel.draw_tools.selection",
  },
];

export const DrawSectionPanel: FC<DrawSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const tools = useMemo(
      () =>
        TOOLS.map((tool) => ({
          id: tool.id,
          icon: tool.icon,
          label: t(tool.labelKey) as string,
        })),
      [t]
    );
    const { brushType, strokeWidth, stroke, opacity } = store.toolOptions;
    const isSelectionMode = store.tool === "selection";

    const selectedElements = store.selectedElements;
    const selectedSvgElement: SvgElement =
      isSelectionMode &&
      selectedElements.length === 1 &&
      selectedElements[0].type === "svg"
        ? selectedElements[0]
        : null;

    const svgColors = useSvgColors(selectedSvgElement?.src || "");
    const firstSvgColor = svgColors.length > 0 ? svgColors[0] : null;
    const hasSvgColors = !!(selectedSvgElement && firstSvgColor);

    const { withLockedPageGuard } = useAddElements({ store, type: "svg" });
    const { checkIsLockedPage, isLocked } = useLockElements({ store });
    const isPageLocked = checkIsLockedPage();

    const isContentDisabled =
      (isSelectionMode && !selectedSvgElement) || isLocked;

    useEffect(() => {
      if (isPageLocked && store.tool === "draw") {
        store.setTool("selection");
      }
    }, [isPageLocked, store]);

    const getActiveTool = (): DrawTool => {
      if (isSelectionMode) return "selection";

      if (brushType === "highlighter") return "highlighter";

      return "pencil";
    };
    const activeTool = getActiveTool();
    const activeToolLabel = tools.find((tool) => tool.id === activeTool)?.label;

    useEffect(() => {
      // On mobile the draw tool lifecycle is owned by `useMobileDrawMode`; the
      // panel here is just the "how to draw" config inside the tool sheet.
      if (isMobileDevice()) return;

      if (checkIsLockedPage()) {
        store.setTool("selection");
      } else {
        store.selectElements([]);
        store.setTool("draw");
        store.setToolOptions({
          brushType: "brush",
          opacity: 1,
          strokeWidth: store.toolOptions.strokeWidth || 5,
        });
      }

      return () => {
        store.setTool("selection");
      };
    }, [store, checkIsLockedPage]);

    const handleToolChange = useCallback(
      (toolLabel: string) => {
        const tool = tools.find((tool) => tool.label === toolLabel)?.id;
        if (tool === "selection") {
          store.setTool("selection");
        } else {
          const trySetDraw = withLockedPageGuard(() => {
            store.selectElements([]);
            store.setTool("draw");
            store.setToolOptions({
              brushType: tool === "highlighter" ? "highlighter" : "brush",
              opacity: tool === "highlighter" ? 0.5 : 1,
              strokeWidth: tool === "highlighter" ? 30 : strokeWidth || 5,
            });
          });

          trySetDraw();
        }
      },
      [store, strokeWidth, withLockedPageGuard, tools]
    );

    const handleStrokeWidthChange = useCallback(
      (value: number) => {
        store.setToolOptions({ strokeWidth: value });
      },
      [store]
    );

    const handleOpacityChange = useCallback(
      (value: number) => {
        if (selectedSvgElement) {
          selectedSvgElement.set({ opacity: value / 100 });
        } else {
          store.setToolOptions({ opacity: value / 100 });
        }
      },
      [store, selectedSvgElement]
    );

    const handleColorSelect = useCallback(
      (color: string) => {
        if (hasSvgColors) {
          const colorKey = findColorKey(
            selectedSvgElement.colorsReplace,
            firstSvgColor!
          );
          selectedSvgElement.replaceColor(colorKey, color);
        } else {
          store.setToolOptions({ stroke: color });
        }
      },
      [store, selectedSvgElement, firstSvgColor, hasSvgColors]
    );

    const opacityValue = selectedSvgElement
      ? Math.round(selectedSvgElement.opacity * 100)
      : Math.round(opacity * 100);

    const pickerInitialValue = hasSvgColors
      ? resolveColor(selectedSvgElement.colorsReplace, firstSvgColor!)
      : stroke;

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-4 px-5 pt-5">
        <SidePanelSectionLabel
          label={t("templatesEditor.side_panel.headers.add_sketch") as string}
          type="header"
        />
        <div className="flex w-full flex-col gap-3">
          <SidePanelSectionLabel
            label={t("templatesEditor.side_panel.headers.tools") as string}
            type="header"
          />
          <HorizontalTabs
            activeTab={activeToolLabel}
            onClick={handleToolChange}
            tabs={tools}
          />
        </div>
        <div
          className={cn(
            "flex w-full flex-col gap-4",
            isContentDisabled &&
              "cursor-not-allowed opacity-50 [&>*]:pointer-events-none"
          )}
        >
          <div className="flex w-full flex-col gap-3">
            {!isSelectionMode && (
              <Slider
                label={
                  t(
                    "templatesEditor.side_panel.controls.stroke_width"
                  ) as string
                }
                value={strokeWidth}
                min={1}
                max={50}
                onChange={handleStrokeWidthChange}
              />
            )}
            <Slider
              label={t("templatesEditor.toolbar.opacity") as string}
              value={opacityValue}
              min={0}
              max={100}
              onChange={handleOpacityChange}
            />
          </div>
          <AdvancedColors
            store={store}
            mode="plain"
            onSelectColor={handleColorSelect}
            pickerInitialValue={pickerInitialValue}
            activeColor={pickerInitialValue}
          />
        </div>
      </div>
    );
  }
);
