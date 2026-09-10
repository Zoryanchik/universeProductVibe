import { observer } from "mobx-react-lite";
import { type FC, useRef, useState } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { Button } from "../../../ui/Button";
import { useAddElements } from "../../../helpers/addElements";
import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";
import {
  SignatureCanvas,
  type SignatureCanvasHandle,
} from "../../../components/SignatureCanvas";

interface SignatureSectionProps {
  store: StoreType;
}

export const SignatureSection: FC<SignatureSectionProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<SignatureCanvasHandle>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const { addImageToCanvas } = useAddElements({ store, type: "image" });

    const handleClear = () => {
      canvasRef.current?.clear();
      setIsEmpty(true);
    };

    const handleAddToCanvas = async () => {
      if (!canvasRef.current || isEmpty) return;

      try {
        const canvas = canvasRef.current.getCanvas();
        if (!canvas || canvas.width === 0 || canvas.height === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas;
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 0) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (maxX < minX) return;

        const padding = 10;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(width, maxX + padding + 1) - cropX;
        const cropH = Math.min(height, maxY + padding + 1) - cropY;

        const svgDataURL = canvasRef.current.toSvgDataURL();
        if (!svgDataURL) return;

        const svgBase64 = svgDataURL.split(",")[1];
        let svgString = atob(svgBase64);
        svgString = svgString
          .replace(/width="[^"]*"/, `width="${cropW}"`)
          .replace(/height="[^"]*"/, `height="${cropH}"`)
          .replace(
            /viewBox="[^"]*"/,
            `viewBox="${cropX} ${cropY} ${cropW} ${cropH}"`
          );

        const croppedSvgDataURL =
          "data:image/svg+xml;base64," + btoa(svgString);

        const page = store.activePage || store.pages[0];
        if (!page) return;

        const element = await addImageToCanvas({
          id: "signature",
          src: croppedSvgDataURL,
        });

        if (element) {
          store.selectElements([element.id]);
        }
      } catch (error) {
        console.error("Error adding signature to canvas:", error);
      }
    };

    const handleBegin = () => {
      setIsEmpty(false);
    };

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-6 px-5 pt-5">
        <SidePanelSectionLabel
          label={
            t("templatesEditor.side_panel.headers.add_signature") as string
          }
          type="header"
        />
        <div className="flex w-full flex-col items-center gap-9">
          <SignatureCanvas ref={canvasRef} onBegin={handleBegin} />
          <div className="flex w-full gap-[10px] [&>button]:min-w-0 [&>button]:flex-1">
            <Button variant="outlined" onClick={handleClear} disabled={isEmpty}>
              {t("templatesEditor.side_panel.signature.clear")}
            </Button>
            <Button onClick={handleAddToCanvas} disabled={isEmpty}>
              {t("templatesEditor.side_panel.signature.add_to_page")}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
