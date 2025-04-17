import { Link, LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Item = {
  title: string;
  icon: LucideIcon;
  to?: LinkProps["to"];
  onClick?: () => void;
};

interface Props {
  items: Item[];
}

export function ResumeActions({ items }: Props) {
  return (
    <div>
      {items.map((item) => (
        <TooltipProvider key={item.title}>
          <Tooltip>
            <TooltipTrigger>
              <Button
                asChild={Boolean(item.to)}
                size={"icon"}
                variant={"ghost"}
                onClick={() => item.onClick?.()}
              >
                {item.to ? (
                  <Link to={item.to}>
                    <item.icon />
                  </Link>
                ) : (
                  <item.icon />
                )}
              </Button>
            </TooltipTrigger>

            <TooltipContent side="bottom">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
