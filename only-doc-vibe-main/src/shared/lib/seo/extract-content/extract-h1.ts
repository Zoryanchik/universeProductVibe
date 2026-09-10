// Helper function to extract h1 from hero section
export function extractH1(sections?: unknown[]): string | undefined {
  if (!sections || !Array.isArray(sections)) {
    return undefined;
  }

  const heroSection = sections.find((section) => {
    return (
      typeof section === "object" &&
      section !== null &&
      "__component" in section &&
      section.__component === "sections.hero-upload-file"
    );
  });

  if (!heroSection || typeof heroSection !== "object") {
    return undefined;
  }

  // Navigate through hero_section.data.attributes.title.title
  if (
    "hero_section" in heroSection &&
    typeof heroSection.hero_section === "object" &&
    heroSection.hero_section !== null &&
    "data" in heroSection.hero_section &&
    typeof heroSection.hero_section.data === "object" &&
    heroSection.hero_section.data !== null &&
    "attributes" in heroSection.hero_section.data &&
    typeof heroSection.hero_section.data.attributes === "object" &&
    heroSection.hero_section.data.attributes !== null &&
    "title" in heroSection.hero_section.data.attributes &&
    typeof heroSection.hero_section.data.attributes.title === "object" &&
    heroSection.hero_section.data.attributes.title !== null &&
    "title" in heroSection.hero_section.data.attributes.title
  ) {
    return String(heroSection.hero_section.data.attributes.title.title || "");
  }

  return undefined;
}
