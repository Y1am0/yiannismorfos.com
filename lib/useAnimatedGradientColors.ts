"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { settings } from "./settings";

interface ColorScheme {
  color1: { hex: string };
  color2: { hex: string };
  color3: { hex: string };
  color4: { hex: string };
}

interface AnimatedColors {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

// Helper function to interpolate between two hex colors
function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  // Remove # if present
  const c1 = color1.replace("#", "");
  const c2 = color2.replace("#", "");

  // Convert to RGB
  const r1 = parseInt(c1.substr(0, 2), 16);
  const g1 = parseInt(c1.substr(2, 2), 16);
  const b1 = parseInt(c1.substr(4, 2), 16);

  const r2 = parseInt(c2.substr(0, 2), 16);
  const g2 = parseInt(c2.substr(2, 2), 16);
  const b2 = parseInt(c2.substr(4, 2), 16);

  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Helper function to interpolate between two color schemes
function interpolateColorScheme(
  scheme1: ColorScheme,
  scheme2: ColorScheme,
  factor: number
): AnimatedColors {
  return {
    color1: interpolateColor(scheme1.color1.hex, scheme2.color1.hex, factor),
    color2: interpolateColor(scheme1.color2.hex, scheme2.color2.hex, factor),
    color3: interpolateColor(scheme1.color3.hex, scheme2.color3.hex, factor),
    color4: interpolateColor(scheme1.color4.hex, scheme2.color4.hex, factor),
  };
}

export function useAnimatedGradientColors(): AnimatedColors {
  const pathname = usePathname();
  const [currentColors, setCurrentColors] = useState<AnimatedColors>(() => {
    const initialScheme =
      settings.background.colorSchemes["/"] || settings.background.default;
    return {
      color1: initialScheme.color1.hex,
      color2: initialScheme.color2.hex,
      color3: initialScheme.color3.hex,
      color4: initialScheme.color4.hex,
    };
  });

  const currentColorsRef = useRef(currentColors);
  currentColorsRef.current = currentColors;

  useEffect(() => {
    const targetScheme =
      settings.background.colorSchemes[
        pathname as keyof typeof settings.background.colorSchemes
      ] || settings.background.default;

    const startScheme: ColorScheme = {
      color1: { hex: currentColorsRef.current.color1 },
      color2: { hex: currentColorsRef.current.color2 },
      color3: { hex: currentColorsRef.current.color3 },
      color4: { hex: currentColorsRef.current.color4 },
    };

    // Animation duration in milliseconds
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use easeInOutCubic for smooth animation
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const interpolatedColors = interpolateColorScheme(
        startScheme,
        targetScheme,
        easedProgress
      );

      setCurrentColors(interpolatedColors);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [pathname]);

  return currentColors;
}
