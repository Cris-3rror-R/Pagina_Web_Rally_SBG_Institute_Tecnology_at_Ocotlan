import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        'sbg-dark': '#161d26',
        'sbg-blue': '#44b4ff',
        'sbg-blue-dark': '#44b4ff',
        'sbg-green': '#03e582',
        'sbg-green-dark': '#03e582',
        'sbg-orange': '#ff9900',
        'sbg-orange-dark': '#ff9900',
        'sbg-purple': '#ad5cff',
        'sbg-purple-dark': '#ad5cff',
        'sbg-pink': '#ff57ea',
        'sbg-gray': '#656871',
        white: '#ffffff',
        black: '#000000',
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
