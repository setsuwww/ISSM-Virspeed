/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./_components/**/*.{js,jsx,ts,tsx}",
    "./_constants/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
};

export default config;
