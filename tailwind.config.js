/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
          colors: {
      brand: { DEFAULT: '#3ebbec', light: '#7fd4f0', dark: '#2a9d8f' }
    }
    },
  },
  plugins: [],
};

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#3ebbec', light: '#7fd4f0', dark: '#2a9d8f' }
      }
    },
  },
  plugins: [],
};