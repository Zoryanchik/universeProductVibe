import { useCallback, useRef, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../ui/IconButton";
import { Tooltip } from "../../../../ui/Tooltip";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface CropSnapshot {
  x: number;
  y: number;
  width: number;
  height: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

interface CropToolbarProps {
  store: StoreType;
}

export const CropToolbar: FC<CropToolbarProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const element = store.selectedElements[0] as AnyElement;
  const snapshotRef = useRef<CropSnapshot | null>(null);

  if (element && !snapshotRef.current) {
    snapshotRef.current = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      cropX: element.cropX,
      cropY: element.cropY,
      cropWidth: element.cropWidth,
      cropHeight: element.cropHeight,
    };
  }

  const handleDone = useCallback(() => {
    if (element) {
      element.toggleCropMode(false);
    }

    snapshotRef.current = null;
  }, [element]);

  const handleCancel = useCallback(() => {
    if (element && snapshotRef.current) {
      element.set(snapshotRef.current);
    }

    if (element) {
      element.toggleCropMode(false);
    }

    snapshotRef.current = null;
  }, [element]);

  return (
    <div className="flex w-full items-center justify-center rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
      <div className="flex items-center gap-2">
        <Tooltip content={t("templatesEditor.toolbar.apply_crop") as string}>
          <IconButton iconName="done" onClick={handleDone} />
        </Tooltip>
        <Tooltip content={t("templatesEditor.toolbar.cancel_crop") as string}>
          <IconButton iconName="close" onClick={handleCancel} />
        </Tooltip>
      </div>
    </div>
  );
});
