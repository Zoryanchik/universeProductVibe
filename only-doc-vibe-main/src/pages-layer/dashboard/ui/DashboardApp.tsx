import { useEffect, type FC } from "react";

import { ToastContainer } from "@/shared/ui/toast";
import { PAGE_LINKS } from "@/shared/constants/page-links";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";
import { getCurrentLanguage, useTranslation } from "@/shared/lib/translations";
import {
  LocalizedLinksProvider,
  type LocaleSlugMap,
} from "@/shared/lib/localized-links";

import { useIsUserAuthenticated, useUserStore } from "@/entities/user";
import { listUserFiles } from "@/entities/documents";

import { DashboardAccountView } from "@/features/dashboard-account";

import {
  DashboardDropOverlay,
  DashboardBottomNav,
  DashboardFilePreview,
  DashboardFilesView,
  DashboardHeader,
  DashboardQuickTools,
  DashboardSidebar,
  DashboardUpgradeBanner,
} from "@/widgets/dashboard";

import { EDashboardTab, type DashboardView } from "../model/constants";
import {
  setDashboardError,
  setDashboardFiles,
  setDashboardLoading,
  setDashboardTab,
  useDashboardStore,
} from "../model/dashboard-store";
import type { IDashboardTool } from "../model/dashboard-tools";
import { DashboardToolsSection } from "./sections/DashboardToolsSection";

interface DashboardAppProps {
  readonly slugMap?: LocaleSlugMap;
  readonly availableToolSlugs?: readonly string[];
  readonly tools?: IDashboardTool[];
  readonly lang?: string;
  readonly view?: DashboardView;
}

export const DashboardApp: FC<DashboardAppProps> = ({
  slugMap,
  availableToolSlugs,
  tools = [],
  lang,
  view = "main",
}) => {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  const tab = useDashboardStore.use.tab();
  const previewFileId = useDashboardStore.use.previewFileId();
  const user = useUserStore.use.user();
  const isAuthenticated = useIsUserAuthenticated();

  const isMain = view === "main";

  useEffect(() => {
    if (!isMain || typeof window === "undefined") return;

    if (window.location.hash === "#tools") {
      setDashboardTab(EDashboardTab.TOOLS);
    }
  }, [isMain]);

  useEffect(() => {
    if (!user || !isMain || tab !== EDashboardTab.MY_FILES) return;

    let cancelled = false;
    setDashboardLoading(true);
    setDashboardError(null);
    listUserFiles()
      .then((files) => {
        if (cancelled) return;

        setDashboardFiles(files);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        const message =
          err instanceof Error
            ? err.message
            : String(t("dashboard.errors.loadFiles"));
        setDashboardError(message);
      })
      .finally(() => {
        if (cancelled) return;

        setDashboardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, tab, t, isMain]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (user === null) {
      window.location.href = navigateThroughURL(
        PAGE_LINKS.LOGIN,
        currentLanguage
      );

      return;
    }

    // The account page is for registered users only — send guests back to the dashboard.
    if (view === "account" && !isAuthenticated) {
      window.location.href = navigateThroughURL("/dashboard", currentLanguage);
    }
  }, [currentLanguage, user, view, isAuthenticated]);

  return (
    <LocalizedLinksProvider slugMap={slugMap} lang={lang}>
      <div className="bg-bg-grey-bg flex h-dvh overflow-hidden">
        <DashboardSidebar view={view} />
        <main className="bg-bg-grey-bg flex min-w-0 flex-1 flex-col overflow-hidden p-4 max-md:px-2 max-md:pt-2 max-md:pb-[calc(72px+env(safe-area-inset-bottom))]">
          <div className="flex min-h-0 flex-1 gap-4">
            <div className="bg-bg-white-bg flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
              {view === "account" && <DashboardAccountView lang={lang} />}
              {isMain && tab === EDashboardTab.MY_FILES && (
                <>
                  <DashboardHeader />
                  <div className="shrink-0 px-10 pt-6 max-md:px-4 max-md:pt-4">
                    <DashboardQuickTools
                      availableToolSlugs={availableToolSlugs}
                      tools={tools}
                    />
                  </div>
                  <div className="shrink-0 px-10 pt-4 max-md:px-4">
                    <DashboardUpgradeBanner variant="grid" />
                  </div>
                  <div className="px-10 pt-5 pb-10 max-md:px-4 max-md:pb-4">
                    <DashboardFilesView />
                  </div>
                </>
              )}
              {isMain && tab === EDashboardTab.TOOLS && (
                <>
                  <DashboardHeader />
                  <div className="flex-1 px-10 pt-6 pb-10 max-md:px-4 max-md:pt-4 max-md:pb-4">
                    <DashboardToolsSection
                      availableToolSlugs={availableToolSlugs}
                      tools={tools}
                    />
                  </div>
                </>
              )}
            </div>
            {isMain && tab === EDashboardTab.MY_FILES && previewFileId && (
              <DashboardFilePreview />
            )}
          </div>
        </main>
        <DashboardBottomNav view={view} />
        <DashboardDropOverlay />
        <ToastContainer />
      </div>
    </LocalizedLinksProvider>
  );
};
