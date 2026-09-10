import { useMemo } from "react";

import type { IUserFile } from "./types";
import {
  EDashboardSort,
  EFormatGroup,
  isFileInGroup,
} from "./dashboard-constants";
import { useDashboardStore } from "./dashboard-store";

const sortFiles = (files: IUserFile[], sort: EDashboardSort): IUserFile[] => {
  const copy = [...files];
  switch (sort) {
    case EDashboardSort.DATE_ASC:
      return copy.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case EDashboardSort.DATE_DESC:
      return copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case EDashboardSort.SIZE_ASC:
      return copy.sort((a, b) => a.size - b.size);
    case EDashboardSort.SIZE_DESC:
      return copy.sort((a, b) => b.size - a.size);
    case EDashboardSort.NAME_ASC:
      return copy.sort((a, b) => a.filename.localeCompare(b.filename));
    case EDashboardSort.NAME_DESC:
      return copy.sort((a, b) => b.filename.localeCompare(a.filename));
    default:
      return copy;
  }
};

export const useFilteredFiles = (): IUserFile[] => {
  const files = useDashboardStore.use.files();
  const formatGroup = useDashboardStore.use.formatGroup();
  const search = useDashboardStore.use.search();
  const sort = useDashboardStore.use.sort();

  return useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    const filtered = files.filter((file) => {
      if (
        formatGroup !== EFormatGroup.ALL &&
        !isFileInGroup(file.internal_type, formatGroup)
      ) {
        return false;
      }

      if (
        trimmedSearch &&
        !file.filename.toLowerCase().includes(trimmedSearch)
      ) {
        return false;
      }

      return true;
    });

    return sortFiles(filtered, sort);
  }, [files, formatGroup, search, sort]);
};

export const useFormatGroupCounts = (): Record<EFormatGroup, number> => {
  const files = useDashboardStore.use.files();

  return useMemo(() => {
    const groups = Object.values(EFormatGroup);
    const counts = Object.fromEntries(groups.map((g) => [g, 0])) as Record<
      EFormatGroup,
      number
    >;
    counts[EFormatGroup.ALL] = files.length;

    for (const file of files) {
      for (const group of groups) {
        if (group === EFormatGroup.ALL) continue;

        if (isFileInGroup(file.internal_type, group)) {
          counts[group] += 1;
        }
      }
    }

    return counts;
  }, [files]);
};
