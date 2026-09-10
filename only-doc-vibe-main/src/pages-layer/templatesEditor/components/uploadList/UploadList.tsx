import { useState, useCallback, memo, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { cn } from "@/shared/lib/utils/cn";

import { useAddElements } from "../../helpers/addElements";
import { LazySlot } from "./LazySlot";
import { ImageCardWrapper } from "./ImageCardWrapper";
import type { UploadListImage } from "./types";

export type { UploadListImage } from "./types";

interface UploadListProps {
  store: StoreType;
  images: UploadListImage[];
  onDelete?: (images: UploadListImage[]) => void;
  onClick?: (image: UploadListImage) => void;
  size?: "small" | "medium";
  type: "image" | "svg" | "line" | "figure" | "table" | "background" | "custom";
}

const UploadList: FC<UploadListProps> = memo(
  ({ type, store, images, onDelete, size = "medium", onClick }) => {
    const [selectedImages, setSelectedImages] = useState<UploadListImage[]>([]);

    const { addImageToCanvas } = useAddElements({ store, type });

    const handleDrop = useCallback(
      (
        image: UploadListImage,
        position?: { x: number; y: number },
        targetElement?: unknown
      ) => addImageToCanvas(image, position, targetElement),
      [addImageToCanvas]
    );

    const handleSelect = useCallback(
      (image: UploadListImage, selected: boolean) =>
        setSelectedImages((prev) =>
          selected ? [...prev, image] : prev.filter((i) => i.id !== image.id)
        ),
      []
    );

    return (
      <div
        className={cn(
          "grid w-full",
          size === "small" ? "grid-cols-4 gap-2" : "grid-cols-2 gap-1"
        )}
      >
        {images.map((image) => (
          <LazySlot key={image.id}>
            <ImageCardWrapper
              image={image}
              selected={
                onDelete
                  ? selectedImages.some((i) => i.id === image.id)
                  : image.checked
              }
              onSelect={
                onDelete ? (sel) => handleSelect(image, sel) : undefined
              }
              onDrop={handleDrop}
              onDelete={onDelete}
              onClick={onClick}
              selectedImages={onDelete ? selectedImages : undefined}
            />
          </LazySlot>
        ))}
      </div>
    );
  }
);

export default UploadList;
