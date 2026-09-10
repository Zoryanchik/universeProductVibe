import React, { useEffect, useRef } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { EDITOR_FOCUS_ELEMENT_PANEL_EVENT, useEditor } from "@/features/editor";

import { ElementPropertiesPanel } from "./ElementPropertiesPanel";
import { PageDimensionsPanel } from "./PageDimensionsPanel";

export const EditorRightRail: React.FC = () => {
  const { t } = useTranslation();
  const { selectedElement, isDocumentLoaded } = useEditor();
  const isRailDisabled = !isDocumentLoaded;
  const elementSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToElementSection = () => {
      elementSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    window.addEventListener(
      EDITOR_FOCUS_ELEMENT_PANEL_EVENT,
      scrollToElementSection
    );

    return () => {
      window.removeEventListener(
        EDITOR_FOCUS_ELEMENT_PANEL_EVENT,
        scrollToElementSection
      );
    };
  }, []);

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col bg-[#1F2125] text-white/70">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section
          aria-disabled={isRailDisabled}
          className={cn(
            "space-y-4",
            isRailDisabled && "pointer-events-none opacity-40"
          )}
        >
          <div>
            <h2 className="text-sm font-semibold text-white">
              {String(t("editor_page.right_rail.document_settings"))}
            </h2>
            <p className="mt-1 text-xs text-white/45">
              {String(t("editor_page.right_rail.page_size_hint"))}
            </p>
          </div>

          <PageDimensionsPanel />
        </section>

        <section
          ref={elementSectionRef}
          aria-disabled={isRailDisabled}
          className={cn(
            "mt-8 space-y-4 border-t border-white/5 pt-8",
            isRailDisabled && "pointer-events-none opacity-40"
          )}
        >
          <div>
            <h2 className="text-sm font-semibold text-white">
              {String(t("editor_page.right_rail.element_properties"))}
            </h2>
            <p className="mt-1 text-xs text-white/45">
              {String(t("editor_page.right_rail.select_element_hint"))}
            </p>
          </div>

          {!selectedElement ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/50">
              {String(t("editor_page.right_rail.no_element_selected"))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-sm font-medium text-white">
                  {selectedElement.label}
                </div>
                <div className="mt-1 text-xs text-white/45">
                  {selectedElement.width} × {selectedElement.height}px
                </div>
              </div>

              <ElementPropertiesPanel element={selectedElement} />
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};
