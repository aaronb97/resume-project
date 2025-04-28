import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Link, LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

type IconTooltipButtonProps = {
  label: string;
  icon: LucideIcon;
  to?: LinkProps["to"];
  onClick?: () => void;
  disabled?: boolean;
  variant?: "ghost" | "default";
};

export function IconTooltipButton({
  label,
  icon: Icon,
  to,
  onClick,
  disabled,
  variant = "ghost",
}: IconTooltipButtonProps) {
  const inner = <Icon className="h-4 w-4" />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {to ? (
            <Button asChild variant={variant} size="icon" disabled={disabled}>
              <Link to={to}>{inner}</Link>
            </Button>
          ) : (
            <Button
              variant={variant}
              size="icon"
              onClick={onClick}
              disabled={disabled}
            >
              {inner}
            </Button>
          )}
        </TooltipTrigger>

        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
