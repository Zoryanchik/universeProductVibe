import type { FC, ReactNode } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

interface TagProps {
  label: string;
  onDelete?: () => void;
  className?: string;
}

export const TagsContainer: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "mb-5 box-border flex w-full shrink-0 flex-wrap items-center gap-2 px-5 py-0.5",
      className
    )}
  >
    {children}
  </div>
);

export const Tag: FC<TagProps> = ({ label, onDelete, className }) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={cn(
        "group flex min-h-8 cursor-pointer items-center gap-1 rounded-xl border-none bg-[var(--color-primary-dark)] py-[6px] ps-[10px] pe-[6px] whitespace-nowrap text-white hover:bg-[var(--color-primary)]",
        className
      )}
      onClick={onDelete}
      aria-label={t("templatesEditor.ui.remove_item", { label }) as string}
    >
      <span className="font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal text-inherit">
        {label}
      </span>
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[var(--color-primary-dark)] group-hover:text-[var(--color-primary)]">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </span>
    </button>
  );
};
