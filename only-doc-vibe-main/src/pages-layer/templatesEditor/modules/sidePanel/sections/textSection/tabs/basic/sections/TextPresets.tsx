import type { FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { Card } from "../../../../../../../ui/Card";
import { SidePanelSectionLabel } from "../../../../../../../ui/SidePanelSectionLabel";
import { CustomScrollArea } from "../../../../../../../ui/CustomScrollArea";
import { LazySlot } from "../../../../../../../components/uploadList/LazySlot";
import { useAddElements } from "../../../../../../../helpers/addElements";
import { useTemplatesEditorStore } from "../../../../../../../model/store/templates-editor-store";

interface TextPresetsSectionProps {
  store: StoreType;
}

export const TextPresetsSection: FC<TextPresetsSectionProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const textTemplates = useTemplatesEditorStore.use.textTemplates();
    const items = textTemplates?.items ?? [];
    const { addTextPresetElement } = useAddElements({ store, type: "text" });

    if (items.length === 0) return null;

    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="flex-shrink-0 px-5 pb-4">
          <SidePanelSectionLabel
            label={
              t("templatesEditor.side_panel.headers.text_presets") as string
            }
            type="sub-header"
          />
        </div>
        <CustomScrollArea className="min-h-0 w-full flex-1">
          <div className="flex flex-col">
            <div className="box-border grid w-full grid-cols-2 gap-2 px-5">
              {items.map((item, index) => (
                <LazySlot key={index}>
                  <Card
                    borderRadius="large"
                    onDrop={(position) => addTextPresetElement(item, position)}
                  >
                    <div className="flex min-h-[180px] flex-[1_0_0] flex-col items-center justify-center overflow-hidden p-1">
                      <img
                        src={item.preview}
                        alt={
                          t(
                            "templatesEditor.side_panel.text_presets.preview_alt"
                          ) as string
                        }
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </Card>
                </LazySlot>
              ))}
            </div>
          </div>
        </CustomScrollArea>
      </div>
    );
  }
);
