import { Check, X } from "lucide-react";
import clsx from "clsx";
import React from "react";
import { AiRecommendationParsed } from "@/hooks/useRecommendationStream";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  recc: AiRecommendationParsed;
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
        <span className="font-medium">
          <TypingText text={recc.text} />
        </span>

        <span className="mt-1 text-xs text-neutral-400">
          <TypingText text={recc.rationale} />
        </span>
      </div>
    </div>
  );
}

/**
 * Splits the incoming string into <span>‘s so that
 * newly-added characters (because the prop changed)
 * are brand-new DOM nodes.  Each span gets the
 * `animate-fade-in` class, which runs exactly once
 * when the node is inserted.
 */
function TypingText({ text }: { text: string | undefined }) {
  return (
    <>
      {text?.split(/(\s+)/).map((token, tokenIdx) => {
        // === 1. The token is pure whitespace =========================
        if (/^\s+$/.test(token)) {
          return token.split("").map((_, i) => (
            <span
              key={`${tokenIdx}-${i}`}
              className="animate-fade-in inline-block"
            >
              {"\u00A0" /* non-breaking space keeps the gap visible */}
            </span>
          ));
        }

        // === 2. The token is a word or punctuation ===================
        return (
          <span // <– one wrapper per word
            key={tokenIdx}
            className="inline-block whitespace-nowrap" /* <- no mid-word wraps */
          >
            {token.split("").map((ch, i) => (
              <span
                key={`${tokenIdx}-${i}`}
                className="animate-fade-in inline-block"
              >
                {ch}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}
