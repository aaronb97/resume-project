import { useEffect, useRef } from "react";

export function useMount(callback: () => void) {
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
