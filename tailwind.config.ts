import defaultTheme from 'tailwindcss/defaultTheme';

module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    }
  },
  plugins: []
}
