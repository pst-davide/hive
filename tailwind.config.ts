import defaultTheme from 'tailwindcss/defaultTheme';

module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,js,jsx,scss}"
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
