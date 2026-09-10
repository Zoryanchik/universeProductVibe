import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type FC, type ReactNode } from "react";

export const PopoverLabel: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="m-0 font-[Outfit,sans-serif] text-[16px] leading-[22px] font-medium text-[var(--color-text-primary)]">
    {children}
  </p>
);

interface ToolbarPopoverProps {
  label?: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  offset?: number;
}

export const ToolbarPopover: FC<ToolbarPopoverProps> = ({
  label,
  children,
  isOpen,
  onClose,
  anchorRef,
  offset = 10,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    if (!isOpen) {
      setCoords(null);

      return;
    }

    if (!anchorRef.current || !popoverRef.current) return;

    const anchor = anchorRef.current.getBoundingClientRect();
    const popover = popoverRef.current.getBoundingClientRect();

    const MARGIN = 8;
    // Flip above the anchor when there isn't room below (e.g. a bottom toolbar).
    const overflowsBelow =
      anchor.bottom + offset + popover.height > window.innerHeight - MARGIN;
    const top = overflowsBelow
      ? Math.max(MARGIN, anchor.top - popover.height - offset)
      : anchor.bottom + offset;

    const rawLeft = anchor.left + anchor.width / 2 - popover.width / 2;
    const left = Math.max(
      MARGIN,
      Math.min(rawLeft, window.innerWidth - popover.width - MARGIN)
    );

    setCoords({ left, top });
  }, [isOpen, anchorRef, offset]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[1000] flex flex-col gap-1 rounded-2xl bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0_0_8px_3px_var(--color-action-8)]"
      style={
        coords
          ? { top: coords.top, left: coords.left }
          : { visibility: "hidden" }
      }
    >
      {label && <PopoverLabel>{label}</PopoverLabel>}
      {children}
    </div>,
    document.body
  );
};
