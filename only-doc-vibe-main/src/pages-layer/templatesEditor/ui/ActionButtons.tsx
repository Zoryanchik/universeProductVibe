import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

import { Tooltip } from "./Tooltip";

interface ActionButtonsProps {
  actions: {
    iconName: string;
    visible?: boolean;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    hint?: string;
  }[];
}

const ActionButtons: FC<ActionButtonsProps> = ({ actions }) => {
  return (
    <div className="pointer-events-auto flex items-stretch overflow-hidden rounded-lg border border-[var(--color-action-stroke)]">
      {actions
        .filter((action) => action.visible ?? true)
        .map((action) => (
          <button
            key={action.iconName}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "group flex shrink-0 cursor-pointer items-center justify-center border-none bg-none p-2",
              "not-last:border-e not-last:border-[var(--color-action-stroke)]",
              "enabled:hover:bg-[var(--color-primary-opacity-12)]",
              "disabled:cursor-not-allowed disabled:opacity-40",
              action.active && "bg-[var(--color-primary-opacity-12)]"
            )}
          >
            <Tooltip
              key={action.iconName}
              content={action.hint}
              placement="top"
              offset={15}
            >
              <span
                className={cn(
                  "material-symbols-rounded text-2xl [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]",
                  "text-[var(--color-bg-dark)] group-enabled:group-hover:text-[var(--color-primary)]",
                  action.active && "text-[var(--color-primary)]"
                )}
              >
                {action.iconName}
              </span>
            </Tooltip>
          </button>
        ))}
    </div>
  );
};

export default ActionButtons;
