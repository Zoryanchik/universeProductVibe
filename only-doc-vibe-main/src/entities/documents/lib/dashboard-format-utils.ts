import { EFormatGroup, FORMAT_GROUP_TYPES } from "../model/dashboard-constants";

export const getFormatGroupForType = (
  type: string
): Exclude<EFormatGroup, EFormatGroup.ALL> => {
  const upper = type.toUpperCase();
  for (const [group, types] of Object.entries(FORMAT_GROUP_TYPES)) {
    if (group === EFormatGroup.ALL || !types) continue;

    if (types.includes(upper))
      return group as Exclude<EFormatGroup, EFormatGroup.ALL>;
  }

  return EFormatGroup.PDF;
};

export const FORMAT_GROUP_BADGE_CLASS: Record<
  Exclude<EFormatGroup, EFormatGroup.ALL>,
  string
> = {
  [EFormatGroup.PDF]: "bg-[var(--color-material-bp-red)] text-white",
  [EFormatGroup.IMAGE]: "bg-[var(--color-material-bp-purple)] text-white",
  [EFormatGroup.WORD]: "bg-[var(--color-material-bp-blue)] text-white",
  [EFormatGroup.SPREADSHEET]: "bg-[var(--color-material-bp-green)] text-white",
  [EFormatGroup.PRESENTATION]:
    "bg-[var(--color-material-bp-orange)] text-white",
  [EFormatGroup.EBOOK]: "bg-[#795548] text-white",
  [EFormatGroup.AUDIO]: "bg-[#E91E63] text-white",
  [EFormatGroup.VIDEO]: "bg-[#9C27B0] text-white",
  [EFormatGroup.TEXT]: "bg-[#78909C] text-white",
  [EFormatGroup.OTHER]: "bg-[#607D8B] text-white",
};

export const FORMAT_GROUP_BADGE_ICON: Record<
  Exclude<EFormatGroup, EFormatGroup.ALL>,
  string
> = {
  [EFormatGroup.PDF]: "/assets/icons/dashboard/format-badge-pdf.svg",
  [EFormatGroup.IMAGE]: "/assets/icons/dashboard/format-badge-image.svg",
  [EFormatGroup.WORD]: "/assets/icons/dashboard/format-badge-word.svg",
  [EFormatGroup.SPREADSHEET]: "/assets/icons/dashboard/format-badge-excel.svg",
  [EFormatGroup.PRESENTATION]:
    "/assets/icons/dashboard/format-badge-presentation.svg",
  [EFormatGroup.EBOOK]: "/assets/icons/dashboard/format-badge-pdf.svg",
  [EFormatGroup.AUDIO]: "/assets/icons/dashboard/format-badge-pdf.svg",
  [EFormatGroup.VIDEO]: "/assets/icons/dashboard/format-badge-pdf.svg",
  [EFormatGroup.TEXT]: "/assets/icons/dashboard/format-badge-pdf.svg",
  [EFormatGroup.OTHER]: "/assets/icons/dashboard/format-badge-pdf.svg",
};

export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes < 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exp = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, exp);
  const formatted =
    value >= 100 || exp === 0 ? value.toFixed(0) : value.toFixed(1);

  return `${formatted} ${units[exp]}`;
};

export const formatDate = (iso: string, locale = "en-US"): string => {
  try {
    const date = new Date(iso);

    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

export const stripExtension = (filename: string): string => {
  const idx = filename.lastIndexOf(".");

  return idx > 0 ? filename.slice(0, idx) : filename;
};

export const getExtension = (filename: string): string => {
  const idx = filename.lastIndexOf(".");

  return idx > 0 ? filename.slice(idx + 1) : "";
};
