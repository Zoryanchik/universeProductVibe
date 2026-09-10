import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useState, useRef, useEffect, useCallback, type FC } from "react";

import { BACKGROUND_PRESET_COLORS } from "../constants/colors";
import { Colors } from "../ui/Colors";
import AdvancedColorPicker from "./advancedColorPicker/AdvancedColorPicker";

interface AdvancedColorsProps {
  store: StoreType;
  mode: "overlay" | "plain";
  onSelectColor: (color: string, isCustom?: boolean) => void;
  pickerInitialValue?: string;
  activeColor?: string;
}

const PRESET_HEX_COLORS = BACKGROUND_PRESET_COLORS.map((c) => c.hex);

const AdvancedColors: FC<AdvancedColorsProps> = observer(
  ({ store, mode, onSelectColor, pickerInitialValue, activeColor }) => {
    const activeBackground = store.activePage?.background;
    const [showPicker, setShowPicker] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!showPicker || mode === "plain") return;

      const handleClickOutside = (e: globalThis.MouseEvent) => {
        if ("eyedropperActive" in document.documentElement.dataset) return;

        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setShowPicker(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [showPicker, mode]);

    const handlePresetSelect = useCallback(
      (color: string) => {
        setShowPicker(false);
        onSelectColor(color, false);
      },
      [onSelectColor]
    );

    const handlePickerSelect = useCallback(
      (color: string) => onSelectColor(color, true),
      [onSelectColor]
    );

    const handleTogglePicker = useCallback(
      () => setShowPicker((prev) => !prev),
      []
    );

    return (
      <div
        ref={rootRef}
        className="relative box-border flex flex-col gap-2 rounded-[16px] py-5"
      >
        <Colors
          colors={PRESET_HEX_COLORS}
          activeColor={activeColor}
          onSelectColor={handlePresetSelect}
          onClickAddColor={handleTogglePicker}
        />
        {showPicker && (
          <AdvancedColorPicker
            mode={mode}
            initialValue={pickerInitialValue ?? activeBackground}
            onSelect={handlePickerSelect}
          />
        )}
      </div>
    );
  }
);

export default AdvancedColors;
