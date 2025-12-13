"use client";

import { useEffect, useState } from "react";
import { isCoarsePointerDevice } from "../utils/pointer";

export const useIsCoarsePointer = () => {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    setIsCoarse(isCoarsePointerDevice());

    const mql = window.matchMedia("(pointer: coarse)");
    const onChange = () => setIsCoarse(isCoarsePointerDevice());

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Safari fallback
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return isCoarse;
};
