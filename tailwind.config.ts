import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#f6f3f1",
        "lake-blue": "#2b59d1",
        "periwinkle-mist": "#cfdaf5",
        "sky-blue": "#a0b5eb",
        mint: "#a7fccd",
        coral: "#ff9473",
        gold: "#ecda98",
        crimson: "#f37a0a",
        "off-black": "#242424",
        ink: "#000000",
        graphite: "#4e4d4d",
        smoke: "#797776",
        ash: "#cecac8",
      },
      fontFamily: {
        mono: [
          "ABC Diatype Mono",
          "JetBrains Mono",
          "IBM Plex Mono",
          "Consolas",
          "monospace",
        ],
        serif: [
          "Untitled Serif",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "1.2" }],
        "body-sm": ["14px", { lineHeight: "1.35" }],
        body: ["16px", { lineHeight: "1.35" }],
        label: ["18px", { lineHeight: "1.2" }],
        "body-lg": ["20px", { lineHeight: "1.35" }],
        subheading: ["24px", { lineHeight: "1.2" }],
        "heading-sm": ["32px", { lineHeight: "1.2" }],
        heading: ["40px", { lineHeight: "1.2" }],
        "heading-lg": ["48px", { lineHeight: "1.2" }],
        display: ["80px", { lineHeight: "1.2" }],
      },
      borderRadius: {
        card: "40px",
        button: "100px",
        tag: "9999px",
        pill: "9999px",
      },
      spacing: {
        "8": "8px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "40": "40px",
        "64": "64px",
        "72": "72px",
        "80": "80px",
      },
      borderWidth: {
        hairline: "1px",
      },
    },
  },
  plugins: [],
};

export default config;
