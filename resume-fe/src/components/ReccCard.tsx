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
  /* ───────────────── height-animation bookkeeping ───────────────── */
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = React.useState<number>();

  /** Measure once, or whenever text/rationale updates */
  React.useLayoutEffect(measureAndSetMaxHeight, [recc.text, recc.rationale]);

  /** Measure again on every window resize */
  React.useEffect(() => {
    window.addEventListener("resize", measureAndSetMaxHeight);
    return () => window.removeEventListener("resize", measureAndSetMaxHeight);
  }, []); // empty deps → listener added only once

  /** helper shared by both effects */
  function measureAndSetMaxHeight() {
    if (innerRef.current) {
      setMaxHeight(innerRef.current.scrollHeight + 28); // 28 = padding/etc.
    }
  }

  /* ───────────────────────── component markup ───────────────────── */
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
          overflow-y-hidden overflow-x-visible
          flex flex-col p-4 border-1 border-l-0 rounded-r-lg
          bg-stone-900 w-full
          `
        )}
      >
        <div ref={innerRef}>
          {/* TEXT */}
          <span className="block font-medium">
            <TypingText text={recc.text} />
          </span>

          {/* RATIONALE */}
          <span className="block mt-1 text-xs text-neutral-400">
            <TypingText text={recc.rationale} />
          </span>
        </div>
      </div>
    </div>
  );
}

function TypingText({ text }: { text: string | undefined }) {
  if (!text) return null;

  return (
    <>
      {text.split(/(\s+)/).map((token, tokenIdx) => {
        return (
          <span key={tokenIdx} className="whitespace-pre-wrap">
            {token.split("").map((ch, i) => (
              <span key={`${tokenIdx}-${i}`} className="animate-fade-in">
                {ch}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}
