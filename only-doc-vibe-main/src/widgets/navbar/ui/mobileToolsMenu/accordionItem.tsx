import type { ComponentPropsWithoutRef } from "react";

export const AccordionItem = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) => (
  <div
    {...props}
    className="flex items-center gap-3 self-stretch rounded-xl p-2"
  >
    {children}
  </div>
);
