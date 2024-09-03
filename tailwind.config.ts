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
      height: {
        'screen-minus-160': 'calc(100vh - 160px)',
      },
      transitionProperty: {
        width: 'width',
        opacity: 'opacity',
      },
      transitionDuration: {
        '400': '400ms',
        '300': '300ms',
      },
      opacity: {
        0: '0',
        100: '1',
      },
    }
  },
  plugins: []
}
