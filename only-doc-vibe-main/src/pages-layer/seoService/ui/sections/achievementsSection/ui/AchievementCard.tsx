"use client";

import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

import type { IAchievementCard } from "../model/types";
import { useAchievementCardViewModel } from "./lib";

interface IAchievementCardProps {
  readonly card: IAchievementCard;
}

export const AchievementCard: FC<IAchievementCardProps> = ({ card }) => {
  // Headless logic - all business logic extracted to view model
  const viewModel = useAchievementCardViewModel(card);

  return (
    <div className="group relative flex w-[340px] shrink-0 cursor-pointer flex-col justify-end gap-3 px-8 pt-10 pb-5">
      {/* Background decorative elements */}
      <div className="absolute start-0 top-0 h-[164px] w-[340px]">
        {/* Base background with border and blur */}
        <div
          className={cn(
            "absolute start-0 top-0 h-full w-full rounded-3xl border backdrop-blur-[33px]",
            "border-white/50",
            "transition-transform duration-300 ease-out",
            "group-hover:scale-[1.02]"
          )}
          style={viewModel.baseCardStyle}
        />

        {/* Colored background overlay */}
        <div
          className="absolute start-2 top-2 h-[136px] w-[324px] rounded-2xl backdrop-blur-[33px] transition-all duration-300 ease-out group-hover:opacity-90"
          style={viewModel.coloredBackgroundStyle}
        />

        {/* Files/Documents container - positioned at top */}
        <div className="absolute start-8 top-1 h-[145px] w-[276px]">
          {/* Render documents with coordinated hover animations */}
          {viewModel.card.documents.map((doc, index) => (
            <img
              key={index}
              src={doc.svg}
              alt={`${viewModel.card.label} document ${index + 1}`}
              className={cn(
                "absolute transition-all duration-500 ease-out",
                viewModel.getDocumentHoverClass(index)
              )}
              style={viewModel.getDocumentStyle(doc.x, doc.y)}
            />
          ))}
        </div>

        {/* Folder base - positioned below documents */}
        <div className="absolute start-2 top-[42px] h-[122px] w-[324px]">
          <img
            src={viewModel.card.folderSvg}
            alt={`${viewModel.card.label} folder`}
            className="absolute start-0 -top-[18px] transition-transform duration-300 ease-out group-hover:scale-[1.01]"
            style={viewModel.folderStyle}
          />
        </div>
      </div>
      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Icon container with glassmorphism */}
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border-2",
            "border-white/50",
            "transition-all duration-300 ease-out",
            "group-hover:scale-110 group-hover:border-white/70"
          )}
          style={viewModel.iconContainerStyle}
        >
          {/* Icon from CMS or fallback to folder emoji */}
          {viewModel.card.iconUrl ? (
            <img
              src={viewModel.card.iconUrl}
              alt={viewModel.card.label}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <span
              className="text-2xl leading-none font-normal"
              style={viewModel.iconColorStyle}
            >
              📁
            </span>
          )}
        </div>

        {/* Label */}
        <span
          className="text-lg leading-[1.44em] font-normal transition-colors duration-300 ease-out group-hover:opacity-80"
          style={viewModel.textColorStyle}
        >
          {viewModel.card.label}
        </span>
      </div>
      {/* Value/Number */}
      <div
        className="relative z-10 w-full text-start text-[40px] leading-[1.2em] font-normal transition-all duration-300 ease-out group-hover:scale-105"
        style={viewModel.textColorStyle}
      >
        {viewModel.card.value}
      </div>
    </div>
  );
};
