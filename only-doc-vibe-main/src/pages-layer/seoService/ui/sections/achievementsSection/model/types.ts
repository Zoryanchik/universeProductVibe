export interface IDocumentImage {
  readonly svg: string;
  readonly x: number;
  readonly y: number;
}

export interface IAchievementCard {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly backgroundColor: string;
  readonly iconColor: string;
  readonly folderSvg: string;
  readonly documents: readonly IDocumentImage[];
  readonly iconUrl?: string; // Image URL from CMS
}

export interface IAchievementsSectionProps {
  readonly lang: string;
}
