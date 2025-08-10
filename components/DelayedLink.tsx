"use client";

import { useDelayedNavigation } from "@/lib/useDelayedNavigation";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type Props = LinkProps & {
  beforeNavigate?: () => void;
  delay?: number;
  className?: string;
  children: React.ReactNode;
  // Pass through any other anchor props
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

function normalizePath(path: string) {
  if (!path) return "/";
  try {
    // Keep only pathname part, drop query/hash
    const onlyPath = path.split("?")[0].split("#")[0];
    if (onlyPath.length > 1 && onlyPath.endsWith("/"))
      return onlyPath.slice(0, -1);
    return onlyPath || "/";
  } catch {
    return path;
  }
}

export function DelayedLink({
  href,
  beforeNavigate,
  delay,
  className,
  children,
  onClick,
  ...rest
}: Props) {
  const { delayedNavigate } = useDelayedNavigation();
  const pathname = usePathname();
  const targetHref = typeof href === "string" ? href : href.pathname || "#";
  const handler = useMemo(
    () =>
      delayedNavigate(typeof href === "string" ? href : href.pathname || "#", {
        beforeNavigate,
        delay,
      }),
    [delayedNavigate, href, beforeNavigate, delay]
  );

  const currentPath = normalizePath(pathname || "/");
  const targetPath = normalizePath(targetHref);

  return (
    <Link
      href={href}
      onClick={(e) => {
        // Always allow consumer onClick side effects first
        onClick?.(e);

        // If navigating to the same route path, skip exit/delay logic.
        // Let Next.js handle default behavior (e.g., hash or query changes) by not preventing default.
        if (currentPath === targetPath) {
          return;
        }

        handler(e);
      }}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
