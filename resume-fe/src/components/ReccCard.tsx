import clsx from "clsx";
import { Check, X } from "lucide-react";
import React from "react";
import { diffWords } from "diff";
import { Skeleton } from "./ui/skeleton";

interface ReccCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lineNum: number;
  text?: string;
  rationale?: string;
  originalText: string;
  included: boolean;
  onToggleIncluded: (lineNum: number) => void;
  loading: boolean;
}

export const ReccCard = React.memo(function ReccCard({
  lineNum,
  text,
  rationale,
  included,
  onToggleIncluded,
  originalText,
  className,
  loading,
  ...props
}: ReccCardProps) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = React.useState(0);

  const diff = diffWords(originalText, text ?? "");

  React.useLayoutEffect(() => {
    if (innerRef.current) setMaxHeight(innerRef.current.scrollHeight + 28);
  }, [text, rationale]);

  React.useEffect(() => {
    function measure() {
      if (innerRef.current) setMaxHeight(innerRef.current.scrollHeight + 28);
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      {...props}
      className={clsx(
        "flex w-full transition-[max-height] duration-500 ease-in-out animate-card-entry first:mb-auto",
        className,
      )}
      style={{ maxHeight }}
    >
      {loading ? (
        <Skeleton className="w-8 rounded-none rounded-l-lg" />
      ) : (
        <button
          type="button"
          onClick={() => onToggleIncluded(lineNum)}
          className={clsx(
            "flex flex-none items-center justify-center w-8 transition-colors cursor-pointer rounded-l-lg",
            included ? "bg-emerald-500" : "bg-neutral-800",
          )}
        >
          {included ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <X className="w-4 h-4 text-white" />
          )}
        </button>
      )}

      <div
        style={{ maxHeight }}
        className="overflow-y-hidden overflow-x-visible flex flex-col p-4 border-1 border-l-0 rounded-r-lg bg-stone-900 w-full"
      >
        <div ref={innerRef}>
          <span className="block font-medium">
            {diff.map((diffChunk, i) => (
              <TypingText
                key={i}
                text={diffChunk.value}
                added={diffChunk.added}
                removed={diffChunk.removed}
                loading={loading}
              />
            ))}
          </span>

          <span className="block mt-1 text-xs text-neutral-400 italic">
            <TypingText text={rationale} loading={loading} />
          </span>
        </div>
      </div>
    </div>
  );
});

function TypingText({
  text,
  added,
  removed,
  loading,
}: {
  text?: string;
  added?: boolean;
  removed?: boolean;
  className?: string;
  loading: boolean;
}) {
  if (!text) return null;
  return (
    <>
      {text.split(/(\s+)/).map((token, tIdx) => (
        <span
          key={tIdx}
          className={clsx(
            "whitespace-pre-wrap",
            added && "text-emerald-300",
            removed && "text-neutral-500 line-through",
          )}
        >
          {token.split("").map((ch, i) => (
            <span
              key={`${tIdx}-${i}`}
              className={clsx(loading && "animate-fade-in")}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}
