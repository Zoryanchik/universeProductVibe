import { type FC, type ReactNode, type PointerEvent } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";

import { MOBILE_SHEET_MAX_HEIGHT_DVH } from "../../constants/sizes";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  maxHeight?: string;
  bottomOffset?: number;
  backdrop?: boolean;
  children: ReactNode;
}

/**
 * In-layout bottom sheet. By default it's rendered within the editor's stacking
 * context (not a portal/modal), so the tab bar beneath it stays interactive —
 * letting the user switch tools while a sheet is open. Pass `backdrop` to make it
 * modal instead. Slide + drag-to-dismiss via framer-motion.
 */
export const BottomSheet: FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  title,
  maxHeight = `${MOBILE_SHEET_MAX_HEIGHT_DVH}dvh`,
  bottomOffset = 0,
  backdrop = false,
  children,
}) => {
  const dragControls = useDragControls();

  const startDrag = (event: PointerEvent) => {
    dragControls.start(event);
  };

  return (
    <AnimatePresence>
      {open && backdrop && (
        <motion.div
          key="mobile-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-[49] bg-black/20"
        />
      )}
      {open && (
        <motion.div
          key="mobile-sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 600) {
              onOpenChange(false);
            }
          }}
          className="absolute inset-x-0 z-[50] flex flex-col rounded-t-[20px] bg-[var(--color-bg-white-bg)] shadow-[0_-8px_32px_rgba(0,0,0,0.18)]"
          style={{
            bottom: bottomOffset
              ? `calc(${bottomOffset}px + env(safe-area-inset-bottom))`
              : 0,
            maxHeight,
          }}
        >
          <div
            onPointerDown={startDrag}
            className="flex shrink-0 cursor-grab touch-none justify-center pt-2 pb-1"
          >
            <div className="h-1.5 w-10 rounded-full bg-black/[0.18]" />
          </div>
          {title && (
            <div className="shrink-0 px-4 pt-2 pb-3">
              <h3 className="m-0 text-center font-[Outfit,sans-serif] text-[18px] font-bold text-[var(--color-text-primary)]">
                {title}
              </h3>
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[env(safe-area-inset-bottom)] [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
