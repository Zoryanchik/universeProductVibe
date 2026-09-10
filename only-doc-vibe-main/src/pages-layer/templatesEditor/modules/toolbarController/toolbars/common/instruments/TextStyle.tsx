import { useState, useRef, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import ActionButtons from "../../../../../ui/ActionButtons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const getTextElements = (elements: AnyElement[]): AnyElement[] =>
  elements.filter((el: AnyElement) => el.type === "text");

const isBold = (el: AnyElement): boolean => {
  const w = el.fontWeight as string;

  return w === "bold" || Number(w) >= 700;
};

const isItalic = (el: AnyElement): boolean => el.fontStyle === "italic";

const hasDecoration = (el: AnyElement, token: string): boolean =>
  ((el.textDecoration as string) ?? "").includes(token);

const toggleDecoration = (current: string, token: string): string => {
  const parts = current.split(" ").filter(Boolean);
  const idx = parts.indexOf(token);
  if (idx >= 0) parts.splice(idx, 1);
  else parts.push(token);

  return parts.join(" ");
};

const allMatch = (
  textElements: AnyElement[],
  predicate: (el: AnyElement) => boolean
): boolean => textElements.length > 0 && textElements.every(predicate);

interface TextStyleInstrumentProps {
  store: StoreType;
  elements?: AnyElement[];
}

export const TextStyleInstrument: FC<TextStyleInstrumentProps> = observer(
  ({ store, elements: elementsProp }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const storeElements = store.selectedElements;
    const textElements =
      elementsProp ?? getTextElements(storeElements as unknown as AnyElement[]);

    const boldActive = allMatch(textElements, isBold);
    const italicActive = allMatch(textElements, isItalic);
    const underlineActive = allMatch(textElements, (el) =>
      hasDecoration(el, "underline")
    );
    const strikethroughActive = allMatch(textElements, (el) =>
      hasDecoration(el, "line-through")
    );

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    const toggleBold = useCallback(() => {
      const next = boldActive ? "normal" : "bold";
      textElements.forEach((el: AnyElement) => el.set({ fontWeight: next }));
    }, [textElements, boldActive]);

    const toggleItalic = useCallback(() => {
      const next = italicActive ? "normal" : "italic";
      textElements.forEach((el: AnyElement) => el.set({ fontStyle: next }));
    }, [textElements, italicActive]);

    const toggleUnderline = useCallback(() => {
      textElements.forEach((el: AnyElement) =>
        el.set({
          textDecoration: toggleDecoration(
            (el.textDecoration as string) ?? "",
            "underline"
          ),
        })
      );
    }, [textElements]);

    const toggleStrikethrough = useCallback(() => {
      textElements.forEach((el: AnyElement) =>
        el.set({
          textDecoration: toggleDecoration(
            (el.textDecoration as string) ?? "",
            "line-through"
          ),
        })
      );
    }, [textElements]);

    const actions = [
      {
        iconName: "format_bold",
        onClick: toggleBold,
        active: boldActive,
        hint: t("templatesEditor.toolbar.bold") as string,
      },
      {
        iconName: "format_italic",
        onClick: toggleItalic,
        active: italicActive,
        hint: t("templatesEditor.toolbar.italic") as string,
      },
      {
        iconName: "format_underlined",
        onClick: toggleUnderline,
        active: underlineActive,
        hint: t("templatesEditor.toolbar.underline") as string,
      },
      {
        iconName: "strikethrough_s",
        onClick: toggleStrikethrough,
        active: strikethroughActive,
        hint: t("templatesEditor.toolbar.strikethrough") as string,
      },
    ];

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip content={t("templatesEditor.toolbar.text_style") as string}>
            <IconButton
              iconName="format_bold"
              onClick={handleToggle}
              active={isOpen}
            />
          </Tooltip>
        </span>
        <ToolbarPopover
          isOpen={isOpen}
          onClose={handleClose}
          anchorRef={anchorRef}
        >
          <ActionButtons actions={actions} />
        </ToolbarPopover>
      </>
    );
  }
);
