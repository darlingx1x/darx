/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700', // Gold color from the original site
        dark: '#121212',
      },
      fontFamily: {
        mono: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
}