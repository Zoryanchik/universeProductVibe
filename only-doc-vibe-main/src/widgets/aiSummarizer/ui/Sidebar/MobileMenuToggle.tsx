import React from "react";

import { useAiSummarizerStore } from "@/features/aiSummarizer";

export const MobileMenuToggle: React.FC = () => {
  const setOpen = useAiSummarizerStore.use.setMobileMenuOpen();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
      aria-label="Open menu"
    >
      <BurgerIcon />
    </button>
  );
};

const BurgerIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
