/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Tailwind blue-600
        secondary: "#F59E0B", // Tailwind amber-500
        background: {
          DEFAULT: "#111827", // Tailwind gray-900
          paper: "#1F2937", // Tailwind gray-800
        },
        text: {
          primary: "#FFFFFF", // White
          secondary: "#9CA3AF", // Tailwind gray-400
        },
      },
    },
  },
  plugins: [],
};
