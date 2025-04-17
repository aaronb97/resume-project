import { Check, X } from "lucide-react";
import clsx from "clsx";
import React from "react";
import { AiRecommendation } from "@/client";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  recc: AiRecommendation;
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
          included ? "bg-green-600" : "bg-neutral-700"
        )}
      >
        {included ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <X className="w-4 h-4 text-white" />
        )}
      </button>

      <div className="flex flex-col p-4 border-1 border-l-0 rounded-r-lg border-neutral-800 w-9/10">
        <span className="font-medium">{recc.text}</span>
        <span className="mt-1 text-xs text-neutral-400">{recc.rationale}</span>
      </div>
    </div>
  );
}
