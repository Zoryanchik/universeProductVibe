import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, useMemo, useState, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../ui/SidePanelSectionLabel";
import { HorizontalTabs } from "../../../../ui/HorizontalTabs";
import { useTemplatesEditorStore } from "../../../../model/store/templates-editor-store";
import { UploadPhotoTab } from "./tabs/UploadPhoto";
import { SearchTab } from "../common/tabs/Search";
import { PhotoEffectsPanel } from "./sections/PhotoEffects";

const PHOTO_TABS = [
  {
    id: "search",
    icon: "search",
    labelKey: "templatesEditor.side_panel.photo_tabs.search",
  },
  {
    id: "upload",
    icon: "upload",
    labelKey: "templatesEditor.side_panel.photo_tabs.upload",
  },
];

interface PhotoSectionPanelProps {
  store: StoreType;
}

export const PhotoSectionPanel: FC<PhotoSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const isEffectsMode = useTemplatesEditorStore.use.effectsMode();
    const unsplashImages = useTemplatesEditorStore.use.unsplashImages();
    const unsplashListMeta =
      useTemplatesEditorStore.use.unsplashImagesListMeta();
    const fetchUnsplashImages =
      useTemplatesEditorStore.use.fetchUnsplashImages();

    const [activeTabId, setActiveTabId] = useState<string>(PHOTO_TABS[0].id);

    const tabs = useMemo(
      () =>
        PHOTO_TABS.map((tab) => ({
          id: tab.id,
          icon: tab.icon,
          label: t(tab.labelKey) as string,
        })),
      [t]
    );

    const activeLabel = tabs.find((tab) => tab.id === activeTabId)?.label;

    const handleTabClick = (label: string) => {
      const id = tabs.find((tab) => tab.label === label)?.id;
      if (id) setActiveTabId(id);
    };

    const handleGetImages = useCallback(
      (params: { query: string; page: number; append?: boolean }) =>
        fetchUnsplashImages(params),
      [fetchUnsplashImages]
    );

    if (isEffectsMode) {
      return <PhotoEffectsPanel store={store} />;
    }

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden pt-5">
        <div className="box-border flex w-full flex-shrink-0 flex-col gap-3 px-5">
          <SidePanelSectionLabel
            label={t("templatesEditor.side_panel.headers.add_photo") as string}
            type="header"
          />
          <HorizontalTabs
            activeTab={activeLabel}
            tabs={tabs}
            onClick={handleTabClick}
          />
        </div>
        {activeTabId === "search" && (
          <SearchTab
            images={
              unsplashImages?.results?.map((image) => ({
                id: image.id,
                src: image.urls.regular,
              })) ?? null
            }
            meta={unsplashListMeta}
            store={store}
            onGetImages={handleGetImages}
            type="image"
          />
        )}
        {activeTabId === "upload" && <UploadPhotoTab store={store} />}
      </div>
    );
  }
);
