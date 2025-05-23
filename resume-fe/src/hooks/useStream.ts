import { useCallback, useEffect, useRef, useState } from "react";
import { parse } from "partial-json";
import { Options, RequestResult } from "@hey-api/client-fetch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStream(fn: (options: Options<any>) => RequestResult) {
  const [data, setData] = useState<unknown | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController>(null);

  const start = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setData(undefined);

    try {
      const res = (
        await fn({
          parseAs: "stream",
          headers: { Accept: "application/x-ndjson" },
          signal: controller.signal,
        })
      ).response;

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setLoading(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsed = lowercaseFirstKey(parse(buffer));
        if (parsed) {
          setData(parsed);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err);
        setLoading(false);
      }
    }
  }, [fn]);

  useEffect(() => {
    start();

    return () => {
      abortRef.current?.abort();
    };
  }, [start]);

  const refetch = useCallback(() => {
    abortRef.current?.abort();
    start();
  }, [start]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { data, loading, error, refetch, cancel };
}

/**
 * Recursively returns a new object (or array) whose keys have their
 * first character lower‑cased.  Primitives and functions are returned
 * unchanged.  The original input is never mutated.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lowercaseFirstKey(input: any): any {
  if (Array.isArray(input)) {
    return input.map(lowercaseFirstKey);
  }

  if (input !== null && typeof input === "object") {
    return Object.entries(input as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        const newKey =
          key.length > 0 ? key[0].toLowerCase() + key.slice(1) : key;

        (acc as Record<string, unknown>)[newKey] = lowercaseFirstKey(value);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  return input;
}
