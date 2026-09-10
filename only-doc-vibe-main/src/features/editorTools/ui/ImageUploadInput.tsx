import React, { forwardRef } from "react";

import { useEditorActions } from "@/features/editor/@x/editor-tools";

export const ImageUploadInput = forwardRef<HTMLInputElement>((_, ref) => {
  const { addImage } = useEditorActions();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        addImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleChange}
    />
  );
});

ImageUploadInput.displayName = "ImageUploadInput";
