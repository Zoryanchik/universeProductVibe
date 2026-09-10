import { observer } from "mobx-react-lite";
import { useCallback, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { Checkbox } from "../../../../../ui/Checkbox";
import { Slider } from "../../../../../ui/Slider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface CornerRadiusEffectProps {
  store: StoreType;
}

export const CornerRadiusEffect: FC<CornerRadiusEffectProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const element = store.selectedElements[0] as AnyElement;
    const cornerRadius = element?.cornerRadius ?? 0;
    const enabled = cornerRadius > 0;

    const handleToggle = useCallback(
      (checked: boolean) => {
        element?.set({
          cornerRadius: checked ? element.cornerRadius || 12 : 0,
        });
      },
      [element]
    );

    const handleChange = useCallback(
      (value: number) => {
        element?.set({ cornerRadius: value });
      },
      [element]
    );

    return (
      <div className="flex w-full flex-col gap-1">
        <Checkbox
          checked={enabled}
          onChange={handleToggle}
          label={
            t(
              "templatesEditor.side_panel.controls.corner_radius_title"
            ) as string
          }
        />
        {enabled && (
          <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
            <Slider
              value={cornerRadius}
              min={0}
              max={100}
              onChange={handleChange}
            />
          </div>
        )}
      </div>
    );
  }
);
