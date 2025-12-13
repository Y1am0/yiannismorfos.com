export const isCoarsePointerDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const nav: Navigator & { maxTouchPoints?: number } =
    navigator as Navigator & { maxTouchPoints?: number };

  return (
    "ontouchstart" in window ||
    (typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0) ||
    window.matchMedia("(pointer: coarse)").matches
  );
};

