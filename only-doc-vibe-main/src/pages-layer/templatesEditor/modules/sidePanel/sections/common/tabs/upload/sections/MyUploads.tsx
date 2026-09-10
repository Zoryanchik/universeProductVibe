import type { ReactNode } from "react";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import throttle from "lodash/throttle";

import { useTranslation } from "@/shared/lib/translations";

import { CustomScrollArea } from "../../../../../../../ui/CustomScrollArea";

const SCROLL_END_THRESHOLD_PX = 50;

export interface MyUploadsSectionProps {
  uploadLabel?: string;
  count: number | string;
  UploadList?: ReactNode;
  onScrollEnd?: () => void;
}

export const MyUploadsSection = forwardRef<
  HTMLDivElement,
  MyUploadsSectionProps
>(function MyUploadsSection(
  { uploadLabel, count, UploadList, onScrollEnd },
  ref
) {
  const { t } = useTranslation();
  const resolvedUploadLabel =
    uploadLabel ??
    (t("templatesEditor.side_panel.upload.my_uploads") as string);
  const onScrollEndRef = useRef(onScrollEnd);
  onScrollEndRef.current = onScrollEnd;

  const internalRef = useRef<HTMLDivElement | null>(null);

  const handleScrollThrottled = useMemo(
    () =>
      throttle(() => {
        const el = internalRef.current;
        if (!el) return;

        const reachedEnd =
          el.scrollTop + el.clientHeight >=
          el.scrollHeight - SCROLL_END_THRESHOLD_PX;
        if (reachedEnd) {
          onScrollEndRef.current?.();
        }
      }, 200),
    []
  );

  useEffect(
    () => () => handleScrollThrottled.cancel(),
    [handleScrollThrottled]
  );

  const setRefs = (el: HTMLDivElement | null) => {
    internalRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <div className="box-border flex h-[18px] w-full flex-shrink-0 items-center justify-between px-5">
        <span className="[font-family:'Outfit',sans-serif] text-sm leading-[18px] font-normal text-[var(--color-text-primary)]">
          {resolvedUploadLabel}
        </span>
        <span className="[font-family:'Outfit',sans-serif] text-[13px] leading-4 font-semibold text-[var(--color-text-primary)]">
          {count}
        </span>
      </div>
      <CustomScrollArea
        viewportRef={setRefs}
        onScroll={onScrollEnd ? handleScrollThrottled : undefined}
        className="min-h-0 flex-1"
      >
        <div className="px-5 pb-6">{UploadList}</div>
      </CustomScrollArea>
    </div>
  );
});
