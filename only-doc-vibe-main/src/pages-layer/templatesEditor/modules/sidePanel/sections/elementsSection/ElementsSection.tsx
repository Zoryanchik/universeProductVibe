import { useCallback, useEffect, useMemo, useRef, type FC } from "react";
import { observer } from "mobx-react-lite";
import throttle from "lodash/throttle";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../ui/SidePanelSectionLabel";
import { CustomScrollArea } from "../../../../ui/CustomScrollArea";
import { useTemplatesEditorStore } from "../../../../model/store/templates-editor-store";
import TablesSection from "./sections/Tables";
import LinesSection from "./sections/Lines";
import ShapesSection from "./sections/Shapes";
import SearchSection from "./sections/search/Search";
import IconsSection from "./sections/Icons";
import { ShapesEffectsPanel } from "./sections/ShapesEffects";

interface ElementsSectionPanelProps {
  store: StoreType;
}

const SCROLL_END_THRESHOLD_PX = 50;

export const ElementsSectionPanel: FC<ElementsSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const isMaskMode = useTemplatesEditorStore.use.maskImageMode();
    const isEffectsMode = useTemplatesEditorStore.use.effectsMode();
    const iconsMeta = useTemplatesEditorStore.use.nounProjectIconsMeta();
    const setMaskImageMode = useTemplatesEditorStore.use.setMaskImageMode();
    const fetchNounProjectIcons =
      useTemplatesEditorStore.use.fetchNounProjectIcons();

    const isSearchActive = Boolean(iconsMeta?.query);

    const viewportRef = useRef<HTMLDivElement | null>(null);
    const isLoadingMoreRef = useRef(false);

    const handleCloseMask = useCallback(() => {
      setMaskImageMode(false);
    }, [setMaskImageMode]);

    const handleScrollEnd = useCallback(() => {
      if (!iconsMeta || !iconsMeta.query) return;

      if (iconsMeta.page >= iconsMeta.totalPages) return;

      if (isLoadingMoreRef.current) return;

      isLoadingMoreRef.current = true;
      fetchNounProjectIcons(
        { query: iconsMeta.query, page: iconsMeta.page + 1, append: true },
        () => {
          isLoadingMoreRef.current = false;
        },
        () => {
          isLoadingMoreRef.current = false;
        }
      );
    }, [iconsMeta, fetchNounProjectIcons]);

    const handleScrollEndRef = useRef(handleScrollEnd);
    handleScrollEndRef.current = handleScrollEnd;

    const handleScrollThrottled = useMemo(
      () =>
        throttle(() => {
          const el = viewportRef.current;
          if (!el) return;

          const reachedEnd =
            el.scrollTop + el.clientHeight >=
            el.scrollHeight - SCROLL_END_THRESHOLD_PX;
          if (reachedEnd) {
            handleScrollEndRef.current();
          }
        }, 200),
      []
    );

    useEffect(
      () => () => handleScrollThrottled.cancel(),
      [handleScrollThrottled]
    );

    const searchQuery = iconsMeta?.query ?? "";
    useEffect(() => {
      viewportRef.current?.scrollTo({ top: 0 });
    }, [searchQuery]);

    if (isEffectsMode) {
      return <ShapesEffectsPanel store={store} />;
    }

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="flex flex-shrink-0 flex-col gap-4 px-5 pt-5 pb-4">
          <div className="mb-2 flex w-full items-center justify-between">
            <SidePanelSectionLabel
              label={
                (isMaskMode
                  ? t("templatesEditor.side_panel.headers.mask_image")
                  : t(
                      "templatesEditor.side_panel.headers.add_elements"
                    )) as string
              }
              type="header"
            />
            {isMaskMode && (
              <button
                type="button"
                onClick={handleCloseMask}
                className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[var(--color-action-main,black)]"
              >
                <span className="material-symbols-rounded text-2xl">close</span>
              </button>
            )}
          </div>
          {!isMaskMode && <SearchSection />}
        </div>
        <CustomScrollArea
          viewportRef={viewportRef}
          onScroll={!isMaskMode ? handleScrollThrottled : undefined}
          className="min-h-0 flex-1"
        >
          <div className="flex flex-col gap-6">
            {!isMaskMode && <IconsSection store={store} />}
            {!isMaskMode && !isSearchActive && <TablesSection store={store} />}
            {!isMaskMode && !isSearchActive && <LinesSection store={store} />}
            {!isSearchActive && <ShapesSection store={store} />}
          </div>
        </CustomScrollArea>
      </div>
    );
  }
);
