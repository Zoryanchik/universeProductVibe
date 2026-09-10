import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type FC,
  type PointerEvent,
} from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import {
  hsvToRgb,
  rgbToHsv,
  rgbToHex,
  hexToRgb,
  clamp,
  parseColorString,
  formatColor,
} from "../helpers/colors";

type EyeDropperResult = { sRGBHex: string };
type EyeDropperCtor = new () => { open: () => Promise<EyeDropperResult> };

const INPUT_BASE =
  "p-2 border border-[var(--color-action-stroke)] rounded-lg bg-[var(--color-bg-white-bg)] font-[Outfit,sans-serif] font-normal text-[16px] leading-[22px] text-[var(--color-text-primary)] text-center outline-none box-border focus:border-[var(--color-primary)]";
const INPUT_LABEL =
  "font-[Outfit,sans-serif] font-normal text-[16px] leading-[22px] text-black text-center";
const SLIDER_BAR_BASE = "absolute top-[6px] start-0 end-0 h-2 rounded-3xl";
const SLIDER_THUMB_BASE =
  "absolute top-1/2 w-4 h-4 rounded-full bg-white border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_1px_rgba(0,0,0,0.15)] -translate-x-1/2 -translate-y-1/2 pointer-events-none";

interface ColorPickerProps {
  initialColor?: string;
  onColorChange?: (hex: string) => void;
  showInputs?: boolean;
}

export const ColorPicker: FC<ColorPickerProps> = ({
  initialColor = "#FF0000",
  onColorChange,
  showInputs = true,
}) => {
  const { t } = useTranslation();
  const initParsed = parseColorString(initialColor) ?? {
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  };
  const initHsv = rgbToHsv(initParsed.r, initParsed.g, initParsed.b);

  const [hue, setHue] = useState(initHsv[0]);
  const [saturation, setSaturation] = useState(initHsv[1]);
  const [brightness, setBrightness] = useState(initHsv[2]);
  const [alpha, setAlpha] = useState(initParsed.a);

  const lastExternalColorRef = useRef(initialColor);
  const onColorChangeRef = useRef(onColorChange);
  onColorChangeRef.current = onColorChange;

  useEffect(() => {
    if (initialColor === lastExternalColorRef.current) return;

    lastExternalColorRef.current = initialColor;

    const parsed = parseColorString(initialColor);
    if (!parsed) return;

    const [h, s, v] = rgbToHsv(parsed.r, parsed.g, parsed.b);
    setHue(h);
    setSaturation(s);
    setBrightness(v);
    setAlpha(parsed.a);
  }, [initialColor]);

  const paletteRef = useRef<HTMLDivElement>(null);
  const hueTrackRef = useRef<HTMLDivElement>(null);
  const alphaTrackRef = useRef<HTMLDivElement>(null);

  const rgb = hsvToRgb(hue, saturation, brightness);
  const hexColor = rgbToHex(...rgb);
  const outputColor = formatColor(rgb[0], rgb[1], rgb[2], alpha);
  const hueOnlyHex = rgbToHex(...hsvToRgb(hue, 100, 100));

  useEffect(() => {
    lastExternalColorRef.current = outputColor;
    onColorChangeRef.current?.(outputColor);
  }, [outputColor]);

  const createDragHandler = useCallback(
    (
      update: (clientX: number, rect: DOMRect) => void,
      ref: React.RefObject<HTMLDivElement | null>
    ) =>
      (e: PointerEvent) => {
        e.preventDefault();
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        update(e.clientX, rect);

        const onMove = (ev: globalThis.PointerEvent) =>
          update(ev.clientX, rect);
        const onUp = () => {
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
        };

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
      },
    []
  );

  const handlePaletteDown = useCallback((e: PointerEvent) => {
    e.preventDefault();
    const el = paletteRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const update = (cx: number, cy: number) => {
      const s = clamp(((cx - rect.left) / rect.width) * 100, 0, 100);
      const v = clamp(100 - ((cy - rect.top) / rect.height) * 100, 0, 100);
      setSaturation(Math.round(s));
      setBrightness(Math.round(v));
    };

    update(e.clientX, e.clientY);

    const onMove = (ev: globalThis.PointerEvent) =>
      update(ev.clientX, ev.clientY);
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  }, []);

  const handleHueDown = createDragHandler((cx, rect) => {
    setHue(Math.round(clamp(((cx - rect.left) / rect.width) * 360, 0, 360)));
  }, hueTrackRef);

  const handleAlphaDown = createDragHandler((cx, rect) => {
    setAlpha(Math.round(clamp(((cx - rect.left) / rect.width) * 255, 0, 255)));
  }, alphaTrackRef);

  const handleHexInput = useCallback((value: string) => {
    const cleaned = value.replace(/[^a-fA-F0-9]/g, "").slice(0, 6);
    if (cleaned.length === 6) {
      const parsed = hexToRgb("#" + cleaned);
      if (parsed) {
        const [h, s, v] = rgbToHsv(...parsed);
        setHue(h);
        setSaturation(s);
        setBrightness(v);
      }
    }
  }, []);

  const handleRgbInput = useCallback(
    (channel: "r" | "g" | "b", value: string) => {
      const num = clamp(parseInt(value, 10) || 0, 0, 255);
      const newRgb: [number, number, number] = [...rgb];
      const idx = { r: 0, g: 1, b: 2 }[channel];
      newRgb[idx] = num;
      const [h, s, v] = rgbToHsv(...newRgb);
      setHue(h);
      setSaturation(s);
      setBrightness(v);
    },
    [rgb]
  );

  const handleAlphaInput = useCallback((value: string) => {
    setAlpha(clamp(parseInt(value, 10) || 0, 0, 255));
  }, []);

  const handleEyeDropper = useCallback(async () => {
    if (!("EyeDropper" in window)) return;

    try {
      document.documentElement.dataset.eyedropperActive = "";
      const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor })
        .EyeDropper;
      const dropper = new Ctor();
      const result = await dropper.open();
      delete document.documentElement.dataset.eyedropperActive;
      const picked = hexToRgb(result.sRGBHex);
      if (picked) {
        const [h, s, v] = rgbToHsv(...picked);
        setHue(h);
        setSaturation(s);
        setBrightness(v);
      }
    } catch {
      delete document.documentElement.dataset.eyedropperActive;
    }
  }, []);

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        ref={paletteRef}
        onPointerDown={handlePaletteDown}
        className="relative h-[178px] w-full cursor-crosshair touch-none rounded-lg select-none"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
        }}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_3px_rgba(0,0,0,0.5)]"
          style={{ left: `${saturation}%`, top: `${100 - brightness}%` }}
        />
      </div>

      <div className="flex w-full items-center gap-3">
        <button
          type="button"
          onClick={handleEyeDropper}
          title={t("templatesEditor.ui.eyedropper") as string}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-action-stroke)] bg-[var(--color-bg-white-bg)] p-2 outline-none hover:bg-[var(--color-bg-light-grey)]"
        >
          <span className="material-symbols-rounded text-2xl text-[var(--color-bg-dark)]">
            colorize
          </span>
        </button>

        <div
          className="h-8 w-8 shrink-0 rounded"
          style={{ backgroundColor: outputColor }}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div
            ref={hueTrackRef}
            onPointerDown={handleHueDown}
            className="relative h-5 w-full cursor-pointer touch-none select-none"
          >
            <div
              className={cn(
                SLIDER_BAR_BASE,
                "bg-[linear-gradient(to_right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))]"
              )}
            />
            <div
              className={SLIDER_THUMB_BASE}
              style={{ left: `${(hue / 360) * 100}%` }}
            />
          </div>

          <div
            ref={alphaTrackRef}
            onPointerDown={handleAlphaDown}
            className="relative h-5 w-full cursor-pointer touch-none select-none"
          >
            <div
              className={cn(
                SLIDER_BAR_BASE,
                "[background-image:linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] [background-size:8px_8px] [background-position:0_0,0_4px,4px_-4px,-4px_0]"
              )}
            />
            <div
              className={SLIDER_BAR_BASE}
              style={{
                background: `linear-gradient(to right, transparent, ${hueOnlyHex})`,
              }}
            />
            <div
              className={SLIDER_THUMB_BASE}
              style={{ left: `${(alpha / 255) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {showInputs && (
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex flex-col items-center gap-0.5">
            <input
              type="text"
              value={hexColor.replace("#", "")}
              onChange={(e) => handleHexInput(e.target.value)}
              maxLength={6}
              className={cn(INPUT_BASE, "w-[72px]")}
            />
            <span className={INPUT_LABEL}>Hex</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <input
              type="text"
              value={rgb[0]}
              onChange={(e) => handleRgbInput("r", e.target.value)}
              maxLength={3}
              className={cn(INPUT_BASE, "w-12")}
            />
            <span className={INPUT_LABEL}>R</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <input
              type="text"
              value={rgb[1]}
              onChange={(e) => handleRgbInput("g", e.target.value)}
              maxLength={3}
              className={cn(INPUT_BASE, "w-12")}
            />
            <span className={INPUT_LABEL}>G</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <input
              type="text"
              value={rgb[2]}
              onChange={(e) => handleRgbInput("b", e.target.value)}
              maxLength={3}
              className={cn(INPUT_BASE, "w-12")}
            />
            <span className={INPUT_LABEL}>B</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <input
              type="text"
              value={alpha}
              onChange={(e) => handleAlphaInput(e.target.value)}
              maxLength={3}
              className={cn(INPUT_BASE, "w-12")}
            />
            <span className={INPUT_LABEL}>A</span>
          </div>
        </div>
      )}
    </div>
  );
};
