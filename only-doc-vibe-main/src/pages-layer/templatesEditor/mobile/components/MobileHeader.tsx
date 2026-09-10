import { type FC, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import logoOnlyDocMark from "@public/assets/header/Logo.svg?url";

import { useTranslation } from "@/shared/lib/translations";

import {
  useEditorActions,
  type ExportFormat,
  type RunExportOptions,
} from "../../helpers/useEditorActions";
import { ToolButton } from "../../ui/ToolButton";
import { DropdownMenu, type DropdownMenuOption } from "../../ui/DropdownMenu";
import HistoryButtons from "../../components/HistoryButtons";

const FORMAT_OPTIONS: DropdownMenuOption[] = [
  { label: "PDF", value: "pdf", iconName: "picture_as_pdf" },
  { label: "PNG", value: "png", iconName: "image" },
  { label: "JPG", value: "jpg", iconName: "image" },
];

interface MobileHeaderProps {
  store: StoreType;
  isExporting: boolean;
  onOpenMenu: () => void;
  runExport: (format: ExportFormat, options?: RunExportOptions) => void;
}

export const MobileHeader: FC<MobileHeaderProps> = observer(
  ({ store, isExporting, onOpenMenu, runExport }) => {
    const { t } = useTranslation();
    const { handleLogoClick } = useEditorActions({ store });
    const doneRef = useRef<HTMLDivElement>(null);
    const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);

    const handleSelectFormat = (value: string) => {
      setIsFormatMenuOpen(false);
      runExport(value as ExportFormat);
    };

    return (
      <header className="z-[4] flex shrink-0 items-center justify-between bg-[var(--color-material-grey-100)] ps-2 pe-4 pt-[calc(12px+env(safe-area-inset-top))] pb-2">
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0"
            aria-label="Only Doc"
          >
            <img src={logoOnlyDocMark} alt="Only Doc" className="size-8" />
          </button>
          <HistoryButtons
            canUndo={store.history.canUndo}
            canRedo={store.history.canRedo}
            undo={store.history.undo}
            redo={store.history.redo}
          />
        </div>
        <div className="flex items-center gap-2">
          <ToolButton icon="more_horiz" label="" onClick={onOpenMenu} />
          <div ref={doneRef}>
            <button
              type="button"
              onClick={() => setIsFormatMenuOpen((prev) => !prev)}
              disabled={isExporting}
              className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-secondary)] px-6 text-white disabled:opacity-60"
            >
              <span className="material-symbols-rounded text-[24px] leading-none [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_24]">
                check
              </span>
              <span className="font-[Outfit,sans-serif] text-[16px] leading-6 font-medium">
                {t("templatesEditor.ui.done") as string}
              </span>
            </button>
          </div>
          <DropdownMenu
            options={FORMAT_OPTIONS}
            isOpen={isFormatMenuOpen}
            anchorRef={doneRef}
            onSelect={handleSelectFormat}
            onClose={() => setIsFormatMenuOpen(false)}
            placement="bottom"
            minWidth={160}
          />
        </div>
      </header>
    );
  }
);
