"use client";

interface WhatTabsProps {
  active: "dev" | "content";
  onSelect: (next: "dev" | "content") => void | Promise<void>;
  className?: string;
}

export const WhatTabs = ({
  active,
  onSelect,
  className = "",
}: WhatTabsProps) => {
  const baseClasses =
    "px-3 py-1 rounded-full border transition-colors cursor-pointer text-[11px] md:text-xs tracking-wide uppercase whitespace-nowrap";
  const inactive =
    "border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-white/30";
  const activeCls = "border-white/40 bg-white/10 text-white";

  return (
    <div
      className={`flex gap-2 justify-center lg:justify-end mt-1 lg:mt-0 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSelect("dev")}
        className={`${baseClasses} ${active === "dev" ? activeCls : inactive}`}
      >
        Development & Design
      </button>
      <button
        type="button"
        onClick={() => onSelect("content")}
        className={`${baseClasses} ${
          active === "content" ? activeCls : inactive
        }`}
      >
        Content Creation
      </button>
    </div>
  );
};

export default WhatTabs;
