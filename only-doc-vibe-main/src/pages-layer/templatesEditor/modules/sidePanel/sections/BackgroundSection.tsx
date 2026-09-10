import { useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";
import AdvancedColors from "../../../components/AdvancedColors";
import { useAddElements } from "../../../helpers/addElements";
import { BACKGROUND_PRESET_COLORS } from "../../../constants/colors";
import { useTemplatesEditorStore } from "../../../model/store/templates-editor-store";
import SearchTab from "./common/tabs/Search";

interface BackgroundSectionPanelProps {
  store: StoreType;
}

export const BackgroundSectionPanel: FC<BackgroundSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const unsplashImages = useTemplatesEditorStore.use.unsplashGradientImages();
    const unsplashListMeta =
      useTemplatesEditorStore.use.unsplashGradientImagesListMeta();
    const fetchUnsplashGradientImages =
      useTemplatesEditorStore.use.fetchUnsplashGradientImages();
    const { addImageToCanvas } = useAddElements({ store, type: "background" });

    const handleColorSelect = useCallback(
      (hex: string, isCustom?: boolean) => {
        const activeBackground = store.activePage?.background;
        if (activeBackground === hex && !isCustom) {
          store.activePage?.set({ background: "white" });

          return;
        }

        const preset = BACKGROUND_PRESET_COLORS.find((c) => c.hex === hex);
        addImageToCanvas({
          id: preset?.id ?? `custom-${hex}`,
          src: hex,
        });
      },
      [store, addImageToCanvas]
    );

    const handleGetImages = useCallback(
      (params: { query: string; page: number; append?: boolean }) =>
        fetchUnsplashGradientImages(params),
      [fetchUnsplashGradientImages]
    );

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden pt-5">
        <div className="box-border flex w-full flex-shrink-0 flex-col gap-3 px-5">
          <SidePanelSectionLabel
            label={
              t("templatesEditor.side_panel.headers.add_background") as string
            }
            type="header"
          />
        </div>
        <div className="px-[30px]">
          <AdvancedColors
            store={store}
            mode="overlay"
            onSelectColor={handleColorSelect}
            activeColor={store.activePage?.background}
          />
        </div>
        <SearchTab
          store={store}
          images={
            unsplashImages?.results?.map((image) => ({
              id: image.id,
              src: image.urls.regular,
            })) ?? null
          }
          meta={unsplashListMeta}
          onGetImages={handleGetImages}
          placeholder={
            t(
              "templatesEditor.side_panel.background.search_placeholder"
            ) as string
          }
          type="background"
        />
      </div>
    );
  }
);
