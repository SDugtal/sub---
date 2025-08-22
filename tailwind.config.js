/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Lato', 'Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
