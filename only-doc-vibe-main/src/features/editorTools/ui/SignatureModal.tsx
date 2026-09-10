import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { useEditorActions } from "@/features/editor/@x/editor-tools";

import { ToolModal } from "./ToolModal";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "type" | "draw";

const SIGNATURE_FONTS = [
  "'Brush Script MT', cursive",
  "'Lucida Handwriting', cursive",
  "'Segoe Script', cursive",
  "cursive",
];

const renderTextToDataUrl = (
  text: string,
  color: string,
  font: string
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = `64px ${font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text || "Signature", canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
};

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { addSignature } = useEditorActions();
  const [mode, setMode] = useState<Mode>("type");

  // Type-mode state
  const [text, setText] = useState("Signature");
  const [font, setFont] = useState(SIGNATURE_FONTS[0]);
  const [color, setColor] = useState("#111111");

  // Draw-mode state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState("#111111");

  useEffect(() => {
    if (!isOpen) return;

    setMode("type");
  }, [isOpen]);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const clearDraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (mode !== "draw") return;

    clearDraw();
  }, [clearDraw, mode]);

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    drawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    drawingRef.current = false;
    getCtx()?.closePath();
  };

  const handleClear = () => {
    if (mode === "type") setText("");
    else clearDraw();
  };

  const handleAdd = () => {
    let dataUrl = "";
    if (mode === "type") {
      dataUrl = renderTextToDataUrl(text, color, font);
    } else {
      dataUrl = canvasRef.current?.toDataURL("image/png") ?? "";
    }

    if (!dataUrl) return;

    addSignature(dataUrl);
    onClose();
  };

  return (
    <ToolModal
      isOpen={isOpen}
      onClose={onClose}
      title={String(t("editor_page.signature_modal.title"))}
      width={560}
      footer={
        <>
          <Button
            type="button"
            variant="outlined"
            size="md"
            onClick={handleClear}
          >
            {String(t("editor_page.signature_modal.clear"))}
          </Button>
          <Button type="button" size="md" onClick={handleAdd}>
            {String(t("editor_page.signature_modal.add_to_document"))}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          role="tablist"
          className="flex rounded-lg border border-white/5 bg-[#2A2D33] p-1"
        >
          {[
            {
              id: "type" as Mode,
              label: String(t("editor_page.signature_modal.type_signature")),
            },
            {
              id: "draw" as Mode,
              label: String(t("editor_page.signature_modal.draw_signature")),
            },
          ].map((opt) => {
            const active = mode === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(opt.id)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white shadow"
                    : "text-white/60 hover:text-white"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {mode === "type" ? (
          <div className="space-y-3">
            <div
              className="flex h-28 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white text-3xl"
              style={{ color, fontFamily: font }}
            >
              {text ||
                String(t("editor_page.signature_modal.signature_placeholder"))}
            </div>
            <Input
              size="dense"
              bg="filled"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={String(
                t("editor_page.signature_modal.your_name_placeholder")
              )}
              className="border-white/10 bg-[#2A2D33] text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">
                  {String(t("editor_page.signature_modal.style"))}
                </label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33] px-3 text-sm text-white outline-none"
                >
                  {SIGNATURE_FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">
                  {String(t("editor_page.signature_modal.color"))}
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-[#2A2D33]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <canvas
              ref={canvasRef}
              width={500}
              height={180}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
              className="w-full cursor-crosshair touch-none rounded-lg border border-dashed border-white/10 bg-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white/70">
                    {String(t("editor_page.signature_modal.width"))}
                  </label>
                  <span className="text-xs text-white/50">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={strokeWidth}
                  onChange={(e) =>
                    setStrokeWidth(Number.parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">
                  {String(t("editor_page.signature_modal.color"))}
                </label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-[#2A2D33]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolModal>
  );
};
