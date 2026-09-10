import { observer } from "mobx-react-lite";
import { svgToURL } from "polotno/utils/svg";
import type { StoreType } from "polotno/model/store";
import { useMemo, useCallback, type FC, useEffect } from "react";
import { figureToSvg, TYPES } from "polotno/utils/figure-to-svg";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../../ui/SidePanelSectionLabel";
import UploadList from "../../../../../components/uploadList/UploadList";
import type { UploadListImage } from "../../../../../model/element-types";
import { ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE } from "../../../../../constants/colors";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";

const PREVIEW_SIZE = 300;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface ShapesSectionProps {
  store: StoreType;
}

const ShapesSection: FC<ShapesSectionProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const isMaskMode = useTemplatesEditorStore.use.maskImageMode();
  const setMaskImageMode = useTemplatesEditorStore.use.setMaskImageMode();

  const images: UploadListImage[] = useMemo(() => {
    const shapeTypes = Object.keys(TYPES);

    return shapeTypes.map((subType) => {
      const svgString = figureToSvg({
        subType,
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        fill: ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE,
        stroke: ELEMENT_DEFAULT_PRIMARY_COLOR_NON_VARIABLE,
        strokeWidth: 0,
      });

      return {
        id: subType,
        src: svgToURL(svgString),
        elementProps: { subType },
      };
    });
  }, []);

  const handleShapeClick = useCallback(
    (image: UploadListImage) => {
      const elements = store.selectedElements as unknown as AnyElement[];
      if (!elements.length) return;

      const subType = image.elementProps?.subType as string | undefined;
      if (!subType) return;

      const clipSvg = figureToSvg({
        subType,
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        fill: "black",
        stroke: "black",
        strokeWidth: 0,
      });

      elements.forEach((el: AnyElement) => {
        if (el.type === "image") {
          el.set({ clipSrc: svgToURL(clipSvg) });
        }
      });
    },
    [store]
  );

  useEffect(() => {
    return () => {
      setMaskImageMode(false);
    };
  }, [setMaskImageMode]);

  useEffect(() => {
    if (store.selectedElements.length === 0) {
      setMaskImageMode(false);
    }
  }, [setMaskImageMode, store.selectedElements]);

  return (
    <div className="box-border flex w-full flex-shrink-0 flex-col gap-4 px-5">
      <SidePanelSectionLabel
        label={t("templatesEditor.side_panel.headers.shapes") as string}
        type="sub-header"
      />
      <UploadList
        store={store}
        images={images}
        size="small"
        type={isMaskMode ? "custom" : "figure"}
        onClick={isMaskMode ? handleShapeClick : undefined}
      />
    </div>
  );
});

export default ShapesSection;
