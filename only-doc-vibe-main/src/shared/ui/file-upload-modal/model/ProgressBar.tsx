import React from "react";
import { cn } from "@universe-forma/ui-pes";

export interface IProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<IProps> = ({ progress, className }) => {
  return (
    <div
      className={cn(
        "bg-primary/20 relative z-[1] mt-8 h-2.5 w-full shrink-0 overflow-hidden rounded-[100px]",
        className
      )}
    >
      <div
        className="bg-primary absolute start-0 top-0 h-2.5 w-full [transition:_all_1.3s_cubic-bezier(0.5,_0.35,_0.15,_1)]"
        style={{
          transform: `translateX(calc(${progress}% - 100%))`,
        }}
      />
    </div>
  );
};
