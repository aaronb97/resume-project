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
 * TypingText – one-word-at-a-time wrapper that
 *  • keeps mid-word text unbreakable
 *  • animates every new character
 *  • lets the browser hide leading-line spaces
 */
function TypingText({ text }: { text: string | undefined }) {
  if (!text) return null;

  return (
    <>
      {text.split(/(\s+)/).map((token, tokenIdx) => {
        /* 1️⃣ Pure-whitespace token — just one <span>, NOT inline-block */
        if (/^\s+$/.test(token)) {
          return (
            <span // regular inline span (collapsible space)
              key={tokenIdx}
              className="animate-fade-in"
            >
              {" "}
            </span>
          );
        }

        /* 2️⃣ Normal word/punctuation – still protected from mid-word wraps */
        return (
          <span key={tokenIdx} className="inline-block whitespace-nowrap">
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
