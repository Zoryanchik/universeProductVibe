import React, { useEffect, useRef, useState } from "react";
import { cn } from "@universe-forma/ui-pes";

export interface ToolbarMenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
}

interface ToolbarMenuProps {
  trigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    isOpen: boolean;
  }) => React.ReactNode;
  items: ToolbarMenuItem[];
  align?: "left" | "right";
}

const MENU_WIDTH = 180;

export const ToolbarMenu: React.FC<ToolbarMenuProps> = ({
  trigger,
  items,
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const rawLeft = align === "right" ? rect.right - MENU_WIDTH : rect.left;
      positionRef.current = {
        top: rect.bottom + 4,
        left: Math.max(
          8,
          Math.min(rawLeft, window.innerWidth - MENU_WIDTH - 8)
        ),
      };
    }

    setIsOpen((s) => !s);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    menuRef.current.style.top = `${positionRef.current.top}px`;
    menuRef.current.style.left = `${positionRef.current.left}px`;
  }, [isOpen]);

  return (
    <div className="relative">
      {trigger({
        ref: triggerRef,
        onClick: openMenu,
        isOpen,
      })}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "fixed z-[1100] min-w-[180px] overflow-hidden rounded-lg border border-white/10 bg-[#2A2D33] py-1 shadow-xl"
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              {item.icon && (
                <span className="flex h-4 w-4 items-center">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
