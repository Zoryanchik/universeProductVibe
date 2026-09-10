"use client";

import "eyedropper-polyfill";
import { autorun, reaction } from "mobx";
import queryString from "query-string";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Workspace } from "polotno/canvas/workspace";
import "material-symbols/rounded.css";
import { createStore } from "polotno/model/store";
import { setTransformerStyle, setHighlighterStyle } from "polotno/config";
import { PUBLIC_POLOTNO_API_KEY } from "astro:env/client";

import { cn } from "@/shared/lib/utils/cn";
import { isMobileDevice } from "@/shared/lib/device/is-mobile";

import { PagesPanel } from "../components/PagesPanel";
import { EditorHeader } from "../modules/EditorHeader";
import { EditorSidePanel } from "../modules/sidePanel/SidePanel";
import { ToolbarController } from "../modules/toolbarController/ToolbarController";
import { ZoomButtons } from "../components/ZoomButtons";
import { PageNavigation } from "../components/PageNavigation";
import { PagesButton } from "../components/PagesButton";
import { PageToolbar } from "../components/PageToolbar";
import { ContextualTooltip } from "../components/ContextualTooltip";
import { Toast } from "./Toast";
import { Loader } from "./Loader";
import {
  SELECTION_BORDER_COLOR,
  SELECTION_ANCHOR_FILL,
} from "../constants/colors";
import { defaultTemplate } from "../templates/defaultTemplate";
import { useTemplatesEditorStore } from "../model/store/templates-editor-store";
import { useLoadTemplate } from "../helpers/loadTemplate";
import { ensureGoogleFonts } from "../helpers/ensureGoogleFonts";
import { applyInitialScale } from "../helpers/applyInitialScale";
import { MobileEditorLayout } from "../mobile/MobileEditorLayout";

const IS_LOCAL = import.meta.env.DEV;

const beforeUnloadCallback = (e: BeforeUnloadEvent): string => {
  e.preventDefault();
  e.returnValue = "";

  return "";
};

const store = createStore({
  key: PUBLIC_POLOTNO_API_KEY ?? "",
  showCredit: false,
});

if (IS_LOCAL) {
  store.loadJSON(defaultTemplate);
  ensureGoogleFonts(store);
}

const ROTATE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="white"/><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" fill="black"/></svg>`;
const rotateIconImage = new window.Image();
rotateIconImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  ROTATE_ICON_SVG
)}`;

setTransformerStyle({
  borderStroke: SELECTION_BORDER_COLOR,
  borderStrokeWidth: 1,
  anchorStroke: SELECTION_BORDER_COLOR,
  anchorStrokeWidth: 1,
  anchorFill: SELECTION_ANCHOR_FILL,
  anchorSize: 8,
  anchorCornerRadius: 0,
  rotateAnchorOffset: 24,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  anchorStyleFunc: (anchor: any) => {
    if (anchor.name()?.includes("rotater")) {
      anchor.cornerRadius(12);
      anchor.width(24);
      anchor.height(24);
      anchor.offsetX(12);
      anchor.offsetY(12);
      anchor.stroke(SELECTION_BORDER_COLOR);
      anchor.strokeWidth(1);
      if (rotateIconImage.complete) {
        anchor.fillPriority("pattern");
        anchor.fillPatternImage(rotateIconImage);
        anchor.fillPatternRepeat("no-repeat");
      } else {
        anchor.fill(SELECTION_ANCHOR_FILL);
      }
    }
  },
} as Record<string, unknown>);

setHighlighterStyle({
  stroke: SELECTION_BORDER_COLOR,
  strokeWidth: 1,
});

const TOTAL_RESOURCES = 7;

const TemplatesEditorShell: FC = () => {
  const isMobile = isMobileDevice();
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const handleTogglePages = useCallback(
    () => setIsPagesOpen((prev) => !prev),
    []
  );

  const { loadTemplate } = useLoadTemplate({ store });

  const activeTab = useTemplatesEditorStore.use.sidePanelActiveTab();
  const isLoading = useTemplatesEditorStore.use.isLoading();
  const dataReady = useTemplatesEditorStore.use.isDataReady();

  const fetchTemplatesData = useTemplatesEditorStore.use.fetchTemplatesData();
  const fetchTextTemplates = useTemplatesEditorStore.use.fetchTextTemplates();
  const fetchGoogleFonts = useTemplatesEditorStore.use.fetchGoogleFonts();
  const fetchUnsplashImages = useTemplatesEditorStore.use.fetchUnsplashImages();
  const fetchNounProjectIcons =
    useTemplatesEditorStore.use.fetchNounProjectIcons();
  const fetchUnsplashGradientImages =
    useTemplatesEditorStore.use.fetchUnsplashGradientImages();
  const setLoading = useTemplatesEditorStore.use.setLoading();
  const setDataReady = useTemplatesEditorStore.use.setDataReady();

  useEffect(() => {
    setIsPagesOpen(activeTab === "layers");
  }, [activeTab]);

  const [isDrawMode, setIsDrawMode] = useState(false);

  useEffect(() => {
    return autorun(() => {
      setIsDrawMode(store.tool === "draw");
    });
  }, []);

  const completedRef = useRef(0);
  const templateDoneRef = useRef(true);

  const handleLoaderComplete = useCallback(
    () => setLoading(false),
    [setLoading]
  );

  const trackComplete = useCallback(() => {
    completedRef.current++;
    if (completedRef.current >= TOTAL_RESOURCES && templateDoneRef.current) {
      setDataReady(true);
    }
  }, [setDataReady]);

  useEffect(() => {
    applyInitialScale(store);

    void fetchTemplatesData(trackComplete, trackComplete);
    void fetchTextTemplates(trackComplete, trackComplete);
    void fetchGoogleFonts(trackComplete, trackComplete);
    void fetchUnsplashImages(undefined, trackComplete, trackComplete);
    void fetchNounProjectIcons(undefined, trackComplete, trackComplete);
    void fetchUnsplashGradientImages(undefined, trackComplete, trackComplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackComplete]);

  useEffect(() => {
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    document.head.appendChild(preconnect2);

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap";
    fontLink.onload = () => document.fonts.ready.then(trackComplete);
    fontLink.onerror = () => trackComplete();
    document.head.appendChild(fontLink);

    return () => {
      preconnect1.remove();
      preconnect2.remove();
      fontLink.remove();
    };
  }, [trackComplete]);

  useEffect(() => {
    const queryParams = queryString.parse(window.location.search);
    const form = queryParams.form as string;

    if (form) {
      templateDoneRef.current = false;
      loadTemplate(form, false)?.finally(() => {
        templateDoneRef.current = true;
        if (completedRef.current >= TOTAL_RESOURCES) {
          setDataReady(true);
        }
      });
    } else if (store.pages.length === 0) {
      store.addPage({ width: 1240, height: 1754 });
    }
  }, [loadTemplate, setDataReady]);

  useEffect(() => {
    window.onbeforeunload = beforeUnloadCallback;

    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  // Mobile fits the whole page into the canvas, so refit on rotation/resize and
  // whenever the active page dimensions change (e.g. a loaded template swaps the
  // page size). A reaction is more reliable than waiting on `dataReady`.
  useEffect(() => {
    if (!isMobile) return;

    const refit = () => applyInitialScale(store);
    refit();

    const disposeReaction = reaction(
      () => [store.width, store.height, store.activePage?.id],
      refit
    );
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);

    return () => {
      disposeReaction();
      window.removeEventListener("resize", refit);
      window.removeEventListener("orientationchange", refit);
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <>
        {isLoading && (
          <Loader ready={dataReady} onComplete={handleLoaderComplete} overlay />
        )}
        <MobileEditorLayout store={store} />
        <Toast />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "bg-[var(--color-material-grey-100)]",
          isDrawMode && "draw-mode"
        )}
      >
        <div className="relative mx-auto w-full">
          {isLoading && (
            <Loader
              ready={dataReady}
              onComplete={handleLoaderComplete}
              overlay
            />
          )}
          <div className="editor-container flex h-screen flex-col">
            <EditorHeader store={store} />
            <div className="min-h-0 flex-1">
              <PolotnoContainer className="bg-[var(--color-material-grey-100)] px-4 pb-4">
                <SidePanelWrap>
                  <EditorSidePanel store={store} />
                </SidePanelWrap>
                <WorkspaceWrap style={{ minWidth: 0 }}>
                  <ToolbarController store={store} />
                  <Workspace
                    store={store}
                    backgroundColor="transparent"
                    pageBorderColor="rgba(30, 24, 24, 0.07)"
                    activePageBorderColor="rgba(30, 24, 24, 0.07)"
                    selectionRectFill="rgba(11, 153, 255, 0.1)"
                    selectionRectStroke={SELECTION_BORDER_COLOR}
                    selectionRectStrokeWidth={1}
                    snapGuideStroke={SELECTION_BORDER_COLOR}
                    snapGuideStrokeWidth={1}
                    transformLabelFill={SELECTION_BORDER_COLOR}
                    transformLabelTextFill="#ffffff"
                    distanceGuideStroke={SELECTION_BORDER_COLOR}
                    distanceLabelFill={SELECTION_BORDER_COLOR}
                    distanceLabelTextFill="#ffffff"
                    components={{
                      PageControls: PageToolbar,
                      Tooltip: ContextualTooltip,
                      ContextMenu: () => null,
                    }}
                  />
                  <div
                    className={cn(
                      "absolute left-1/2 w-auto -translate-x-1/2 overflow-hidden rounded-[5px] transition-[bottom] duration-[250ms] ease-in-out",
                      isPagesOpen ? "bottom-[249px]" : "bottom-0"
                    )}
                  >
                    <ZoomButtons store={store} />
                  </div>
                  <div
                    className={cn(
                      "absolute end-0 w-auto transition-[bottom] duration-[250ms] ease-in-out",
                      isPagesOpen ? "bottom-[249px]" : "bottom-0"
                    )}
                  >
                    <PageNavigation store={store} />
                  </div>
                  <div
                    className={cn(
                      "absolute start-0 z-[2] w-auto transition-[bottom] duration-[250ms] ease-in-out",
                      isPagesOpen ? "bottom-[249px]" : "bottom-0"
                    )}
                  >
                    <PagesButton
                      isOpen={isPagesOpen}
                      onToggle={handleTogglePages}
                    />
                  </div>
                  {isPagesOpen && <PagesPanel store={store} />}
                </WorkspaceWrap>
              </PolotnoContainer>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </>
  );
};

export default TemplatesEditorShell;
export { TemplatesEditorShell };
