import { useCallback, useMemo } from "react";
import { svgToURL } from "polotno/utils/svg";
import { isMobile } from "polotno/utils/screen";
import type { StoreType } from "polotno/model/store";
import { figureToSvg } from "polotno/utils/figure-to-svg";
import { PUBLIC_POLOTNO_API_KEY } from "astro:env/client";

import { useTranslation } from "@/shared/lib/translations";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";
import { ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE } from "../constants/colors";
import { DEFAULT_FONT } from "../constants/font";
import { useLockElements } from "./lockElements";
import type { TextPreset, UploadListImage } from "../model/element-types";
import type { ITextTemplateItem } from "../model/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface UseAddElementsProps {
  store: StoreType;
  type:
    | "image"
    | "svg"
    | "line"
    | "figure"
    | "table"
    | "background"
    | "custom"
    | "text"
    | "signature";
}

const POLOTNO_API_KEY = PUBLIC_POLOTNO_API_KEY ?? "";
const POLOTNO_BASE_URL = "https://api.polotno.com/api";

export const useAddElements = ({ store, type }: UseAddElementsProps) => {
  const { t } = useTranslation();
  const showToast = useTemplatesEditorStore.use.showToast();

  const { checkIsLockedPage, handleLock } = useLockElements({ store });

  const downloadNounProjectSvg = useCallback(
    async (iconId: string): Promise<string> => {
      const res = await fetch(
        `${POLOTNO_BASE_URL}/download-nounproject?id=${iconId}&KEY=${POLOTNO_API_KEY}`
      );
      const svgText = await res.text();

      return svgToURL(svgText);
    },
    []
  );

  const withLockedPageGuard = useCallback(
    <T extends unknown[], R>(
      fn: (page: NonNullable<StoreType["activePage"]>, ...args: T) => R
    ) =>
      (...args: T): R | undefined => {
        const page = store.activePage;
        if (!page) return;

        if (checkIsLockedPage(page)) {
          showToast({
            id: "page-locked",
            header: t("templatesEditor.toasts.page_locked_header") as string,
            content: t("templatesEditor.toasts.page_locked_content") as string,
            variant: "warning",
            button: {
              label: t("templatesEditor.common.unlock") as string,
              onClick: () => handleLock(page.children),
            },
          });

          return;
        }

        return fn(page, ...args);
      },
    [store, checkIsLockedPage, showToast, handleLock, t]
  );

  const addImageToCanvas = useMemo(
    () =>
      withLockedPageGuard(
        async (
          page,
          image: UploadListImage,
          position?: { x: number; y: number },
          targetElement?: unknown
        ) => {
          if (type === "custom") {
            return;
          } else if (type === "background") {
            page.set({ background: image.src });

            return;
          } else if (type === "image") {
            const img = new window.Image();
            img.onload = () => {
              const pageW = page.computedWidth;
              const pageH = page.computedHeight;
              const ratio = img.naturalWidth / img.naturalHeight;
              const maxWidth = pageW / 2;
              const maxHeight = pageH / 2;

              let width: number;
              let height: number;

              if (ratio > maxWidth / maxHeight) {
                width = maxWidth;
                height = maxWidth / ratio;
              } else {
                height = maxHeight;
                width = maxHeight * ratio;
              }

              const x = (position?.x ?? pageW / 2) - width / 2;
              const y = (position?.y ?? pageH / 2) - height / 2;

              page.addElement({ type, src: image.src, x, y, width, height });
            };
            img.src = image.src;
          } else if (type === "svg") {
            const pageW = page.computedWidth;
            const pageH = page.computedHeight;
            const svgUrl = await downloadNounProjectSvg(image.id);
            const x = (position?.x ?? pageW / 2) - 100;
            const y = (position?.y ?? pageH / 2) - 100;
            let custom: Record<string, unknown> | undefined;
            page.addElement({ type, src: svgUrl, x, y, custom });
          } else if (type === "signature") {
            const pageW = page.computedWidth;
            const pageH = page.computedHeight;
            const x = (position?.x ?? pageW / 2) - 100;
            const y = (position?.y ?? pageH / 2) - 100;

            return page.addElement({
              type: "svg",
              src: image.src,
              x,
              y,
              custom: { isSignature: true },
            });
          } else if (type === "line") {
            const pageW = page.computedWidth;
            const pageH = page.computedHeight;
            const lineWidth = pageW / 3;
            page.addElement({
              type,
              x: (position?.x ?? pageW / 2) - lineWidth / 2,
              y: position?.y ?? pageH / 2,
              width: lineWidth,
              color: ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE,
              ...image.elementProps,
            });
          } else if (type === "figure") {
            const target = targetElement as AnyElement;
            const subType = image.elementProps?.subType as string | undefined;

            if (target?.type === "image" && subType) {
              const clipSvg = figureToSvg({
                subType,
                width: 300,
                height: 300,
                fill: "black",
                stroke: "black",
                strokeWidth: 0,
              });
              target.set({ clipSrc: svgToURL(clipSvg) });
            } else {
              const pageW = page.computedWidth;
              const pageH = page.computedHeight;
              const scale = (pageW + pageH) / 2160;
              const w = 300 * scale;
              const h = 300 * scale;
              page.addElement({
                type,
                x: (position?.x ?? pageW / 2) - w / 2,
                y: (position?.y ?? pageH / 2) - h / 2,
                width: w,
                height: h,
                fill: ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE,
                ...image.elementProps,
              });
            }
          } else if (type === "table") {
            const pageW = page.computedWidth;
            const pageH = page.computedHeight;
            const scale = (pageW + pageH) / 2160;
            const w = 400 * scale;
            const h = 300 * scale;
            page.addElement({
              type,
              x: (position?.x ?? pageW / 2) - w / 2,
              y: (position?.y ?? pageH / 2) - h / 2,
              width: w,
              height: h,
              fontSize: Math.round(30 * scale),
              fontFamily: DEFAULT_FONT,
              ...image.elementProps,
            });
          }
        }
      ),
    [withLockedPageGuard, type, downloadNounProjectSvg]
  );

  const addTextElement = useMemo(
    () =>
      withLockedPageGuard(
        (page, preset: TextPreset, position?: { x: number; y: number }) => {
          const scale = (store.width + store.height) / 2160;
          const width = store.width / 2;
          const x = (position?.x ?? store.width / 2) - width / 2;
          const y = (position?.y ?? store.height / 2) - preset.fontSize / 2;

          const element = page.addElement({
            type: "text",
            fontFamily: preset.fontFamily ?? "Outfit",
            text: preset.text,
            fontSize: preset.fontSize * scale,
            fontWeight: preset.fontWeight ?? "normal",
            x,
            y,
            width,
          });

          if (!isMobile()) {
            element?.toggleEditMode(true);
          }
        }
      ),
    [withLockedPageGuard, store]
  );

  const addTextPresetElement = useMemo(
    () =>
      withLockedPageGuard(
        async (
          page,
          item: ITextTemplateItem,
          position?: { x: number; y: number }
        ) => {
          try {
            const res = await fetch(item.json);
            if (!res.ok) return;

            const template = await res.json();
            const children = template.pages?.[0]?.children;
            if (!children?.length) return;

            const scale = (store.width + store.height) / 2160;
            const offsetX = position
              ? position.x - (template.width / 2) * scale
              : store.width / 2 - (template.width / 2) * scale;
            const offsetY = position
              ? position.y - (template.height / 2) * scale
              : store.height / 2 - (template.height / 2) * scale;

            store.history.transaction(() => {
              const addedIds: string[] = [];

              children.forEach((el: Record<string, unknown>) => {
                delete el.id;
                const attrs = {
                  ...el,
                  fontSize: (el.fontSize as number) * scale,
                  x: (el.x as number) * scale + offsetX,
                  y: (el.y as number) * scale + offsetY,
                  width: (el.width as number) * scale,
                  height: (el.height as number) * scale,
                } as unknown as Parameters<typeof page.addElement>[0];
                const { id } = page.addElement(attrs);
                addedIds.push(id);
              });

              store.selectElements(addedIds);
            });
          } catch {
            // skip on network or parse error
          }
        }
      ),
    [withLockedPageGuard, store]
  );

  return {
    withLockedPageGuard,
    addImageToCanvas,
    addTextElement,
    addTextPresetElement,
  };
};
