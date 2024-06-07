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
      scrollBehavior: {
        smooth: 'smooth',
      },
      hideScrollbar: {
        '-ms-overflow-style': 'none' /* IE and Edge */,
        'scrollbar-width': 'none' /* Firefox */,
        '&::-webkit-scrollbar': {
          display: 'none' /* Chrome, Safari, and Opera */,
        },
      },
    },
  },
  variants: {},
  plugins: [
    function ({ addUtilities }) {
      addUtilities(
        {
          '.hide-scrollbar': {
            '-ms-overflow-style': 'none' /* IE and Edge */,
            'scrollbar-width': 'none' /* Firefox */,
            '&::-webkit-scrollbar': {
              display: 'none' /* Chrome, Safari, and Opera */,
            },
          },
        },
        ['responsive']
      )
    },
  ],
  darkMode: 'media',
}
