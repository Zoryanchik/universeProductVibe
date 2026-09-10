import { type FC, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import logoOnlyDocDark from "@public/assets/header/logo-only-doc-dark.svg?url";

import { useTranslation } from "@/shared/lib/translations";

import {
  useEditorActions,
  type ExportFormat,
} from "../helpers/useEditorActions";
import { ToolButton } from "../ui/ToolButton";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/TextInput";
import { DropdownMenu, type DropdownMenuOption } from "../ui/DropdownMenu";
import HistoryButtons from "../components/HistoryButtons";

const FORMAT_OPTIONS: DropdownMenuOption[] = [
  { label: "PDF", value: "pdf", iconName: "picture_as_pdf" },
  { label: "PNG", value: "png", iconName: "image" },
  { label: "JPG", value: "jpg", iconName: "image" },
];

interface EditorHeaderProps {
  store: StoreType;
}

export const EditorHeader: FC<EditorHeaderProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const {
    templateName,
    isExporting,
    handleLogoClick,
    handleFileNameChange,
    handlePrint,
    runExport,
  } = useEditorActions({ store });

  const doneRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const [formatMenuAnchor, setFormatMenuAnchor] =
    useState<React.RefObject<HTMLDivElement | null> | null>(null);

  const handleSelectFormat = (value: string) => {
    const isShare = formatMenuAnchor === shareRef;
    setFormatMenuAnchor(null);
    runExport(value as ExportFormat, { share: isShare });
  };

  const handleDone = () => {
    setFormatMenuAnchor(doneRef);
  };

  const handleShare = () => {
    setFormatMenuAnchor(shareRef);
  };

  return (
    <div className="box-border flex h-[68px] w-full items-center justify-between px-4 py-2 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center border-none bg-transparent p-0 pe-2"
        >
          <img src={logoOnlyDocDark} alt="Only Doc" className="h-8 w-auto" />
        </button>

        <TextInput
          value={templateName}
          onChange={handleFileNameChange}
          placeholder={t("templatesEditor.ui.file_name") as string}
          icon="edit"
        />

        <HistoryButtons
          canUndo={store.history.canUndo}
          canRedo={store.history.canRedo}
          undo={store.history.undo}
          redo={store.history.redo}
        />
      </div>

      <div className="flex items-center gap-2">
        <ToolButton
          icon="print"
          label={t("templatesEditor.ui.print") as string}
          onClick={handlePrint}
        />

        <div ref={shareRef}>
          <ToolButton
            icon="share"
            label={t("templatesEditor.ui.share") as string}
            onClick={handleShare}
            disabled={isExporting}
          />
        </div>

        <div className="mx-1 h-8 w-px bg-[rgba(0,0,0,0.14)]" />

        <div ref={doneRef}>
          <Button
            onClick={handleDone}
            icon="check"
            size="lg"
            disabled={isExporting}
          >
            {t("templatesEditor.ui.done") as string}
          </Button>
        </div>

        <DropdownMenu
          options={FORMAT_OPTIONS}
          isOpen={!!formatMenuAnchor}
          anchorRef={formatMenuAnchor ?? doneRef}
          onSelect={handleSelectFormat}
          onClose={() => setFormatMenuAnchor(null)}
          placement="bottom"
          minWidth={160}
        />
      </div>
    </div>
  );
});
