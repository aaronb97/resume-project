import { Check, X } from "lucide-react";
import clsx from "clsx";
import React from "react";

export interface ReccCardProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  rationale?: string;
  included: boolean;
  onClick: () => void;
}

const ReccCardBase = React.forwardRef<HTMLDivElement, ReccCardProps>(
  ({ text, rationale, included, onClick, className, ...props }, ref) => {
    const innerRef = React.useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = React.useState(0);

    const measure = React.useCallback(() => {
      if (innerRef.current) setMaxHeight(innerRef.current.scrollHeight + 28);
    }, []);

    React.useLayoutEffect(measure, [text, rationale, measure]);
    React.useEffect(() => {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, [measure]);

    return (
      <div
        {...props}
        ref={ref}
        className={clsx(
          "flex w-full transition-[max-height] duration-500 ease-in-out animate-card-entry",
          className
        )}
        style={{ maxHeight }}
      >
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

        <div
          style={{ maxHeight }}
          className="overflow-y-hidden overflow-x-visible flex flex-col p-4 border-1 border-l-0 rounded-r-lg bg-stone-900 w-full"
        >
          <div ref={innerRef}>
            <span className="block font-medium">
              <TypingText text={text} />
            </span>

            <span className="block mt-1 text-xs text-neutral-400">
              <TypingText text={rationale} />
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ReccCardBase.displayName = "ReccCard";

function areEqual(prev: ReccCardProps, next: ReccCardProps) {
  return (
    prev.text === next.text &&
    prev.rationale === next.rationale &&
    prev.included === next.included
  );
}

export const ReccCard = React.memo(ReccCardBase, areEqual);

function TypingText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/(\s+)/).map((t, ti) => (
        <span key={ti} className="whitespace-pre-wrap">
          {t.split("").map((ch, ci) => (
            <span key={`${ti}-${ci}`} className="animate-fade-in">
              {ch}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}
