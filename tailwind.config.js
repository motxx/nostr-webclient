/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'playlist-script': ['Playlist Script', 'cursive'],
        'mplus-2': ['"M PLUS 2"', 'sans-serif'],
        'noto-sans': ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  darkMode: 'media',
  plugins: [],
}
