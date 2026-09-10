import type { StoreType } from "polotno/model/store";
import { useCallback, useState, type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { Card } from "../../../../../ui/Card";
import { IconButton } from "../../../../../ui/IconButton";
import { Checkbox } from "../../../../../ui/Checkbox";
import { DEFAULT_FONT } from "../../../../../constants/font";
import { useAddElements } from "../../../../../helpers/addElements";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";
import { UploadTab } from "../../common/tabs/upload/Upload";

interface UploadFontTabProps {
  store: StoreType;
  from?: "upload";
}

const getFontFamilyFromFile = (file: File): string => {
  const name = file.name.replace(/\.[^/.]+$/, "");

  return name.replace(/[-_]/g, " ");
};

export const UploadFontTab: FC<UploadFontTabProps> = ({ store, from }) => {
  const { t } = useTranslation();
  const fonts = useTemplatesEditorStore.use.uploadedFonts();
  const addUploadedFonts = useTemplatesEditorStore.use.addUploadedFonts();
  const removeUploadedFont = useTemplatesEditorStore.use.removeUploadedFont();
  const showToast = useTemplatesEditorStore.use.showToast();
  const [selectedFonts, setSelectedFonts] = useState<Set<string>>(new Set());

  const { addTextElement } = useAddElements({ store, type: "text" });

  const handleToggleSelect = useCallback(
    (fontFamily: string, checked: boolean) => {
      setSelectedFonts((prev) => {
        const next = new Set(prev);
        if (checked) {
          next.add(fontFamily);
        } else {
          next.delete(fontFamily);
        }

        return next;
      });
    },
    []
  );

  const handleRemoveFonts = useCallback(
    (fontsToRemove: { fontFamily: string; url: string }[]) => {
      showToast({
        id: "delete-font",
        header: t(
          "templatesEditor.toasts.delete_confirmation_header"
        ) as string,
        content: t("templatesEditor.toasts.delete_files_content") as string,
        variant: "warning",
        button: {
          label: t("templatesEditor.common.delete") as string,
          onClick: () => {
            const families = new Set(fontsToRemove.map((f) => f.fontFamily));

            store.history.transaction(() => {
              store.pages.forEach((page) => {
                page.children.forEach(
                  (child: {
                    type: string;
                    fontFamily: string;
                    set: (attrs: Record<string, unknown>) => void;
                  }) => {
                    if (
                      child.type === "text" &&
                      families.has(child.fontFamily)
                    ) {
                      child.set({ fontFamily: DEFAULT_FONT });
                    }
                  }
                );
              });
            });

            for (const { fontFamily, url } of fontsToRemove) {
              store.removeFont(fontFamily);

              document.fonts.forEach((fontFace) => {
                if (fontFace.family === fontFamily) {
                  document.fonts.delete(fontFace);
                }
              });

              URL.revokeObjectURL(url);
              removeUploadedFont(fontFamily);
            }

            setSelectedFonts(new Set());
          },
        },
      });
    },
    [store, showToast, removeUploadedFont, t]
  );

  const handleDeleteClick = useCallback(
    (fontFamily: string, url: string) => {
      if (selectedFonts.size > 0 && selectedFonts.has(fontFamily)) {
        const fontsToRemove = fonts.filter((f) =>
          selectedFonts.has(f.fontFamily)
        );
        handleRemoveFonts(fontsToRemove);
      } else {
        handleRemoveFonts([{ fontFamily, url }]);
      }
    },
    [selectedFonts, fonts, handleRemoveFonts]
  );

  const handleFontUpload = useCallback(
    async (files: File[]) => {
      const loaded: { fontFamily: string; url: string }[] = [];

      for (const file of files) {
        const fontFamily = getFontFamilyFromFile(file);
        const url = URL.createObjectURL(file);

        try {
          const fontFace = new FontFace(fontFamily, `url(${url})`);
          await fontFace.load();
          document.fonts.add(fontFace);
          store.addFont({ fontFamily, url });
          loaded.push({ fontFamily, url });
        } catch {
          URL.revokeObjectURL(url);
        }
      }

      if (loaded.length > 0) addUploadedFonts(loaded);
    },
    [store, addUploadedFonts]
  );

  return (
    <UploadTab
      tool="text"
      from={from}
      maxSize={10}
      formats="ttf, otf, woff, woff2"
      onFileUpload={handleFontUpload}
      count={fonts.length}
      UploadList={
        <div className="flex w-full flex-col gap-3 pt-1 [&>*]:h-[60px] [&>*]:min-h-[60px]">
          {fonts.map((font) => {
            const isSelected = selectedFonts.has(font.fontFamily);

            return (
              <Card
                key={font.fontFamily}
                borderRadius="small"
                onDrop={(position) =>
                  addTextElement(
                    {
                      text: font.fontFamily,
                      fontFamily: font.fontFamily,
                      fontSize: 44,
                    },
                    position
                  )
                }
                hoverVariant="fill"
                active={isSelected}
              >
                <div className="group relative box-border flex w-full items-center justify-center px-4 py-[18px]">
                  <Checkbox
                    className={cn(
                      "absolute start-[7px] transition-opacity",
                      isSelected
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                    )}
                    compact
                    checked={isSelected}
                    onChange={(checked) =>
                      handleToggleSelect(font.fontFamily, checked)
                    }
                  />
                  <span
                    className="text-center text-2xl leading-none whitespace-nowrap text-[var(--color-text-primary)]"
                    style={{ fontFamily: `'${font.fontFamily}', sans-serif` }}
                  >
                    {font.fontFamily}
                  </span>
                  <IconButton
                    className={cn(
                      "absolute end-2 transition-opacity",
                      isSelected
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                    )}
                    iconName="delete_forever"
                    onClick={() => handleDeleteClick(font.fontFamily, font.url)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      }
    />
  );
};
