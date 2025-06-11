/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./admin.html",
    "./admin.tsx",
    "./AdminApp.tsx",
    "./App.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom theme extensions can be added here
      maxWidth: {
        '7xl': '80rem',
      }
    },
  },
  plugins: [],
}
