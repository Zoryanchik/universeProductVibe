import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, useMemo, useState, type DragEvent, type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../ui/IconButton";
import { useLockElements } from "../../../helpers/lockElements";
import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";
import { Tooltip } from "../../../ui/Tooltip";
import { useDeleteElements } from "../../../helpers/deleteElements";
import { useScrollToElement } from "../../../helpers/scrollToElement";
import { CustomScrollArea } from "../../../ui/CustomScrollArea";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const ELEMENT_TYPE_LABEL_KEYS: Record<string, string> = {
  text: "templatesEditor.side_panel.layers.types.text",
  image: "templatesEditor.side_panel.layers.types.image",
  figure: "templatesEditor.side_panel.layers.types.figure",
  svg: "templatesEditor.side_panel.layers.types.figure",
  line: "templatesEditor.side_panel.layers.types.figure",
  table: "templatesEditor.side_panel.layers.types.table",
  group: "templatesEditor.side_panel.layers.types.group",
};

const getElementTypeLabelKey = (type: string): string =>
  ELEMENT_TYPE_LABEL_KEYS[type] ??
  "templatesEditor.side_panel.layers.types.element";

interface LayersSectionPanelProps {
  store: StoreType;
}

export const LayersSectionPanel: FC<LayersSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const page = store.activePage;
    const elements: AnyElement[] = useMemo(
      () => page?.children ?? [],
      [page?.children]
    );
    const selectedIds = store.selectedElements.map((el: AnyElement) => el.id);
    const { handleLock } = useLockElements({ store });
    const { handleDelete } = useDeleteElements({ store });
    const { handleScrollToElement } = useScrollToElement({ store });

    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{
      id: string;
      position: "above" | "below";
    } | null>(null);

    const handleVisibilityToggle = useCallback(
      (element: AnyElement) => {
        store.history.transaction(() => {
          element.set({ visible: !element.visible });
        });
      },
      [store]
    );

    const handleElementSelect = useCallback(
      (element: AnyElement) => {
        store.selectElements([element.id]);
        handleScrollToElement(element);
      },
      [store, handleScrollToElement]
    );

    const handleElementLock = useCallback(
      (element: AnyElement) => {
        handleLock([element]);
      },
      [handleLock]
    );

    const handleElementDelete = useCallback(
      (element: AnyElement) => {
        handleDelete([element]);
      },
      [handleDelete]
    );

    const displayElements = [...elements].reverse();

    const handleDragStart = useCallback(
      (e: DragEvent<HTMLDivElement>, elementId: string) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-no-drag]")) {
          e.preventDefault();

          return;
        }

        setDraggedId(elementId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", elementId);
      },
      []
    );

    const handleDragOver = useCallback(
      (e: DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (targetId === draggedId) {
          setDropTarget(null);

          return;
        }

        e.dataTransfer.dropEffect = "move";
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? "above" : "below";
        setDropTarget({ id: targetId, position });
      },
      [draggedId]
    );

    const handleDragLeave = useCallback(() => {
      setDropTarget(null);
    }, []);

    const handleDrop = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!draggedId || !dropTarget || !page) return;

        const draggedElement = elements.find(
          (el: AnyElement) => el.id === draggedId
        );
        if (!draggedElement) return;

        const fromChildIndex = elements.indexOf(draggedElement);
        const targetElement = elements.find(
          (el: AnyElement) => el.id === dropTarget.id
        );
        if (!targetElement) return;

        const targetChildIndex = elements.indexOf(targetElement);

        // Display is reversed: "above" in UI = higher z-index = higher children index
        // "below" in UI = lower z-index = lower children index
        let toChildIndex: number;
        if (dropTarget.position === "above") {
          toChildIndex =
            targetChildIndex < fromChildIndex
              ? targetChildIndex + 1
              : targetChildIndex;
        } else {
          toChildIndex =
            targetChildIndex > fromChildIndex
              ? targetChildIndex - 1
              : targetChildIndex;
        }

        if (fromChildIndex === toChildIndex) {
          setDraggedId(null);
          setDropTarget(null);

          return;
        }

        store.history.transaction(() => {
          const diff = toChildIndex - fromChildIndex;
          if (diff > 0) {
            for (let i = 0; i < diff; i++) draggedElement.moveUp();
          } else {
            for (let i = 0; i < Math.abs(diff); i++) draggedElement.moveDown();
          }
        });

        setDraggedId(null);
        setDropTarget(null);
      },
      [draggedId, dropTarget, page, elements, store]
    );

    const handleDragEnd = useCallback(() => {
      setDraggedId(null);
      setDropTarget(null);
    }, []);

    return (
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="sticky start-0 end-0 top-0 z-[1] flex items-center justify-center bg-[var(--color-bg-white-bg)] px-5 pt-5 pb-4 shadow-[0_4px_12px_0_rgba(0,0,0,0.04)] backdrop-blur-[4px]">
          <SidePanelSectionLabel
            label={
              t("templatesEditor.side_panel.headers.elements_on_page") as string
            }
            type="header"
          />
        </div>

        <CustomScrollArea className="w-full flex-1">
          <div className="box-border flex flex-col gap-1 px-[10px] pb-4">
            {displayElements.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-4 [font-family:'Outfit',sans-serif] text-base text-[var(--color-text-secondary)]">
                {t("templatesEditor.side_panel.layers.no_elements")}
              </div>
            ) : (
              displayElements.map((element: AnyElement) => {
                const isSelected = selectedIds.includes(element.id);
                const isLocked = element.locked;
                const isVisible = element.visible !== false;
                const dragOverPosition =
                  dropTarget !== null && dropTarget.id === element.id
                    ? dropTarget.position
                    : undefined;

                return (
                  <div
                    key={element.id}
                    draggable
                    onClick={() => handleElementSelect(element)}
                    onDragStart={(e) => handleDragStart(e, element.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, element.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative box-border flex h-[60px] min-h-[56px] w-full flex-shrink-0 cursor-grab items-center justify-between rounded-[12px] bg-white p-3 transition-[background] duration-150 hover:bg-[var(--color-primary-opacity-12)] active:cursor-grabbing",
                      isSelected && "bg-[var(--color-primary-opacity-12)]",
                      dragOverPosition === "above" &&
                        "before:absolute before:start-3 before:end-3 before:-top-0.5 before:h-0.5 before:rounded-[1px] before:bg-[var(--color-primary)] before:content-['']",
                      dragOverPosition === "below" &&
                        "after:absolute after:start-3 after:end-3 after:-bottom-0.5 after:h-0.5 after:rounded-[1px] after:bg-[var(--color-primary)] after:content-['']"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                      <div className="flex items-center gap-[10px]">
                        <span className="material-symbols-rounded flex items-center justify-center text-[32px] text-[rgba(0,0,0,0.48)]">
                          drag_indicator
                        </span>
                        <span className="overflow-hidden [font-family:'Outfit',sans-serif] text-base leading-[22px] font-normal text-ellipsis whitespace-nowrap text-[var(--color-text-primary)]">
                          {t(getElementTypeLabelKey(element.type))}
                        </span>
                      </div>
                      <span className="overflow-hidden ps-2 [font-family:'Outfit',sans-serif] text-base leading-[22px] font-normal text-ellipsis whitespace-nowrap text-[var(--color-text-secondary)]">
                        {element.name || element.type}
                      </span>
                    </div>

                    <div
                      data-no-drag
                      className="flex flex-shrink-0 cursor-pointer items-center gap-2"
                    >
                      <Tooltip
                        content={
                          (isVisible
                            ? t(
                                "templatesEditor.side_panel.layers.hide_element"
                              )
                            : t(
                                "templatesEditor.side_panel.layers.show_element"
                              )) as string
                        }
                        placement="top"
                      >
                        <IconButton
                          iconName={isVisible ? "visibility" : "visibility_off"}
                          active={!isVisible}
                          onClick={() => handleVisibilityToggle(element)}
                        />
                      </Tooltip>
                      <Tooltip
                        content={
                          (isLocked
                            ? t(
                                "templatesEditor.side_panel.layers.unlock_element"
                              )
                            : t(
                                "templatesEditor.side_panel.layers.lock_element"
                              )) as string
                        }
                        placement="top"
                      >
                        <IconButton
                          iconName={isLocked ? "lock" : "lock_open"}
                          active={isLocked}
                          onClick={() => handleElementLock(element)}
                        />
                      </Tooltip>
                      <Tooltip
                        content={
                          t(
                            "templatesEditor.side_panel.layers.delete_element"
                          ) as string
                        }
                        placement="top"
                      >
                        <IconButton
                          iconName="delete_forever"
                          disabled={isLocked}
                          onClick={() => handleElementDelete(element)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CustomScrollArea>
      </div>
    );
  }
);
