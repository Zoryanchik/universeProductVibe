import React, { forwardRef } from "react";
import { cn } from "@universe-forma/ui-pes";

import { ChevronDownIcon } from "./ToolbarIcons";

interface ToolbarButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  hasMenu?: boolean;
  disabled?: boolean;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ label, icon, onClick, active, hasMenu, disabled }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "group flex h-14 min-w-[56px] shrink-0 flex-col items-center justify-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors",
        "text-white/75 hover:bg-white/10 hover:text-white",
        active && "bg-white/10 text-white",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
      )}
    >
      <span className="flex items-center gap-1">
        <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
        {hasMenu && (
          <span className="text-white/50 group-hover:text-white/80">
            <ChevronDownIcon />
          </span>
        )}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
);

ToolbarButton.displayName = "ToolbarButton";
