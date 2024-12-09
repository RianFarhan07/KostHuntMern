/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffc107",
        onPrimary: "#ffffff",
        primaryVariant: "#ffa000",
        secondary: "#03a9f4",
        background: "#ffffff",
        surface: "#fafafa",
        onsurface: "#000000",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
