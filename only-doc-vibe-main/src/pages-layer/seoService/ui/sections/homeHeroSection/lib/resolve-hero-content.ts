import type { ICmsDropZone } from "@/shared/ui/upload-area";

interface HeroTextContent {
  readonly title: string;
  readonly subtitle: string;
  readonly uploadButtonLabel: string;
  readonly dropText: string;
  readonly supportedFormatsText: string;
  readonly maxSizeText: string;
}

interface ResolveHeroTextParams {
  readonly cmsTitle?: string;
  readonly cmsSubtitle?: string;
  readonly cmsDropZone?: ICmsDropZone;
  readonly t: (key: string) => string;
}

export const resolveHeroTextContent = ({
  cmsTitle,
  cmsSubtitle,
  cmsDropZone,
  t,
}: ResolveHeroTextParams): HeroTextContent => ({
  title: cmsTitle ?? t("hero.title.prefix"),
  subtitle: cmsSubtitle ?? t("hero.subtitle"),
  uploadButtonLabel: cmsDropZone?.cta_button_title ?? t("hero.uploadButton"),
  dropText: cmsDropZone?.title ?? t("serviceHeroSection.dropText"),
  supportedFormatsText:
    cmsDropZone?.supported_formats_description ??
    t("serviceHeroSection.supportedFormats"),
  maxSizeText:
    cmsDropZone?.supported_sizes_description ?? t("serviceHeroSection.maxSize"),
});
