import { type ChangeEvent, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { BottomSheet } from "./BottomSheet";

interface MobileOverflowMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  isExporting: boolean;
  onFileNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPrint: () => void;
  onShare: () => void;
}

interface ActionRowProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionRow: FC<ActionRowProps> = ({ icon, label, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start hover:bg-black/[0.04] disabled:opacity-50"
  >
    <span className="material-symbols-rounded text-[24px] text-[var(--color-text-primary)] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]">
      {icon}
    </span>
    <span className="font-[Outfit,sans-serif] text-[16px] text-[var(--color-text-primary)]">
      {label}
    </span>
  </button>
);

export const MobileOverflowMenu: FC<MobileOverflowMenuProps> = ({
  open,
  onOpenChange,
  templateName,
  isExporting,
  onFileNameChange,
  onPrint,
  onShare,
}) => {
  const { t } = useTranslation();

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} backdrop>
      <div className="flex flex-col gap-4 px-5 pt-2 pb-6">
        <label className="flex flex-col gap-2">
          <span className="font-[Outfit,sans-serif] text-[14px] font-medium text-[var(--color-text-secondary)]">
            {t("templatesEditor.mobile.file_name") as string}
          </span>
          <input
            type="text"
            value={templateName}
            onChange={onFileNameChange}
            placeholder={t("templatesEditor.ui.file_name") as string}
            className="box-border w-full rounded-[10px] border border-[rgba(0,0,0,0.14)] px-3 py-3 font-[Outfit,sans-serif] text-[16px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-opacity-50)]"
          />
        </label>

        <div className="h-px w-full bg-black/[0.08]" />

        <div className="flex flex-col">
          <ActionRow
            icon="print"
            label={t("templatesEditor.ui.print") as string}
            onClick={onPrint}
          />
          <ActionRow
            icon="share"
            label={t("templatesEditor.ui.share") as string}
            onClick={onShare}
            disabled={isExporting}
          />
        </div>
      </div>
    </BottomSheet>
  );
};
