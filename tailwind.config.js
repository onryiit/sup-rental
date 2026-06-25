/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f4fb',
          100: '#b3ddf4',
          500: '#0077b6',
          600: '#005f92',
          700: '#004a72',
        },
      },
    },
  },
  plugins: [],
}
