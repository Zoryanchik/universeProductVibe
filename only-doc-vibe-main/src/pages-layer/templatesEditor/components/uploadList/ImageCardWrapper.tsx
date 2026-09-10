import { useCallback, memo, type FC } from "react";

import { ImageCard } from "../../ui/ImageCard";
import type { UploadListImage } from "./types";

interface ImageCardWrapperProps {
  image: UploadListImage;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDrop: (
    image: UploadListImage,
    position?: { x: number; y: number },
    targetElement?: unknown
  ) => void;
  onDelete?: (images: UploadListImage[]) => void;
  onClick?: (image: UploadListImage) => void;
  selectedImages?: UploadListImage[];
}

const ImageCardWrapperInner: FC<ImageCardWrapperProps> = ({
  image,
  selected,
  onSelect,
  onDrop,
  onDelete,
  onClick,
  selectedImages,
}) => {
  const handleDrop = useCallback(
    (position?: { x: number; y: number }, targetElement?: unknown) =>
      onDrop(image, position, targetElement),
    [image, onDrop]
  );

  const handleClick = useCallback(() => onClick?.(image), [image, onClick]);

  const handleDelete = useCallback(
    () => onDelete?.([image, ...(selectedImages ?? [])]),
    [image, onDelete, selectedImages]
  );

  return (
    <ImageCard
      src={image.src}
      selected={selected}
      onSelect={onSelect}
      onDrop={handleDrop}
      onDelete={onDelete ? handleDelete : undefined}
      onClick={onClick ? handleClick : undefined}
    />
  );
};

export const ImageCardWrapper = memo(ImageCardWrapperInner);
