import type { FC } from "react";

import { ChevronDownIcon } from "@/shared/ui/icons";
import { useTranslation } from "@/shared/lib/translations";

interface ShowMoreButtonProps {
  readonly onClick: () => void;
  readonly label?: string;
}

export const ShowMoreButton: FC<ShowMoreButtonProps> = ({ onClick, label }) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-body-2 flex items-center gap-2 rounded-full border-2 border-black/10 bg-white px-6 py-3 font-medium text-black/87 transition-colors hover:bg-[var(--color-bg-light-grey)] md:hidden"
    >
      {label ?? t("hero.showMore")}
      <ChevronDownIcon className="text-current" />
    </button>
  );
};
