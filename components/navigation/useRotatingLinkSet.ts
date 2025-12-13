"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const useRotatingLinkSet = <T extends string>(
  sets: readonly (readonly T[])[],
  intervalMs: number
) => {
  const [setIndex, setSetIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
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
  }, [intervalMs, isPaused, sets.length, timerKey]);

  const next = useCallback(() => {
    setSetIndex((prev) => (prev + 1) % sets.length);
  }, [sets.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Force the interval effect to recreate the timer on the next render.
    setTimerKey((k) => k + 1);
  }, []);

  return {
    setIndex,
    setIsPaused,
    next,
    resetTimer,
  };
};
