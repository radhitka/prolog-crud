/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/*.{html,js}', './public/js/*.js'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
