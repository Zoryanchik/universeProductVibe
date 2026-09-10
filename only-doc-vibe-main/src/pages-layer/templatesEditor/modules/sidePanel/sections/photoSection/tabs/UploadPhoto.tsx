import { useCallback, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import UploadList from "../../../../../components/uploadList/UploadList";
import type { UploadListImage } from "../../../../../model/element-types";
import { useAddElements } from "../../../../../helpers/addElements";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";
import { UploadTab as BaseUploadTab } from "../../common/tabs/upload/Upload";

interface UploadPhotoTabProps {
  store: StoreType;
  from?: "upload";
}

export const UploadPhotoTab: FC<UploadPhotoTabProps> = ({ store, from }) => {
  const { t } = useTranslation();
  const photos = useTemplatesEditorStore.use.uploadedPhotos();
  const addUploadedPhotos = useTemplatesEditorStore.use.addUploadedPhotos();
  const removeUploadedPhotos =
    useTemplatesEditorStore.use.removeUploadedPhotos();
  const showToast = useTemplatesEditorStore.use.showToast();

  const { addImageToCanvas } = useAddElements({ store, type: "image" });

  const handleRemovePhoto = useCallback(
    (images: UploadListImage[]) => {
      const ids = images.map((image) => image.id);
      showToast({
        id: "delete-photo",
        header: t(
          "templatesEditor.toasts.delete_confirmation_header"
        ) as string,
        content: t("templatesEditor.toasts.delete_files_content") as string,
        variant: "warning",
        button: {
          label: t("templatesEditor.common.delete") as string,
          onClick: () => removeUploadedPhotos(ids),
        },
      });
    },
    [showToast, removeUploadedPhotos, t]
  );

  const handlePhotoUpload = useCallback(
    (files: File[]) => {
      const photos = files.map((file) => ({
        id: crypto.randomUUID(),
        src: URL.createObjectURL(file),
      }));
      addUploadedPhotos(photos);
      addImageToCanvas(photos[0]);
    },
    [addUploadedPhotos, addImageToCanvas]
  );

  return (
    <BaseUploadTab
      tool="photo"
      from={from}
      maxSize={50}
      formats="jpg, jpeg, png, bmp, webp, heic, jfif, pdf"
      onFileUpload={handlePhotoUpload}
      count={photos.length}
      UploadList={
        <UploadList
          store={store}
          images={photos.map((photo) => ({ id: photo.id, src: photo.src }))}
          onDelete={handleRemovePhoto}
          type="image"
        />
      }
    />
  );
};
