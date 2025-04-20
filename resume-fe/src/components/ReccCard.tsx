import { Check, X } from "lucide-react";
import clsx from "clsx";
import React from "react";
import { AiRecommendationParsed } from "@/hooks/useRecommendationStream";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  recc: AiRecommendationParsed;
  active: boolean;
  included: boolean;
  onClick: () => void;
};

export function ReccCard({
  recc,
  included,
  className,
  onClick,
  ...props
}: CardProps) {
  return (
    <div {...props} className={clsx("flex w-full", className)}>
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          "flex flex-none items-center justify-center w-8 transition-colors cursor-pointer rounded-l-lg",
          included ? "bg-emerald-500" : "bg-neutral-800"
        )}
      >
        {included ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <X className="w-4 h-4 text-white" />
        )}
      </button>

      <div className="flex flex-col p-4 border-1 border-l-0 rounded-r-lg bg-stone-900 w-full">
        <span className="font-medium">{recc.text}</span>
        <span className="mt-1 text-xs text-neutral-400">{recc.rationale}</span>
      </div>
    </div>
  );
}
