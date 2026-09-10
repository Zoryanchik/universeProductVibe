// Types
export type {
  ICTABadge,
  ICTABadgeProps,
  ICTAButtonProps,
  ICTAContentProps,
  ICTASectionData,
  ICTASectionProps,
  IUseHighlightWidthReturn,
} from "./model/types";

// Hooks
export { useHighlightWidth } from "./lib/useHighlightWidth";

// Headless Compound Components
export {
  CTAAction,
  CTABadgeList,
  CTAButton,
  CTAContent,
  CTAIllustration,
  CTARoot,
  CTATextContent,
  CTATitle,
} from "./ui/CTASection";

// Sub-components
export { CTABadge } from "./ui/CTABadge";

// Pre-composed Component
export { CTASection } from "./ui/CTASection";
