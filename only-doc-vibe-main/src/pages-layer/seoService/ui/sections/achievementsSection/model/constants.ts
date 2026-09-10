import type { IAchievementCard } from "./types";

export const ACHIEVEMENT_CARDS: readonly IAchievementCard[] = [
  {
    id: "uploads",
    label: "uploads",
    value: "20M",
    backgroundColor: "#82CFC3",
    iconColor: "#049C87",
    folderSvg: "/assets/achievements/uploads-folder.svg",
    documents: [
      {
        svg: "/assets/achievements/uploads-doc1.svg",
        x: 153.37,
        y: 16.38,
      },
      {
        svg: "/assets/achievements/uploads-doc2.svg",
        x: 81,
        y: 3.12,
      },
      {
        svg: "/assets/achievements/uploads-doc3.svg",
        x: 0,
        y: 0,
      },
    ],
  },
  {
    id: "edits",
    label: "edits",
    value: "9M",
    backgroundColor: "#FEE1B8",
    iconColor: "#049C87",
    folderSvg: "/assets/achievements/edits-folder.svg",
    documents: [
      {
        svg: "/assets/achievements/edits-doc1.svg",
        x: 153.37,
        y: 16.38,
      },
      {
        svg: "/assets/achievements/edits-doc2.svg",
        x: 81,
        y: 3.12,
      },
      {
        svg: "/assets/achievements/edits-doc3.svg",
        x: 0,
        y: 0,
      },
    ],
  },
  {
    id: "conversions",
    label: "conversions",
    value: "17M",
    backgroundColor: "#B2EBF2",
    iconColor: "#049C87",
    folderSvg: "/assets/achievements/conversions-folder.svg",
    documents: [
      {
        svg: "/assets/achievements/conversions-doc1.svg",
        x: 153.37,
        y: 16.38,
      },
      {
        svg: "/assets/achievements/conversions-doc2.svg",
        x: 81,
        y: 3.12,
      },
      {
        svg: "/assets/achievements/conversions-doc3.svg",
        x: 0,
        y: 0,
      },
    ],
  },
] as const;
