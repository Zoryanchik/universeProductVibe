import { type FC, type ReactNode } from "react";
import { cn } from "@universe-forma/ui-pes";

interface IProps {
  children: ReactNode;
}

export const BaseFormContainer: FC<IProps> = ({ children }) => {
  return (
    <div
      className={cn(
        "bg-bg-white-bg flex w-full flex-col items-center gap-3 rounded-[20px] p-8 shadow-[0_8px_12px_0_rgba(0,0,0,0.08),0_2px_6px_2px_rgba(0,0,0,0.04)]",
        "max-sm:px-4 max-sm:py-5"
      )}
    >
      {children}
    </div>
  );
};
