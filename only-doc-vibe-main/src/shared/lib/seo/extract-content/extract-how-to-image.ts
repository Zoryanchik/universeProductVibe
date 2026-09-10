// Helper function to extract how-to image URL from sections
export function extractHowToImageUrl(sections?: unknown[]): string | undefined {
  if (!sections || !Array.isArray(sections)) {
    return undefined;
  }

  const howToSection = sections.find((section) => {
    return (
      typeof section === "object" &&
      section !== null &&
      "__component" in section &&
      section.__component === "sections.how-to"
    );
  });

  if (!howToSection || typeof howToSection !== "object") {
    return undefined;
  }

  // Navigate through cover.data.attributes.url
  if (
    "cover" in howToSection &&
    typeof howToSection.cover === "object" &&
    howToSection.cover !== null &&
    "data" in howToSection.cover &&
    typeof howToSection.cover.data === "object" &&
    howToSection.cover.data !== null &&
    "attributes" in howToSection.cover.data &&
    typeof howToSection.cover.data.attributes === "object" &&
    howToSection.cover.data.attributes !== null &&
    "url" in howToSection.cover.data.attributes
  ) {
    return String(howToSection.cover.data.attributes.url || "");
  }

  return undefined;
}
