interface ArrowProps {
  direction?: "left" | "right";
  disabled?: boolean;
  className?: string;
}

export const Arrow = ({
  direction = "left",
  disabled = false,
  className = "",
}: ArrowProps) => {
  return (
    <svg
      width="71"
      height="11"
      viewBox="0 0 71 11"
      fill="none"
      className={`
        w-[71px] h-[11px] transition-opacity duration-300
        ${direction === "right" ? "scale-x-[-1]" : ""}
        ${disabled ? "opacity-70" : "opacity-100"}
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.48823 0.695275C5.68349 0.500013 6 0.500013 6.19526 0.695275C6.39052 0.890537 6.39052 1.20704 6.19526 1.40231L2.20699 5.00024H71V6.00024H2.20699L6.19526 9.98842C6.39052 10.1837 6.39052 10.5002 6.19526 10.6954C6 10.8907 5.68349 10.8907 5.48823 10.6954L0.646447 5.85375C0.451184 5.65849 0.451184 5.34199 0.646447 5.14672L5.48823 0.695275Z"
        fill="currentColor"
      />
    </svg>
  );
};
