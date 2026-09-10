import { useEffect, useState, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import {
  EDashboardViewMode,
  useDashboardStore,
  useFilteredFiles,
} from "@/entities/documents";

import { useDashboardUpload } from "@/features/dashboard-upload";

import { BulkActionsBar } from "./BulkActionsBar";
import { DashboardFormatTabs } from "../../dashboard-format-tabs";
import { EmptyState } from "./EmptyState";
import { FilesGrid } from "./FilesGrid";
import { FilesTable } from "./FilesTable";
import { ViewToolbar } from "./ViewToolbar";

const LIST_PER_PAGE = 30;
const GRID_PER_PAGE = 15;

const Pagination: FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
}> = ({ currentPage, totalPages, onPageChange, previousLabel, nextLabel }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("ellipsis");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex shrink-0 items-center justify-center gap-1 border-t border-[var(--color-os-divider)] px-3 py-2">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-[rgba(0,0,0,0.04)] disabled:opacity-30"
        aria-label={previousLabel}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {getPageNumbers().map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="text-text-secondary flex h-8 w-8 items-center justify-center text-sm"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              item === currentPage
                ? "bg-[var(--color-primary)] text-black"
                : "text-text-primary hover:bg-[rgba(0,0,0,0.04)]"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-[rgba(0,0,0,0.04)] disabled:opacity-30"
        aria-label={nextLabel}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export const DashboardFilesView: FC = () => {
  const { t } = useTranslation();
  const viewMode = useDashboardStore.use.viewMode();
  const files = useDashboardStore.use.files();
  const filtered = useFilteredFiles();
  const isLoading = useDashboardStore.use.isLoading();
  const { inFlight } = useDashboardUpload();

  const [currentPage, setCurrentPage] = useState(1);

  const search = useDashboardStore.use.search();
  const formatGroup = useDashboardStore.use.formatGroup();
  const isList = viewMode === EDashboardViewMode.LIST;
  const perPage = isList ? LIST_PER_PAGE : GRID_PER_PAGE;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, formatGroup, viewMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFiles = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  if (!isLoading && files.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-os-divider)]">
      {inFlight > 0 && (
        <div className="relative h-1 w-full shrink-0 overflow-hidden bg-[var(--color-primary-opacity-8)]">
          <div className="absolute inset-y-0 start-0 w-1/3 animate-[indeterminate_1.5s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)]" />
        </div>
      )}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-os-divider)] p-3">
        <div className="min-w-0 flex-1">
          <DashboardFormatTabs />
        </div>
        <div className="ms-auto shrink-0">
          <ViewToolbar />
        </div>
      </div>
      {isList ? (
        <FilesTable files={paginatedFiles} />
      ) : (
        <div className="p-3">
          <FilesGrid files={paginatedFiles} />
        </div>
      )}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        previousLabel={String(t("dashboard.pagination.previous"))}
        nextLabel={String(t("dashboard.pagination.next"))}
      />

      <BulkActionsBar />
    </div>
  );
};
