import { useState, useRef, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { OptionItem } from "../../../../../components/OptionItem";

type TextAlign = "left" | "center" | "right";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const ALIGN_OPTIONS: {
  value: TextAlign;
  labelKey: string;
  iconName: string;
}[] = [
  {
    value: "left",
    labelKey: "templatesEditor.toolbar.left",
    iconName: "format_align_left",
  },
  {
    value: "center",
    labelKey: "templatesEditor.toolbar.center",
    iconName: "format_align_center",
  },
  {
    value: "right",
    labelKey: "templatesEditor.toolbar.right",
    iconName: "format_align_right",
  },
];

const ALIGN_ICON_MAP: Record<TextAlign, string> = {
  left: "format_align_left",
  center: "format_align_center",
  right: "format_align_right",
};

const getTextElements = (elements: AnyElement[]): AnyElement[] =>
  elements.filter((el: AnyElement) => el.type === "text");

const getCurrentAlign = (textElements: AnyElement[]): TextAlign => {
  if (textElements.length === 0) return "left";

  const aligns = new Set(
    textElements.map((el: AnyElement) => (el.align as TextAlign) || "left")
  );
  if (aligns.size > 1) return "left";

  return [...aligns][0];
};

interface TextAlignInstrumentProps {
  store: StoreType;
  elements?: AnyElement[];
}

export const TextAlignInstrument: FC<TextAlignInstrumentProps> = observer(
  ({ store, elements: elementsProp }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const storeElements = store.selectedElements;
    const textElements =
      elementsProp ?? getTextElements(storeElements as unknown as AnyElement[]);
    const currentAlign = getCurrentAlign(textElements);

    const handleAlignChange = useCallback(
      (align: TextAlign) => {
        textElements.forEach((el: AnyElement) => el.set({ align }));
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
          <Tooltip content={t("templatesEditor.toolbar.text_align") as string}>
            <IconButton
              iconName={ALIGN_ICON_MAP[currentAlign]}
              onClick={handleToggle}
              active={isOpen}
            />
          </Tooltip>
        </span>
        <ToolbarPopover
          label={t("templatesEditor.toolbar.text_align") as string}
          isOpen={isOpen}
          onClose={handleClose}
          anchorRef={anchorRef}
        >
          <div className="flex items-start gap-[15px]">
            {ALIGN_OPTIONS.map((option) => (
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
  }
);
