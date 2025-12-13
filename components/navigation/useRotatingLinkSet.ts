"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const useRotatingLinkSet = <T extends string>(
  sets: readonly (readonly T[])[],
  intervalMs: number
) => {
  const [setIndex, setSetIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setSetIndex((prev) => (prev + 1) % sets.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [intervalMs, isPaused, sets.length]);

  const next = useCallback(() => {
    setSetIndex((prev) => (prev + 1) % sets.length);
  }, [sets.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    setIndex,
    setSetIndex,
    isPaused,
    setIsPaused,
    next,
    resetTimer,
  };
};

