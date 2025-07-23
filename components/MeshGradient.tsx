"use client";

import { useAnimatedGradientColors } from "@/lib/useAnimatedGradientColors";
import { MeshGradient, MeshGradientProps } from "@paper-design/shaders-react";
import { useEffect } from "react";

export function MeshGradientComponent({
  speed,
  ...props
}: Omit<MeshGradientProps, "colors">) {
  const animatedColors = useAnimatedGradientColors();

  useEffect(() => {
    document.body.classList.add("opacity-100");
  }, []);

  return (
    <MeshGradient
      {...props}
      colors={[
        animatedColors.color1,
        animatedColors.color2,
        animatedColors.color3,
        animatedColors.color4,
      ]}
      speed={speed ? speed / 10 : 0.25}
    />
  );
}
