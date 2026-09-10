import { useState, type ComponentProps, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { ChevronDownIcon } from "@/shared/ui/icons";
import type { IToolCard } from "@/shared/constants/service-tabs";

import { AccordionItem } from "./accordionItem";
import type { INavbarDropdownItem } from "../../model/types";

interface IAccordionGroup extends ComponentProps<"div"> {
  label: string;
  tools: Array<IToolCard | INavbarDropdownItem>;
  defaultOpen: boolean;
  onItemClick: (url: string) => void;
}

export const AccordionGroup: FC<IAccordionGroup> = ({
  label,
  tools,
  defaultOpen,
  onItemClick,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col self-stretch">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-[54px] items-center justify-between gap-3 self-stretch rounded-xl p-4 uppercase",
          {
            "bg-action-4 [&_svg]:rotate-180": open,
          }
        )}
      >
        <span className="text-[16px] leading-5.5 font-semibold uppercase">
          {label}
        </span>
        <ChevronDownIcon size={14} />
      </button>

      <div
        className={cn(
          "overflow-hidden opacity-0 transition-all duration-300 ease-in-out",
          {
            "max-h-0 opacity-0": !open,
            "max-h-[1000px] opacity-100": open,
          }
        )}
      >
        <div className="flex flex-col items-start gap-2 self-stretch ps-4">
          {tools.map((tool) => (
            <AccordionItem key={tool.url} onClick={() => onItemClick(tool.url)}>
              <img
                className="size-8"
                src={"icon" in tool ? tool.icon : tool.iconUrl}
                alt={tool.title}
              />
              <span className="text-text-primary text-body-emph">
                {tool.title}
              </span>
            </AccordionItem>
          ))}
        </div>
      </div>
    </div>
  );
};
