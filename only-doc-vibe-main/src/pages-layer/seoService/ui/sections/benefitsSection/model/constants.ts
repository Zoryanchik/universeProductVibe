import type { IBenefitCard } from "./types";

export const BENEFITS_DATA: readonly IBenefitCard[] = [
  {
    id: "convert",
    titleKey: "benefitsSection.cards.convert.title",
    descriptionKey: "benefitsSection.cards.convert.description",
    emoji: "✅",
  },
  {
    id: "compress",
    titleKey: "benefitsSection.cards.compress.title",
    descriptionKey: "benefitsSection.cards.compress.description",
    emoji: "⚡",
  },
  {
    id: "translate",
    titleKey: "benefitsSection.cards.translate.title",
    descriptionKey: "benefitsSection.cards.translate.description",
    emoji: "🌏",
  },
  {
    id: "formats",
    titleKey: "benefitsSection.cards.formats.title",
    descriptionKey: "benefitsSection.cards.formats.description",
    emoji: "🧩",
  },
  {
    id: "ocr",
    titleKey: "benefitsSection.cards.ocr.title",
    descriptionKey: "benefitsSection.cards.ocr.description",
    emoji: "🔤",
  },
  {
    id: "navigate",
    titleKey: "benefitsSection.cards.navigate.title",
    descriptionKey: "benefitsSection.cards.navigate.description",
    emoji: "✨",
  },
] as const;
