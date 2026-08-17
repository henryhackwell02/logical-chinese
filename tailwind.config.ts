import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hanzi: ["'Noto Serif SC'", "'PingFang SC'", "'Microsoft YaHei'", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
