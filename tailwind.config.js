module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateColumns: {
        'main-details': 'auto 1fr',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
