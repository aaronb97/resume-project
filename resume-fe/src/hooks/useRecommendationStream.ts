import { useEffect, useRef, useState } from "react";
import { parse } from "partial-json";
import { API_URL } from "@/envVars";

export type AiRecommendation = {
  LineNum: number;
  Text: string;
  Rationale: string;
};

export type AiRecommendationParsed = {
  lineNum: number;
  text: string;
  rationale: string;
  included: boolean;
};

export function useRecommendationsStream(resumeId: string | undefined) {
  const [data, setData] = useState<{ Recommendations: AiRecommendation[] }>({
    Recommendations: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController>(null);

  console.log(data);

  useEffect(() => {
    if (!resumeId) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setData({ Recommendations: [] });

    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/resumes/${resumeId}/recommendations`,
          {
            headers: { Accept: "application/x-ndjson" },
            signal: controller.signal,
          },
        );

        if (!res.ok || !res.body) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          setData(parse(buffer));
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [resumeId]);

  return { data, loading, error, cancel: () => abortRef.current?.abort() };
}
