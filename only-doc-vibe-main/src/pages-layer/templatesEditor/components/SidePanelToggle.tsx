import type { FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { Tooltip } from "../ui/Tooltip";

interface SidePanelToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const SidePanelToggle: FC<SidePanelToggleProps> = ({
  isExpanded,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      content={t("templatesEditor.ui.close_sidebar") as string}
      placement="right"
      offset={20}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          isExpanded
            ? (t("templatesEditor.ui.collapse_side_panel") as string)
            : (t("templatesEditor.ui.expand_side_panel") as string)
        }
        className="absolute end-[-14px] top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border border-[rgba(0,0,0,0.15)] bg-white px-1 py-4 shadow-[0px_6px_12px_-2px_rgba(0,0,0,0.08),0px_8px_40px_rgba(0,0,0,0.08)] outline-none hover:bg-[rgba(255,255,255,0.92)]"
      >
        <span className="material-symbols-rounded text-xl text-[rgba(0,0,0,0.48)] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_20]">
          {isExpanded ? "chevron_left" : "chevron_right"}
        </span>
      </button>
    </Tooltip>
  );
};
