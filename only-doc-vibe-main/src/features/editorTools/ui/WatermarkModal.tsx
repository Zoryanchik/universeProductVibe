import React, { useState } from "react";
import { Button, Input } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { useEditorActions } from "@/features/editor/@x/editor-tools";

import { ToolModal } from "./ToolModal";

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
];

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { addWatermark } = useEditorActions();

  const [text, setText] = useState("CONFIDENTIAL");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#888888");
  const [opacity, setOpacity] = useState(0.4);
  const [angle, setAngle] = useState(-30);

  const handleClear = () => {
    setText("");
  };

  const handleApply = () => {
    if (!text.trim()) return;

    addWatermark(text, {
      fontFamily,
      fontSize,
      fill: color,
      opacity,
      angle,
    });
    onClose();
  };

  return (
    <ToolModal
      isOpen={isOpen}
      onClose={onClose}
      title={String(t("editor_page.watermark_modal.title"))}
      width={520}
      footer={
        <>
          <Button
            type="button"
            variant="outlined"
            size="md"
            onClick={handleClear}
          >
            {String(t("editor_page.watermark_modal.clear"))}
          </Button>
          <Button type="button" size="md" onClick={handleApply}>
            {String(t("editor_page.watermark_modal.apply"))}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03] text-center"
          style={{
            color,
            opacity,
            fontFamily,
            fontSize: Math.min(fontSize, 36),
            transform: `rotate(${angle}deg)`,
          }}
        >
          {text || String(t("editor_page.watermark_modal.preview"))}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/70">
            {String(t("editor_page.watermark_modal.watermark_content"))}
          </label>
          <Input
            size="dense"
            bg="filled"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={String(
              t("editor_page.watermark_modal.text_placeholder")
            )}
            className="border-white/10 bg-[#2A2D33] text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              {String(t("editor_page.watermark_modal.font_family"))}
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33] px-3 text-sm text-white outline-none"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              {String(t("editor_page.watermark_modal.size"))}
            </label>
            <input
              type="number"
              min={8}
              max={144}
              value={fontSize}
              onChange={(e) =>
                setFontSize(Number.parseInt(e.target.value, 10) || 0)
              }
              className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33] px-3 text-sm text-white outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              {String(t("editor_page.watermark_modal.color"))}
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-[#2A2D33]"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/70">
                {String(t("editor_page.watermark_modal.opacity"))}
              </label>
              <span className="text-xs text-white/50">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number.parseFloat(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/70">
              {String(t("editor_page.watermark_modal.rotation_angle"))}
            </label>
            <span className="text-xs text-white/50">{angle}°</span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={angle}
            onChange={(e) => setAngle(Number.parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="flex gap-2">
            {[-90, -45, 0, 45, 90].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAngle(preset)}
                className="rounded border border-white/10 bg-[#2A2D33] px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
              >
                {preset}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolModal>
  );
};
