import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  type FC,
} from "react";

import { useTranslation } from "@/shared/lib/translations";

import { ColorPicker } from "../../ui/ColorPicker";
import { HorizontalTabs } from "../../ui/HorizontalTabs";
import { Slider } from "../../ui/Slider";
import { GradientBar, type GradientStop } from "../../ui/GradientBar";
import { Colors } from "../../ui/Colors";
import { parseGradient, buildGradientString } from "./helpers";

const TAB_SOLID = "solid";
const TAB_LINEAR = "linear";

const TABS = [
  { id: TAB_SOLID, icon: "square", labelKey: "templatesEditor.toolbar.solid" },
  { id: TAB_LINEAR, icon: "gradient", labelKey: "templatesEditor.ui.linear" },
];

const PRESET_COLORS = [
  "#EF4401",
  "#FFB71D",
  "#FFF234",
  "#13AE5C",
  "#0B99FF",
  "#42219E",
  "#A801EF",
];

interface AdvancedColorPickerProps {
  onSelect: (value: string) => void;
  /**
   * How/where the picker is rendered:
   * - "overlay": desktop floating card (absolute, anchored to its trigger) with tabs, presets and hex inputs.
   * - "sheet": mobile bottom-sheet body (static, fills its portal container) with tabs but no presets/inputs.
   * - "plain": embedded inside a panel form (bare, no tabs/presets) with hex inputs.
   */
  mode: "overlay" | "sheet" | "plain";
  initialValue?: string;
  solidOnly?: boolean;
}

const AdvancedColorPicker: FC<AdvancedColorPickerProps> = ({
  onSelect,
  mode,
  initialValue,
  solidOnly,
}) => {
  const { t } = useTranslation();
  const parsed = useMemo(() => {
    if (!initialValue) return null;

    const gradient = parseGradient(initialValue);
    if (gradient) return { type: "gradient" as const, ...gradient };

    return { type: "solid" as const, color: initialValue };
  }, [initialValue]);

  const tabs = useMemo(
    () =>
      TABS.map((tab) => ({
        id: tab.id,
        icon: tab.icon,
        label: t(tab.labelKey) as string,
      })),
    [t]
  );

  const [activeTabId, setActiveTabId] = useState(
    parsed?.type === "gradient" ? TAB_LINEAR : TAB_SOLID
  );

  const activeLabel = tabs.find((tab) => tab.id === activeTabId)?.label;

  const derivedInitialColor = useMemo(() => {
    if (parsed?.type === "solid") return parsed.color;

    if (parsed?.type === "gradient")
      return parsed.stops?.[0]?.color ?? "#FF0000";

    return "#FF0000";
  }, [parsed]);

  const [currentColor, setCurrentColor] = useState(derivedInitialColor);

  useEffect(() => {
    setCurrentColor(derivedInitialColor);
  }, [derivedInitialColor]);

  const [angle, setAngle] = useState(
    parsed?.type === "gradient" ? (parsed.angle ?? 90) : 90
  );
  const [stops, setStops] = useState<GradientStop[]>(
    parsed?.type === "gradient" && parsed.stops
      ? parsed.stops
      : [
          { offset: 0, color: "#000000" },
          { offset: 1, color: "#FFFFFF" },
        ]
  );
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const lastGradientRef = useRef("");

  const emitGradient = useCallback(
    (a: number, s: GradientStop[]) => {
      const str = buildGradientString(a, s);
      if (str !== lastGradientRef.current) {
        lastGradientRef.current = str;
        onSelect(str);
      }
    },
    [onSelect]
  );

  const handleTabClick = useCallback(
    (label: string) => {
      const nextId = tabs.find((tab) => tab.label === label)?.id;
      if (!nextId || nextId === activeTabId) return;

      if (nextId === TAB_LINEAR && activeTabId === TAB_SOLID) {
        const updatedStops = stops.map((s, i) =>
          i === activeStopIndex ? { ...s, color: currentColor } : s
        );
        setStops(updatedStops);
        setActiveStopIndex(0);
        const str = buildGradientString(angle, updatedStops);
        lastGradientRef.current = str;
        onSelect(str);
      }

      if (nextId === TAB_SOLID && activeTabId === TAB_LINEAR) {
        const color = stops[activeStopIndex]?.color ?? currentColor;
        setCurrentColor(color);
        lastGradientRef.current = "";
        onSelect(color);
      }

      setActiveTabId(nextId);
    },
    [tabs, activeTabId, currentColor, stops, activeStopIndex, angle, onSelect]
  );

  const handleSolidColorChange = useCallback(
    (hex: string) => {
      setCurrentColor(hex);
      onSelect(hex);
    },
    [onSelect]
  );

  const handleGradientStopColorChange = useCallback(
    (hex: string) => {
      setStops((prev) => {
        const next = prev.map((s, i) =>
          i === activeStopIndex ? { ...s, color: hex } : s
        );
        emitGradient(angle, next);

        return next;
      });
    },
    [activeStopIndex, angle, emitGradient]
  );

  const handleStopsChange = useCallback(
    (newStops: GradientStop[]) => {
      setStops(newStops);
      emitGradient(angle, newStops);
    },
    [angle, emitGradient]
  );

  const handleAngleChange = useCallback(
    (value: number) => {
      setAngle(value);
      emitGradient(value, stops);
    },
    [stops, emitGradient]
  );

  const handlePresetColor = useCallback(
    (color: string) => {
      if (activeTabId === TAB_SOLID) {
        setCurrentColor(color);
        onSelect(color);
      } else {
        setStops((prev) => {
          const next = prev.map((s, i) =>
            i === activeStopIndex ? { ...s, color } : s
          );
          emitGradient(angle, next);

          return next;
        });
      }
    },
    [activeTabId, activeStopIndex, angle, emitGradient, onSelect]
  );

  const showInputs = mode !== "sheet";
  const showPresets = mode === "overlay";

  const renderContent = () => (
    <>
      {activeTabId === TAB_LINEAR && (
        <>
          <Slider
            label={t("templatesEditor.ui.angle") as string}
            value={angle}
            min={0}
            max={360}
            hideValue
            onChange={handleAngleChange}
          />
          <GradientBar
            stops={stops}
            activeStopIndex={activeStopIndex}
            onStopSelect={setActiveStopIndex}
            onStopsChange={handleStopsChange}
          />
        </>
      )}

      <ColorPicker
        initialColor={
          activeTabId === TAB_LINEAR
            ? stops[activeStopIndex]?.color
            : currentColor
        }
        onColorChange={
          activeTabId === TAB_LINEAR
            ? handleGradientStopColorChange
            : handleSolidColorChange
        }
        showInputs={showInputs}
      />

      {showPresets && (
        <Colors colors={PRESET_COLORS} onSelectColor={handlePresetColor} />
      )}
    </>
  );

  if (mode === "plain") {
    return <div className="flex w-full flex-col gap-3">{renderContent()}</div>;
  }

  const containerClassName =
    mode === "sheet"
      ? "flex w-full flex-col gap-3"
      : "absolute end-0 top-[calc(100%+8px)] z-[100] flex w-80 flex-col gap-3 rounded-[16px] bg-[var(--color-bg-white-bg)] p-4 shadow-[0_0_8px_3px_rgba(0,0,0,0.08)]";

  return (
    <div className={containerClassName}>
      {!solidOnly && (
        <HorizontalTabs
          tabs={tabs}
          activeTab={activeLabel}
          onClick={handleTabClick}
        />
      )}
      {renderContent()}
    </div>
  );
};

export default AdvancedColorPicker;
