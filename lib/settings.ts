export const settings = {
  background: {
    speed: 5.5,
    colorSchemes: {
      "/": {
        color1: { hex: "#000000" }, // Pure black
        color2: { hex: "#000000" }, // Very dark gray
        color3: { hex: "#000000" }, // Dark gray
        color4: { hex: "#0000ff" }, // Medium gray
      },
      "/hello": {
        color1: { hex: "#0000ff" },
        color2: { hex: "#0000ff" },
        color3: { hex: "#0000ff" },
        color4: { hex: "#00c0ff" },
      },
      "/who": {
        variants: {
          base: {
            color1: { hex: "#00c0ff" },
            color2: { hex: "#0000ff" },
            color3: { hex: "#0000ff" },
            color4: { hex: "#0000ff" },
          },
          ai: {
            // Mostly black with layered purples
            color1: { hex: "#000000" },
            color2: { hex: "#000000" },
            color3: { hex: "#5a00c8" },
            color4: { hex: "#000000" },
          },
        },
        defaultVariant: "base",
      },
      "/what": {
        color1: { hex: "#0000ff" },
        color2: { hex: "#000000" },
        color3: { hex: "#000000" },
        color4: { hex: "#0000ff" },
      },
      "/connect": {
        variants: {
          base: {
            color1: { hex: "#00c0ff" },
            color2: { hex: "#0000ff" },
            color3: { hex: "#0000ff" },
            color4: { hex: "#00c0ff" },
          },
          success: {
            color1: { hex: "#00ff00" },
            color2: { hex: "#00b300" },
            color3: { hex: "#003700" },
            color4: { hex: "#00b300" },
          },
        },
        defaultVariant: "base",
      },
      "/blog": {
        color1: { hex: "#0000ff" },
        color2: { hex: "#000060" },
        color3: { hex: "#0000df" },
        color4: { hex: "#000000" },
      },
    },
    // Fallback colors for unknown routes
    default: {
      color1: { hex: "#000000" },
      color2: { hex: "#000000" },
      color3: { hex: "#000000" },
      color4: { hex: "#0000ff" },
    },
  },
};
