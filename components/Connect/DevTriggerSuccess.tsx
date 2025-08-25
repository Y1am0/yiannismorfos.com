"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DevTriggerSuccessProps {
  onTrigger: () => void;
  className?: string;
}

export default function DevTriggerSuccess({
  onTrigger,
  className = "",
}: DevTriggerSuccessProps) {
  const isDev = process.env.NODE_ENV === "development";
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isDev || !mounted) return null;

  return createPortal(
    <button
      type="button"
      onClick={onTrigger}
      className={`px-3 py-1.5 rounded-full border border-white/15 bg-white/8 text-xs text-white/85 hover:border-white/30 hover:bg-white/12 transition-colors cursor-pointer fixed top-[112px] right-2 z-[9999] ${className}`}
    >
      Dev: Trigger Success
    </button>,
    document.body
  );
}
