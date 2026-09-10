import type { FC, ReactNode } from "react";

interface DropdownGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * DropdownGroup UI block for tools menu.
 * Sets a max height and min height to prevent stretching and look more UI-friendly.
 */
export const DropdownGroup: FC<DropdownGroupProps> = ({
  title,
  children,
  className = "",
}) => (
  <div
    className={[
      // Set minimum and maximum height for a compact, non-stretched look
      "flex flex-col items-start gap-2 self-stretch",
      "overflow-hidden rounded-2xl bg-black/68 px-3 py-6 backdrop-blur-[29.75px]",
      "max-h-[390px] min-h-[220px] w-full", // UI-friendly column height
      className,
    ].join(" ")}
  >
    <div className="flex shrink-0 flex-col items-center justify-center gap-3 self-stretch">
      <span className="flex-1 self-stretch text-start text-[13px] leading-4 font-extrabold tracking-normal text-white uppercase">
        {title}
      </span>
      <div className="h-[0.5px] w-full bg-white/30" />
    </div>
    <div className="navbar-scroll flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      {children}
    </div>
  </div>
);
