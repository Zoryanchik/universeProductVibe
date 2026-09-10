import React, { useMemo } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { useEditorActions } from "@/features/editor";
import type { EditorSelectedElement } from "@/features/editor";

import { toColorInputValue } from "../lib/color-utils";

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
] as const;

const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64,
] as const;

const LINE_HEIGHT_OPTIONS = [1, 1.16, 1.3, 1.5, 1.75, 2, 2.5, 3] as const;

const CHAR_SPACING_OPTIONS = [
  0, 50, 100, 150, 200, 300, 400, 600, 800,
] as const;

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface TextElementPropertiesPanelProps {
  readonly element: EditorSelectedElement;
}

export const TextElementPropertiesPanel: React.FC<
  TextElementPropertiesPanelProps
> = ({ element }) => {
  const { t } = useTranslation();
  const actions = useEditorActions();

  const fontSize = element.fontSize ?? 14;
  const lineHeight = element.lineHeight ?? 1.16;
  const charSpacing = element.charSpacing ?? 0;
  const curvature = element.curvature ?? 151;
  const isCurved = element.isArcText;
  const textFill = element.fill ?? "#000000";
  const highlight = element.textBackgroundColor ?? "";

  const lineHeightOptions = useMemo(() => {
    const values = new Set<number>(LINE_HEIGHT_OPTIONS);
    values.add(lineHeight);

    return Array.from(values).sort((a, b) => a - b);
  }, [lineHeight]);

  const charSpacingOptions = useMemo(() => {
    const values = new Set<number>(CHAR_SPACING_OPTIONS);
    values.add(charSpacing);

    return Array.from(values).sort((a, b) => a - b);
  }, [charSpacing]);

  const fontSizeOptions = useMemo(() => {
    const values = new Set<number>(FONT_SIZES);
    values.add(fontSize);

    return Array.from(values).sort((a, b) => a - b);
  }, [fontSize]);

  const adjustFontSize = (delta: number) => {
    const next = Math.min(160, Math.max(6, fontSize + delta));
    actions.updateSelected({ fontSize: next });
  };

  const setHighlight = (color: string) => {
    actions.updateSelected({
      textBackgroundColor: color || "",
    });
  };

  return (
    <div className="space-y-3">
      <TextSectionCard
        title={String(t("editor_page.text_properties.character"))}
        icon={<span className="text-sm font-bold text-[#3B82F6]">B</span>}
      >
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <svg
              {...iconProps}
              className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <select
              value={element.fontFamily ?? "Arial"}
              onChange={(event) =>
                actions.updateSelected({ fontFamily: event.target.value })
              }
              className={selectClass}
              style={{ paddingLeft: "2rem" }}
              aria-label={String(t("editor_page.text_properties.font_family"))}
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </label>

          <select
            value={fontSize}
            onChange={(event) =>
              actions.updateSelected({
                fontSize: Number.parseInt(event.target.value, 10),
              })
            }
            className={cn(selectClass, "w-[4.75rem] shrink-0")}
            aria-label={String(t("editor_page.text_properties.font_size"))}
          >
            {fontSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-white/10 bg-[#1F2125] p-0.5">
            {[
              {
                label: "B",
                className: "font-bold",
                active: element.fontWeight === "bold",
                props: {
                  fontWeight:
                    element.fontWeight === "bold"
                      ? "normal"
                      : ("bold" as const),
                },
              },
              {
                label: "I",
                className: "italic",
                active: element.fontStyle === "italic",
                props: {
                  fontStyle:
                    element.fontStyle === "italic"
                      ? "normal"
                      : ("italic" as const),
                },
              },
              {
                label: "U",
                className: "underline",
                active: Boolean(element.underline),
                props: { underline: !element.underline },
              },
              {
                label: "S",
                className: "line-through",
                active: Boolean(element.linethrough),
                props: { linethrough: !element.linethrough },
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                aria-pressed={item.active}
                onClick={() => actions.updateSelected(item.props)}
                className={cn(
                  "flex h-8 flex-1 items-center justify-center rounded-md text-sm transition-colors",
                  item.className,
                  item.active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center rounded-lg border border-white/10 bg-[#1F2125]">
            <IconButton
              label={String(
                t("editor_page.text_properties.decrease_font_size")
              )}
              onClick={() => adjustFontSize(-1)}
            >
              −
            </IconButton>
            <span className="h-5 w-px bg-white/10" aria-hidden />
            <IconButton
              label={String(
                t("editor_page.text_properties.increase_font_size")
              )}
              onClick={() => adjustFontSize(1)}
            >
              +
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ColorField
            label={String(t("editor_page.text_properties.text_color"))}
            value={textFill}
            onPreview={(fill) => actions.updateSelectedPreview({ fill })}
            onCommit={(fill) => actions.updateSelected({ fill })}
          />
          <ColorField
            label={String(t("editor_page.text_properties.highlight"))}
            value={highlight || "#ffffff"}
            allowClear
            onPreview={(textBackgroundColor) =>
              actions.updateSelectedPreview({ textBackgroundColor })
            }
            onCommit={(textBackgroundColor) =>
              setHighlight(textBackgroundColor)
            }
          />
        </div>
      </TextSectionCard>

      <TextSectionCard
        title="PARAGRAPH"
        icon={
          <svg {...iconProps} className="text-[#3B82F6]">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        }
      >
        <div className="flex items-center rounded-lg border border-white/10 bg-[#1F2125] p-0.5">
          {(
            [
              {
                id: "left",
                label: String(t("editor_page.text_properties.align_left")),
                icon: (
                  <svg {...iconProps}>
                    <path d="M4 6h16M4 12h10M4 18h14" />
                  </svg>
                ),
              },
              {
                id: "center",
                label: String(t("editor_page.text_properties.align_center")),
                icon: (
                  <svg {...iconProps}>
                    <path d="M4 6h16M7 12h10M5 18h14" />
                  </svg>
                ),
              },
              {
                id: "right",
                label: String(t("editor_page.text_properties.align_right")),
                icon: (
                  <svg {...iconProps}>
                    <path d="M4 6h16M10 12h10M6 18h14" />
                  </svg>
                ),
              },
              {
                id: "justify",
                label: String(t("editor_page.text_properties.justify")),
                icon: (
                  <svg {...iconProps}>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ),
              },
            ] as const
          ).map((item) => {
            const active = (element.textAlign ?? "left") === item.id;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-pressed={active}
                onClick={() => actions.updateSelected({ textAlign: item.id })}
                className={cn(
                  "flex h-8 flex-1 items-center justify-center rounded-md transition-colors",
                  active
                    ? "bg-white/10 text-[#3B82F6] shadow-sm"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.icon}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetricSelect
            icon={
              <svg {...iconProps} className="text-[#9ca3af]">
                <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />
              </svg>
            }
            value={lineHeight}
            options={lineHeightOptions.map((v) => ({
              value: String(v),
              label: String(v),
            }))}
            onChange={(value) =>
              actions.updateSelected({ lineHeight: Number.parseFloat(value) })
            }
            ariaLabel={String(t("editor_page.text_properties.line_height"))}
          />
          <MetricSelect
            icon={
              <svg {...iconProps} className="text-[#9ca3af]">
                <path d="M4 8h16M4 16h16M8 4v16M16 4v16" />
              </svg>
            }
            value={charSpacing}
            options={charSpacingOptions.map((v) => ({
              value: String(v),
              label: String(v),
            }))}
            onChange={(value) =>
              actions.updateSelected({
                charSpacing: Number.parseInt(value, 10),
              })
            }
            ariaLabel={String(t("editor_page.text_properties.letter_spacing"))}
          />
        </div>

        {isCurved && (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-white/60">
              {String(t("editor_page.text_properties.curve_intensity"))}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={20}
                max={400}
                step={1}
                value={curvature}
                onInput={(event) =>
                  actions.updateSelectedPreview({
                    curvature: Number.parseInt(event.currentTarget.value, 10),
                  })
                }
                onChange={(event) =>
                  actions.updateSelected({
                    curvature: Number.parseInt(event.currentTarget.value, 10),
                  })
                }
                className="min-w-0 flex-1 accent-[#3B82F6]"
                aria-label={String(
                  t("editor_page.text_properties.curve_intensity")
                )}
              />
              <span className="w-10 shrink-0 text-end text-xs text-white/60 tabular-nums">
                {curvature}
              </span>
            </div>
          </label>
        )}

        <button
          type="button"
          aria-pressed={isCurved}
          onClick={() => actions.toggleCurvedTextPath()}
          className={cn(
            "flex h-10 w-full items-center justify-center gap-2 rounded-lg",
            "border text-sm transition-colors",
            isCurved
              ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
              : "border-white/10 bg-[#1F2125] text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
          )}
        >
          <svg
            {...iconProps}
            className={isCurved ? "text-[#3B82F6]" : "text-[#9ca3af]"}
          >
            <path d="M4 16c4-6 12-6 16 0" />
            <path d="M8 12h8" />
          </svg>
          {isCurved
            ? String(t("editor_page.text_properties.remove_curved_path"))
            : String(t("editor_page.text_properties.curved_text_path"))}
        </button>
      </TextSectionCard>
    </div>
  );
};

const selectClass = cn(
  "h-9 w-full appearance-none rounded-lg border border-white/10 bg-[#1F2125]",
  "px-2.5 text-sm text-white/80 outline-none",
  "focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30"
);

interface TextSectionCardProps {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
}

const TextSectionCard: React.FC<TextSectionCardProps> = ({
  title,
  icon,
  children,
}) => (
  <section className="space-y-3 rounded-xl border border-white/10 bg-[#2A2D33] p-3 shadow-sm">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-xs font-bold tracking-wide text-[#3B82F6]">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

interface IconButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({
  label,
  onClick,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center text-lg leading-none text-white/60 hover:bg-white/10 hover:text-white"
  >
    {children}
  </button>
);

interface ColorFieldProps {
  readonly label: string;
  readonly value: string;
  readonly allowClear?: boolean;
  readonly onPreview: (value: string) => void;
  readonly onCommit: (value: string) => void;
}

const ColorField: React.FC<ColorFieldProps> = ({
  label,
  value,
  allowClear,
  onPreview,
  onCommit,
}) => (
  <label className="relative flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#1F2125] px-2">
    <span
      className={cn(
        "h-5 w-5 shrink-0 rounded border border-white/10",
        allowClear && !value && "bg-[#1F2125]"
      )}
      style={{
        backgroundColor: toColorInputValue(value),
      }}
    />
    <span className="min-w-0 flex-1 truncate text-xs text-white/70">
      {label}
    </span>
    <svg
      {...iconProps}
      className="shrink-0 text-[#9ca3af]"
      width={12}
      height={12}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
    <input
      type="color"
      value={toColorInputValue(value)}
      onInput={(event) => onPreview(event.currentTarget.value)}
      onChange={(event) => onCommit(event.currentTarget.value)}
      className="absolute inset-0 cursor-pointer opacity-0"
      aria-label={label}
    />
  </label>
);

interface MetricSelectProps {
  readonly icon: React.ReactNode;
  readonly value: number;
  readonly options: readonly { value: string; label: string }[];
  readonly onChange: (value: string) => void;
  readonly ariaLabel: string;
}

const MetricSelect: React.FC<MetricSelectProps> = ({
  icon,
  value,
  options,
  onChange,
  ariaLabel,
}) => (
  <label className="relative flex h-9 items-center rounded-lg border border-white/10 bg-[#1F2125] ps-2">
    <span className="me-1.5 shrink-0">{icon}</span>
    <select
      value={String(value)}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className={cn(
        selectClass,
        "border-0 bg-transparent ps-0 pe-7 focus:ring-0"
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <svg
      {...iconProps}
      className="pointer-events-none absolute end-2 text-[#9ca3af]"
      width={12}
      height={12}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </label>
);
