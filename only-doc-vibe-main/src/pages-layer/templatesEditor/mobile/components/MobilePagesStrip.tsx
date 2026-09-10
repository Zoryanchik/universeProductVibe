import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { PagePreview } from "../../components/PagePreview";
import { useScrollToElement } from "../../helpers/scrollToElement";

interface MobilePagesStripProps {
  store: StoreType;
}

/** Horizontal page manager for mobile: reuses desktop `PagePreview` + add-page. */
export const MobilePagesStrip: FC<MobilePagesStripProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const { navigate } = useScrollToElement({ store });

    const handleAddPage = () => {
      const reference = store.activePage ?? store.pages[store.pages.length - 1];
      const newPage = store.addPage({
        width: reference?.width ?? 1240,
        height: reference?.height ?? 1754,
        bleed: reference?.bleed || 0,
      });
      navigate(newPage.id);
    };

    return (
      <div className="flex items-stretch gap-3 overflow-x-auto px-5 py-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {store.pages.map((page, index) => (
          <PagePreview
            key={page.id}
            page={page}
            store={store}
            index={index}
            isSelected={page.id === store.activePage?.id}
            onNavigate={navigate}
          />
        ))}
        <button
          type="button"
          onClick={handleAddPage}
          className="flex h-[162px] w-[120px] shrink-0 flex-col items-center justify-center gap-1 rounded-[4px] border border-dashed border-[#6d7580] bg-[var(--color-bg-white-bg)] text-[var(--color-text-secondary)]"
        >
          <span className="material-symbols-rounded text-[28px] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]">
            add
          </span>
          <span className="font-[Outfit,sans-serif] text-[14px]">
            {t("templatesEditor.ui.page.add_page") as string}
          </span>
        </button>
      </div>
    );
  }
);
