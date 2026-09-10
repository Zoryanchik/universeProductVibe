import type { FaqSchema, FaqSection } from "../../../types/seo/schema";

// Helper function to generate FAQ schema from sections
export const generateFaqSchema = (sections: FaqSection[]): FaqSchema | null => {
  const faqSections = sections.filter(
    (section): section is FaqSection & { __component: "sections.faq" } =>
      section.__component === "sections.faq"
  );

  if (faqSections.length === 0) {
    return null;
  }

  // Combine all FAQ questions from all FAQ sections
  const allQuestions = faqSections.flatMap(
    (section) => section.questions || []
  );

  if (allQuestions.length === 0) {
    return null;
  }

  return {
    "@type": "FAQPage",
    mainEntity: allQuestions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
};
