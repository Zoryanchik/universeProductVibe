import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";
import { ensureGoogleFonts } from "./ensureGoogleFonts";
import { applyInitialScale } from "./applyInitialScale";

/**
 * Resolve a template's polotno JSON URL from the CMS-backed gallery embedded in
 * the editor page (`#editor-templates`). Returns null when the template is
 * unknown so the caller can treat it as not found.
 */
const resolveTemplateJsonUrl = (templateName: string): string | null => {
  if (typeof document === "undefined") return null;

  const node = document.getElementById("editor-templates");
  if (!node?.textContent) return null;

  try {
    const data = JSON.parse(node.textContent) as {
      templates?: { templateId: string; polotnoUrl: string }[];
    };

    return (
      data.templates?.find((t) => t.templateId === templateName)?.polotnoUrl ??
      null
    );
  } catch {
    return null;
  }
};

interface UseLoadTemplateProps {
  store: StoreType;
}

export const useLoadTemplate = ({ store }: UseLoadTemplateProps) => {
  const setTemplateName = useTemplatesEditorStore.use.setTemplateName();
  const setLoading = useTemplatesEditorStore.use.setLoading();
  const setDataReady = useTemplatesEditorStore.use.setDataReady();

  const loadTemplate = useCallback(
    (templateName: string, _includeAnalytics: boolean = true) => {
      const jsonUrl = resolveTemplateJsonUrl(templateName);

      if (!jsonUrl) {
        localeNavigate("/404");

        return Promise.resolve();
      }

      setLoading(true);
      setDataReady(false);

      return fetch(jsonUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to load template: ${response.status} ${response.statusText}`
            );
          }

          return response.json();
        })
        .then((jsonData) => {
          store.loadJSON(jsonData);
          ensureGoogleFonts(store);
          setTemplateName(templateName);
          setDataReady(true);
          // Fit/center the freshly loaded page once Polotno finishes laying it
          // out. Running synchronously would apply the scale before the new page
          // is measured, leaving it scrolled out of the visible workspace.
          store
            .waitLoading()
            .then(() => {
              requestAnimationFrame(() => applyInitialScale(store));
            })
            .catch(() => undefined);
        })
        .catch(() => {
          localeNavigate("/404");
        });
    },
    [store, setTemplateName, setLoading, setDataReady]
  );

  return { loadTemplate };
};
