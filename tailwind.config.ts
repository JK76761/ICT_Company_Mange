import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07131A",
        paper: "#F5F0E7",
        brass: "#C18A3A",
        moss: "#44624A",
        signal: "#E35D3B"
      },
      boxShadow: {
        panel: "0 10px 40px rgba(7, 19, 26, 0.12)"
      },
      backgroundImage: {
        "mesh-rims":
          "radial-gradient(circle at 10% 10%, rgba(193,138,58,.18), transparent 45%), radial-gradient(circle at 85% 20%, rgba(68,98,74,.16), transparent 40%), radial-gradient(circle at 50% 100%, rgba(227,93,59,.12), transparent 48%)"
      }
    }
  },
  plugins: []
};

export default config;

