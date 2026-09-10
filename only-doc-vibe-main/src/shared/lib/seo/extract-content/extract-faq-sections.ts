import type { FaqSection } from "../../../types/seo/schema";

export // Helper function to extract FAQ sections from raw sections data
function extractFaqSections(sections?: unknown[]): FaqSection[] {
  if (!sections || !Array.isArray(sections)) {
    return [];
  }

  return sections
    .filter((section): section is FaqSection => {
      return (
        typeof section === "object" &&
        section !== null &&
        "__component" in section &&
        typeof section.__component === "string"
      );
    })
    .map((section) => ({
      __component: section.__component,
      questions: Array.isArray(section.questions)
        ? section.questions.map((q: unknown) => {
            if (typeof q === "object" && q !== null) {
              return {
                question:
                  "question" in q ? String(q.question || "") : undefined,
                answer: "answer" in q ? String(q.answer || "") : undefined,
              };
            }

            return { question: undefined, answer: undefined };
          })
        : undefined,
    }));
}
