import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useState, useRef, useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { OptionItem } from "../../../../../components/OptionItem";

type VerticalAlign = "top" | "middle" | "bottom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const VALIGN_OPTIONS: {
  value: VerticalAlign;
  labelKey: string;
  iconName: string;
}[] = [
  {
    value: "top",
    labelKey: "templatesEditor.toolbar.top",
    iconName: "vertical_align_top",
  },
  {
    value: "middle",
    labelKey: "templatesEditor.toolbar.middle",
    iconName: "vertical_align_center",
  },
  {
    value: "bottom",
    labelKey: "templatesEditor.toolbar.bottom",
    iconName: "vertical_align_bottom",
  },
];

const VALIGN_ICON_MAP: Record<VerticalAlign, string> = {
  top: "vertical_align_top",
  middle: "vertical_align_center",
  bottom: "vertical_align_bottom",
};

const getTextElements = (elements: AnyElement[]): AnyElement[] =>
  elements.filter((el: AnyElement) => el.type === "text");

const getCurrentVerticalAlign = (textElements: AnyElement[]): VerticalAlign => {
  if (textElements.length === 0) return "top";

  const aligns = new Set(
    textElements.map(
      (el: AnyElement) => (el.verticalAlign as VerticalAlign) || "top"
    )
  );
  if (aligns.size > 1) return "top";

  return [...aligns][0];
};

interface VerticalAlignInstrumentProps {
  store: StoreType;
  elements?: AnyElement[];
}

export const VerticalAlignInstrument: FC<VerticalAlignInstrumentProps> =
  observer(({ store, elements: elementsProp }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const storeElements = store.selectedElements;
    const textElements =
      elementsProp ?? getTextElements(storeElements as unknown as AnyElement[]);
    const currentAlign = getCurrentVerticalAlign(textElements);

    const handleAlignChange = useCallback(
      (align: VerticalAlign) => {
        textElements.forEach((el: AnyElement) =>
          el.set({ verticalAlign: align })
        );
        setIsOpen(false);
      },
      [textElements]
    );

    const handleToggle = useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip
            content={t("templatesEditor.toolbar.vertical_align") as string}
          >
            <IconButton
              iconName={VALIGN_ICON_MAP[currentAlign]}
              onClick={handleToggle}
              active={isOpen}
            />
          </Tooltip>
        </span>
        <ToolbarPopover
          label={t("templatesEditor.toolbar.vertical_align") as string}
          isOpen={isOpen}
          onClose={handleClose}
          anchorRef={anchorRef}
        >
          <div className="flex items-start gap-[15px]">
            {VALIGN_OPTIONS.map((option) => (
              <OptionItem
                key={option.value}
                iconName={option.iconName}
                label={t(option.labelKey) as string}
                onClick={() => handleAlignChange(option.value)}
              />
            ))}
          </div>
        </ToolbarPopover>
      </>
    );
  });
