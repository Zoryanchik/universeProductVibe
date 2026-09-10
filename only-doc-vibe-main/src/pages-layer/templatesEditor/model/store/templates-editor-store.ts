import { create } from "zustand";

import { createSelectors } from "@/shared/lib/state/createSelectors";

import {
  fetchGoogleFonts,
  fetchNounProjectIcons,
  fetchTemplatesData,
  fetchTextTemplates,
  fetchUnsplashImages,
} from "../../api/polotno-api";
import type {
  IGetUnsplashImagesParams,
  INounProjectIcon,
  ITemplatesEditorToast,
  ITextTemplates,
  IUnsplashImages,
  IUnsplashListMeta,
  TemplatesData,
} from "../types";

const MAX_TOASTS = 5;

type Cb<T = unknown> = (data?: T) => void;

interface TemplatesEditorState {
  templateName: string;
  sidePanelActiveTab: string | null;
  textTemplates: ITextTemplates | null;
  unsplashImages: IUnsplashImages | null;
  unsplashImagesListMeta: IUnsplashListMeta | null;
  unsplashGradientImages: IUnsplashImages | null;
  unsplashGradientImagesListMeta: IUnsplashListMeta | null;
  nounProjectIcons: INounProjectIcon[];
  nounProjectIconsMeta: IUnsplashListMeta | null;
  uploadedFonts: { fontFamily: string; url: string }[];
  uploadedPhotos: { id: string; src: string }[];
  googleFonts: string[];
  maskImageMode: boolean;
  effectsMode: boolean;
  mobileToolSheetOpen: boolean;
  mobileDrawMode: boolean;
  templatesData: TemplatesData | null;
  toasts: ITemplatesEditorToast[];
  isLoading: boolean;
  isDataReady: boolean;
}

interface TemplatesEditorActions {
  setTemplateName: (templateName: string) => void;
  setSidePanelActiveTab: (tab: string | null) => void;
  setMaskImageMode: (maskImageMode: boolean) => void;
  setEffectsMode: (effectsMode: boolean) => void;
  setMobileToolSheetOpen: (mobileToolSheetOpen: boolean) => void;
  setMobileDrawMode: (mobileDrawMode: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setDataReady: (isDataReady: boolean) => void;

  addUploadedFonts: (fonts: { fontFamily: string; url: string }[]) => void;
  removeUploadedFont: (fontFamily: string) => void;
  addUploadedPhotos: (photos: { id: string; src: string }[]) => void;
  removeUploadedPhotos: (ids: string[]) => void;

  showToast: (toast: ITemplatesEditorToast) => void;
  hideToast: (identifier: number | string) => void;

  fetchTextTemplates: (onSuccess?: Cb, onFailed?: Cb) => Promise<void>;
  fetchGoogleFonts: (onSuccess?: Cb, onFailed?: Cb) => Promise<void>;
  fetchTemplatesData: (onSuccess?: Cb, onFailed?: Cb) => Promise<void>;
  fetchUnsplashImages: (
    params?: IGetUnsplashImagesParams,
    onSuccess?: Cb,
    onFailed?: Cb
  ) => Promise<void>;
  fetchUnsplashGradientImages: (
    params?: IGetUnsplashImagesParams,
    onSuccess?: Cb,
    onFailed?: Cb
  ) => Promise<void>;
  fetchNounProjectIcons: (
    params?: IGetUnsplashImagesParams,
    onSuccess?: Cb,
    onFailed?: Cb
  ) => Promise<void>;
}

const initialState: TemplatesEditorState = {
  templateName: "template",
  sidePanelActiveTab: "text",
  textTemplates: null,
  unsplashImages: null,
  unsplashImagesListMeta: null,
  unsplashGradientImages: null,
  unsplashGradientImagesListMeta: null,
  nounProjectIcons: [],
  nounProjectIconsMeta: null,
  uploadedFonts: [],
  uploadedPhotos: [],
  googleFonts: [],
  maskImageMode: false,
  effectsMode: false,
  mobileToolSheetOpen: false,
  mobileDrawMode: false,
  templatesData: null,
  toasts: [],
  isLoading: true,
  isDataReady: false,
};

const mergeUnsplash = (
  state: TemplatesEditorState,
  incoming: IUnsplashImages,
  params: IGetUnsplashImagesParams | undefined,
  gradient: boolean
): Partial<TemplatesEditorState> => {
  const append = Boolean(params?.append);
  const query = (gradient ? params?.query || "gradient" : params?.query) ?? "";
  const page = params?.page ?? 1;

  const listKey = gradient ? "unsplashGradientImages" : "unsplashImages";
  const metaKey = gradient
    ? "unsplashGradientImagesListMeta"
    : "unsplashImagesListMeta";

  const currentList = state[listKey];
  const currentMeta = state[metaKey];
  const meta: IUnsplashListMeta = {
    query,
    page,
    totalPages: incoming.total_pages,
    total: incoming.total,
  };

  if (append && currentMeta?.query === query && currentList) {
    if (incoming.results?.length) {
      const existingIds = new Set(currentList.results.map((r) => r.id));
      const uniqueNew = incoming.results.filter((r) => !existingIds.has(r.id));

      return {
        [listKey]: {
          ...incoming,
          results: [...currentList.results, ...uniqueNew],
          total: incoming.total,
          total_pages: incoming.total_pages,
        },
        [metaKey]: meta,
      };
    }

    return { [metaKey]: meta };
  }

  return { [listKey]: incoming, [metaKey]: meta };
};

const templatesEditorStore = create<
  TemplatesEditorState & TemplatesEditorActions
>()((set, get) => ({
  ...initialState,

  setTemplateName: (templateName) => set({ templateName }),
  setSidePanelActiveTab: (sidePanelActiveTab) => set({ sidePanelActiveTab }),
  setMaskImageMode: (maskImageMode) => set({ maskImageMode }),
  setEffectsMode: (effectsMode) => set({ effectsMode }),
  setMobileToolSheetOpen: (mobileToolSheetOpen) => set({ mobileToolSheetOpen }),
  setMobileDrawMode: (mobileDrawMode) => set({ mobileDrawMode }),
  setLoading: (isLoading) => set({ isLoading }),
  setDataReady: (isDataReady) => set({ isDataReady }),

  addUploadedFonts: (fonts) =>
    set((state) => {
      const existing = new Set(state.uploadedFonts.map((f) => f.fontFamily));
      const next = fonts.filter((f) => !existing.has(f.fontFamily));
      if (next.length === 0) return state;

      return { uploadedFonts: [...state.uploadedFonts, ...next] };
    }),
  removeUploadedFont: (fontFamily) =>
    set((state) => ({
      uploadedFonts: state.uploadedFonts.filter(
        (f) => f.fontFamily !== fontFamily
      ),
    })),
  addUploadedPhotos: (photos) =>
    set((state) => {
      const existing = new Set(state.uploadedPhotos.map((p) => p.src));
      const next = photos.filter((p) => !existing.has(p.src));
      if (next.length === 0) return state;

      return { uploadedPhotos: [...state.uploadedPhotos, ...next] };
    }),
  removeUploadedPhotos: (ids) =>
    set((state) => ({
      uploadedPhotos: state.uploadedPhotos.filter((p) => !ids.includes(p.id)),
    })),

  showToast: (toast) =>
    set((state) => {
      const newToast = { ...toast, _id: Date.now() };
      let next = state.toasts;

      if (toast.id) {
        const idx = next.findIndex((t) => t.id === toast.id);
        if (idx !== -1) {
          next = [...next];
          next[idx] = newToast;

          return { toasts: next };
        }
      }

      next = [...next, newToast];
      if (next.length > MAX_TOASTS) next = next.slice(next.length - MAX_TOASTS);

      return { toasts: next };
    }),
  hideToast: (identifier) =>
    set((state) => ({
      toasts: state.toasts.filter((t) =>
        typeof identifier === "number"
          ? t._id !== identifier
          : t.id !== identifier
      ),
    })),

  fetchTextTemplates: async (onSuccess, onFailed) => {
    try {
      const data = await fetchTextTemplates();
      set({ textTemplates: data });
      onSuccess?.(data);
    } catch (err) {
      onFailed?.(err);
    }
  },

  fetchGoogleFonts: async (onSuccess, onFailed) => {
    try {
      const data = await fetchGoogleFonts();
      set({ googleFonts: Array.isArray(data) ? data : get().googleFonts });
      onSuccess?.(data);
    } catch (err) {
      onFailed?.(err);
    }
  },

  fetchTemplatesData: async (onSuccess, onFailed) => {
    try {
      const incoming = await fetchTemplatesData();
      const seen = new Set<string>();
      const uniqueTemplates = incoming.templates.filter((t) => {
        if (seen.has(t.templateId)) return false;

        seen.add(t.templateId);

        return true;
      });
      set({
        templatesData: { ...incoming, templates: uniqueTemplates },
      });
      onSuccess?.(incoming);
    } catch (err) {
      onFailed?.(err);
    }
  },

  fetchUnsplashImages: async (params, onSuccess, onFailed) => {
    try {
      const data = await fetchUnsplashImages(params);
      set((state) => mergeUnsplash(state, data, params, false));
      onSuccess?.(data);
    } catch (err) {
      onFailed?.(err);
    }
  },

  fetchUnsplashGradientImages: async (params, onSuccess, onFailed) => {
    try {
      const data = await fetchUnsplashImages({
        ...params,
        query: params?.query || "gradient",
      });
      set((state) => mergeUnsplash(state, data, params, true));
      onSuccess?.(data);
    } catch (err) {
      onFailed?.(err);
    }
  },

  fetchNounProjectIcons: async (params, onSuccess, onFailed) => {
    try {
      const incoming = await fetchNounProjectIcons(params);
      const append = Boolean(params?.append);
      const query = params?.query ?? "";
      const page = params?.page ?? 1;
      const icons = incoming.icons ?? [];
      const hasMore = icons.length > 0;
      const totalPages = hasMore ? page + 1 : page;

      set((state) => {
        if (append && state.nounProjectIconsMeta?.query === query) {
          const existingIds = new Set(state.nounProjectIcons.map((i) => i.id));
          const uniqueNew = icons.filter((i) => !existingIds.has(i.id));
          const merged = [...state.nounProjectIcons, ...uniqueNew];

          return {
            nounProjectIcons: merged,
            nounProjectIconsMeta: {
              query,
              page,
              totalPages,
              total: merged.length,
            },
          };
        }

        return {
          nounProjectIcons: !query ? icons.slice(0, 12) : icons,
          nounProjectIconsMeta: {
            query,
            page,
            totalPages,
            total: icons.length,
          },
        };
      });
      onSuccess?.(incoming);
    } catch (err) {
      onFailed?.(err);
    }
  },
}));

export const useTemplatesEditorStore = createSelectors(templatesEditorStore);
export { templatesEditorStore };
