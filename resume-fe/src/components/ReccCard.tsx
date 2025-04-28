import clsx from "clsx";
import { Check, X } from "lucide-react";
import React from "react";

interface ReccCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lineNum: number;
  text?: string;
  rationale?: string;
  included: boolean;
  onToggleIncluded: (lineNum: number) => void;
}

export const ReccCard = React.memo(function ReccCard({
  lineNum,
  text,
  rationale,
  included,
  onToggleIncluded,
  className,
  ...props
}: ReccCardProps) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = React.useState(0);

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
        className
      )}
      style={{ maxHeight }}
    >
      <button
        type="button"
        onClick={() => onToggleIncluded(lineNum)}
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
});

function TypingText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/(\s+)/).map((token, tIdx) => (
        <span key={tIdx} className="whitespace-pre-wrap">
          {token.split("").map((ch, i) => (
            <span key={`${tIdx}-${i}`} className="animate-fade-in">
              {ch}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}
