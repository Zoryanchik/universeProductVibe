import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import type { ComponentType, FC, ReactNode } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { Card } from "../../../../../../../ui/Card";
import { useAddElements } from "../../../../../../../helpers/addElements";
import { SidePanelSectionLabel } from "../../../../../../../ui/SidePanelSectionLabel";
import type { TextPreset } from "../../../../../../../model/element-types";

export type { TextPreset } from "../../../../../../../model/element-types";

interface BasicTextSectionProps {
  store: StoreType;
}

const HeadingPreview: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-center [font-family:'Outfit',sans-serif] text-5xl leading-none font-extrabold text-[var(--color-text-primary)]">
    {children}
  </span>
);

const SubheadingPreview: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-center [font-family:'Outfit',sans-serif] text-[32px] leading-none font-semibold text-[var(--color-text-primary)]">
    {children}
  </span>
);

const ParagraphPreview: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-center [font-family:'Outfit',sans-serif] text-xl leading-none font-medium text-[var(--color-text-primary)]">
    {children}
  </span>
);

const PRESETS: {
  key: string;
  labelKey: string;
  preset: Omit<TextPreset, "text">;
  Preview: ComponentType<{ children: ReactNode }>;
}[] = [
  {
    key: "heading",
    labelKey: "templatesEditor.side_panel.text_presets.heading",
    preset: { fontSize: 76, fontWeight: "bold" },
    Preview: HeadingPreview,
  },
  {
    key: "subheading",
    labelKey: "templatesEditor.side_panel.text_presets.subheading",
    preset: { fontSize: 44, fontWeight: "bold" },
    Preview: SubheadingPreview,
  },
  {
    key: "paragraph",
    labelKey: "templatesEditor.side_panel.text_presets.paragraph",
    preset: { fontSize: 30 },
    Preview: ParagraphPreview,
  },
];

export const BasicTextSection: FC<BasicTextSectionProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const { addTextElement } = useAddElements({ store, type: "text" });

    return (
      <div className="box-border flex w-full flex-shrink-0 flex-col gap-4 px-5">
        <SidePanelSectionLabel
          label={t("templatesEditor.side_panel.headers.basic_text") as string}
          type="sub-header"
        />
        <div className="flex w-full flex-col gap-2 [&>*]:h-14 [&>*]:min-h-[56px]">
          {PRESETS.map(({ key, labelKey, preset, Preview }) => {
            const label = t(labelKey) as string;
            const fullPreset: TextPreset = { ...preset, text: label };

            return (
              <Card
                key={key}
                borderRadius="small"
                hoverVariant="fill"
                onDrop={(position) => addTextElement(fullPreset, position)}
              >
                <div className="flex flex-[1_0_0] items-center justify-center">
                  <Preview>{label}</Preview>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
);
