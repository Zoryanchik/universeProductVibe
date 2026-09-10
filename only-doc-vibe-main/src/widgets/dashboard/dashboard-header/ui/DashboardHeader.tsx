import type { FC } from "react";
import { Button, cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations";
import { SearchIcon, UploadIcon } from "@/shared/ui/dashboard-icons";

import {
  EDashboardTab,
  setDashboardSearch,
  setDropOverlayOpen,
  useDashboardStore,
} from "@/entities/documents";

import { useDashboardUpload } from "@/features/dashboard-upload";

export const DashboardHeader: FC = () => {
  const { t } = useTranslation();
  const tab = useDashboardStore.use.tab();
  const search = useDashboardStore.use.search();
  const files = useDashboardStore.use.files();
  const isLoading = useDashboardStore.use.isLoading();
  const { inFlight } = useDashboardUpload();

  const isEmpty = !isLoading && files.length === 0;

  const onUploadClick = () => setDropOverlayOpen(true);

  const title =
    tab === EDashboardTab.MY_FILES
      ? String(t("dashboard.header.myFiles"))
      : String(t("dashboard.header.tools"));

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-6 px-10 pt-10",
        "max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 max-md:pt-4"
      )}
    >
      <h1 className="text-mobile-title-2 lg:text-desktop-title-3 text-text-primary">
        {title}
      </h1>

      {tab === EDashboardTab.MY_FILES && !isEmpty && (
        <div className="flex items-center gap-2 max-md:w-full">
          <div className="relative flex-1 md:w-60">
            <span className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.48)]">
              <SearchIcon size={20} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setDashboardSearch(e.target.value)}
              placeholder={String(t("dashboard.header.searchPlaceholder"))}
              className="w-full rounded-xl py-2 ps-9 pe-2 text-sm leading-5 outline-none"
            />
          </div>

          <Button
            onClick={onUploadClick}
            disabled={inFlight > 0}
            className="flex min-h-[48px] items-center gap-1.5 rounded-xl px-4 py-3 max-md:hidden"
          >
            {inFlight > 0 ? (
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
            ) : (
              <UploadIcon size={20} />
            )}
            {String(
              inFlight > 0
                ? t("dashboard.header.uploading")
                : t("dashboard.header.upload")
            )}
          </Button>
        </div>
      )}

      {tab === EDashboardTab.TOOLS && (
        <>
          <Button
            onClick={onUploadClick}
            disabled={inFlight > 0}
            className="flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-xl px-4 py-3 max-md:hidden"
          >
            {inFlight > 0 ? (
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
            ) : (
              <UploadIcon size={20} />
            )}
            {String(
              inFlight > 0
                ? t("dashboard.header.uploading")
                : t("dashboard.header.upload")
            )}
          </Button>
        </>
      )}
    </div>
  );
};
