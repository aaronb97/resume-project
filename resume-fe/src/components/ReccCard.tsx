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
  /* ---------- height-animation bookkeeping ---------- */
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = React.useState<number>();

  React.useLayoutEffect(() => {
    if (innerRef.current) {
      setMaxHeight(innerRef.current.scrollHeight + 28);
    }
  }, [recc.text, recc.rationale]);

  return (
    <div
      {...props}
      className={clsx(
        "flex w-full transition-[max-height] duration-500 ease-in-out animate-card-entry",
        className
      )}
      style={{ maxHeight }}
    >
      {/* include / exclude button */}
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

      {/* animated-height shell */}
      <div
        style={{ maxHeight }}
        className={clsx(
          `
          overflow-y-hidden overflow-x-visible          /* ← hide only vertical overflow */
          flex flex-col p-4 border-1 border-l-0 rounded-r-lg
          bg-stone-900 w-full
          `
        )}
      >
        {/* real content we measure */}
        <div ref={innerRef}>
          {/* 1️⃣ TEXT — its own block so it gets its own line */}
          <span className="block font-medium">
            <TypingText text={recc.text} />
          </span>

          {/* 2️⃣ RATIONALE — separate line, never clipped */}
          <span className="block mt-1 text-xs text-neutral-400">
            <TypingText text={recc.rationale} />
          </span>
        </div>
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
