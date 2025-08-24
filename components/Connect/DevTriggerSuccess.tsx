"use client";

interface DevTriggerSuccessProps {
  onTrigger: () => void;
  className?: string;
}

export default function DevTriggerSuccess({
  onTrigger,
  className = "",
}: DevTriggerSuccessProps) {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <button
      type="button"
      onClick={onTrigger}
      className={`px-3 py-1.5 rounded-full border border-white/15 bg-white/8 text-xs text-white/85 hover:border-white/30 hover:bg-white/12 transition-colors cursor-pointer ${className}`}
    >
      Dev: Trigger Success
    </button>
  );
}
