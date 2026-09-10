import { create } from "zustand";

import { createSelectors } from "@/shared/lib/state/createSelectors";

import type { IUserFile } from "./types";
import {
  EDashboardSort,
  EDashboardTab,
  EDashboardViewMode,
  EFormatGroup,
} from "./dashboard-constants";

interface IDashboardStore {
  files: IUserFile[];
  isLoading: boolean;
  error: string | null;
  tab: EDashboardTab;
  viewMode: EDashboardViewMode;
  sort: EDashboardSort;
  search: string;
  formatGroup: EFormatGroup;
  selectedIds: string[];
  previewFileId: string | null;
  isDropOverlayOpen: boolean;
}

const initialState: IDashboardStore = {
  files: [],
  isLoading: false,
  error: null,
  tab: EDashboardTab.MY_FILES,
  viewMode: EDashboardViewMode.LIST,
  sort: EDashboardSort.DATE_DESC,
  search: "",
  formatGroup: EFormatGroup.ALL,
  selectedIds: [],
  previewFileId: null,
  isDropOverlayOpen: false,
};

const dashboardStore = create<IDashboardStore>(() => initialState);

export const useDashboardStore = createSelectors(dashboardStore);

export const setDashboardFiles = (files: IUserFile[]): void => {
  dashboardStore.setState({ files });
};

export const setDashboardLoading = (isLoading: boolean): void => {
  dashboardStore.setState({ isLoading });
};

export const setDashboardError = (error: string | null): void => {
  dashboardStore.setState({ error });
};

export const setDashboardTab = (tab: EDashboardTab): void => {
  dashboardStore.setState({ tab, selectedIds: [] });
};

export const setDashboardViewMode = (viewMode: EDashboardViewMode): void => {
  dashboardStore.setState({ viewMode });
};

export const setDashboardSort = (sort: EDashboardSort): void => {
  dashboardStore.setState({ sort });
};

export const setDashboardSearch = (search: string): void => {
  dashboardStore.setState({ search });
};

export const setDashboardFormatGroup = (formatGroup: EFormatGroup): void => {
  dashboardStore.setState({ formatGroup, selectedIds: [] });
};

export const setDashboardSelectedIds = (selectedIds: string[]): void => {
  dashboardStore.setState({ selectedIds });
};

export const toggleDashboardFileSelected = (id: string): void => {
  dashboardStore.setState((prev) => ({
    selectedIds: prev.selectedIds.includes(id)
      ? prev.selectedIds.filter((sId) => sId !== id)
      : [...prev.selectedIds, id],
  }));
};

export const clearDashboardSelected = (): void => {
  dashboardStore.setState({ selectedIds: [] });
};

export const setDashboardPreviewFileId = (
  previewFileId: string | null
): void => {
  dashboardStore.setState({ previewFileId });
};

export const removeDashboardFiles = (ids: string[]): void => {
  dashboardStore.setState((prev) => ({
    files: prev.files.filter((f) => !ids.includes(f.id)),
    selectedIds: prev.selectedIds.filter((id) => !ids.includes(id)),
    previewFileId:
      prev.previewFileId && ids.includes(prev.previewFileId)
        ? null
        : prev.previewFileId,
  }));
};

export const updateDashboardFile = (
  id: string,
  patch: Partial<IUserFile>
): void => {
  dashboardStore.setState((prev) => ({
    files: prev.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  }));
};

export const setDropOverlayOpen = (isDropOverlayOpen: boolean): void => {
  dashboardStore.setState({ isDropOverlayOpen });
};

export const addDashboardFile = (file: IUserFile): void => {
  dashboardStore.setState((prev) => ({ files: [file, ...prev.files] }));
};

export const restoreDashboardFiles = (
  snapshot: IUserFile[],
  originalFiles: IUserFile[]
): void => {
  dashboardStore.setState((prev) => {
    const restoredIds = new Set(snapshot.map((f) => f.id));
    const withoutRestored = prev.files.filter((f) => !restoredIds.has(f.id));

    const merged = [...originalFiles];
    for (const f of withoutRestored) {
      if (!restoredIds.has(f.id)) {
        merged.push(f);
      }
    }

    return { files: merged };
  });
};
