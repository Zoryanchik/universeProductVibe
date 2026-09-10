import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useState, useRef, useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { Tooltip, type TooltipPlacement } from "../../../../../ui/Tooltip";
import { IconButton } from "../../../../../ui/IconButton";
import { OptionItem } from "../../../../../components/OptionItem";
import { ToolbarPopover, PopoverLabel } from "../../../../../ui/ToolbarPopover";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface PositionInstrumentProps {
  store: StoreType;
  position?: TooltipPlacement;
}

type PositionAction =
  | "forward"
  | "toFront"
  | "backward"
  | "toBack"
  | "alignTop"
  | "alignDown"
  | "alignLeft"
  | "alignRight"
  | "alignMiddle"
  | "alignCentre";

export const PositionInstrument: FC<PositionInstrumentProps> = observer(
  ({ store, position }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [lastActive, setLastActive] = useState<PositionAction | null>(null);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const elements = store.selectedElements as unknown as AnyElement[];

    const isAtTop = elements.every((el: AnyElement) => {
      const parent = el.parent;

      return parent ? el.zIndex >= parent.children.length - 1 : false;
    });

    const isAtBottom = elements.every((el: AnyElement) => el.zIndex <= 0);

    const handleToggle = useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    const handleMoveForward = useCallback(() => {
      elements.forEach((el: AnyElement) => el.moveUp());
      setLastActive("forward");
    }, [elements]);

    const handleMoveToFront = useCallback(() => {
      elements.forEach((el: AnyElement) => el.moveTop());
      setLastActive("toFront");
    }, [elements]);

    const handleMoveBackward = useCallback(() => {
      elements.forEach((el: AnyElement) => el.moveDown());
      setLastActive("backward");
    }, [elements]);

    const handleMoveToBack = useCallback(() => {
      elements.forEach((el: AnyElement) => el.moveBottom());
      setLastActive("toBack");
    }, [elements]);

    const handleAlignTop = useCallback(() => {
      elements.forEach((el: AnyElement) => el.set({ y: 0 }));
      setLastActive("alignTop");
    }, [elements]);

    const handleAlignDown = useCallback(() => {
      const page = store.activePage;
      if (!page) return;

      elements.forEach((el: AnyElement) =>
        el.set({ y: page.computedHeight - el.height })
      );
      setLastActive("alignDown");
    }, [elements, store]);

    const handleAlignLeft = useCallback(() => {
      elements.forEach((el: AnyElement) => el.set({ x: 0 }));
      setLastActive("alignLeft");
    }, [elements]);

    const handleAlignRight = useCallback(() => {
      const page = store.activePage;
      if (!page) return;

      elements.forEach((el: AnyElement) =>
        el.set({ x: page.computedWidth - el.width })
      );
      setLastActive("alignRight");
    }, [elements, store]);

    const handleAlignMiddle = useCallback(() => {
      const page = store.activePage;
      if (!page) return;

      elements.forEach((el: AnyElement) =>
        el.set({ y: (page.computedHeight - el.height) / 2 })
      );
      setLastActive("alignMiddle");
    }, [elements, store]);

    const handleAlignCentre = useCallback(() => {
      const page = store.activePage;
      if (!page) return;

      elements.forEach((el: AnyElement) =>
        el.set({ x: (page.computedWidth - el.width) / 2 })
      );
      setLastActive("alignCentre");
    }, [elements, store]);

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip
            content={t("templatesEditor.toolbar.position") as string}
            placement={position}
          >
            <IconButton
              iconName="align_center"
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
          <div className="flex flex-col gap-4 p-[6px]">
            <div className="flex flex-col gap-1">
              <PopoverLabel>
                {t("templatesEditor.toolbar.layering")}
              </PopoverLabel>
              <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <OptionItem
                    iconName="expand_less"
                    label={t("templatesEditor.toolbar.forward") as string}
                    active={lastActive === "forward"}
                    disabled={isAtTop}
                    onClick={handleMoveForward}
                  />
                  <OptionItem
                    iconName="keyboard_double_arrow_up"
                    label={t("templatesEditor.toolbar.to_front") as string}
                    active={lastActive === "toFront"}
                    disabled={isAtTop}
                    onClick={handleMoveToFront}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <OptionItem
                    iconName="expand_more"
                    label={t("templatesEditor.toolbar.backward") as string}
                    active={lastActive === "backward"}
                    disabled={isAtBottom}
                    onClick={handleMoveBackward}
                  />
                  <OptionItem
                    iconName="keyboard_double_arrow_down"
                    label={t("templatesEditor.toolbar.to_back") as string}
                    active={lastActive === "toBack"}
                    disabled={isAtBottom}
                    onClick={handleMoveToBack}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <PopoverLabel>
                {t("templatesEditor.toolbar.position")}
              </PopoverLabel>
              <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <OptionItem
                    iconName="align_vertical_top"
                    label={t("templatesEditor.toolbar.align_top") as string}
                    active={lastActive === "alignTop"}
                    onClick={handleAlignTop}
                  />
                  <OptionItem
                    iconName="align_horizontal_left"
                    label={t("templatesEditor.toolbar.align_left") as string}
                    active={lastActive === "alignLeft"}
                    onClick={handleAlignLeft}
                  />
                  <OptionItem
                    iconName="align_vertical_center"
                    label={t("templatesEditor.toolbar.align_middle") as string}
                    active={lastActive === "alignMiddle"}
                    onClick={handleAlignMiddle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <OptionItem
                    iconName="align_vertical_bottom"
                    label={t("templatesEditor.toolbar.align_down") as string}
                    active={lastActive === "alignDown"}
                    onClick={handleAlignDown}
                  />
                  <OptionItem
                    iconName="align_horizontal_right"
                    label={t("templatesEditor.toolbar.align_right") as string}
                    active={lastActive === "alignRight"}
                    onClick={handleAlignRight}
                  />
                  <OptionItem
                    iconName="align_horizontal_center"
                    label={t("templatesEditor.toolbar.align_centre") as string}
                    active={lastActive === "alignCentre"}
                    onClick={handleAlignCentre}
                  />
                </div>
              </div>
            </div>
          </div>
        </ToolbarPopover>
      </>
    );
  }
);
