import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        // AWS SBG Neon Branding
        'sbg-dark': '#0a0e27',      // Azul profundo muy oscuro
        'sbg-blue': '#0066ff',      // Azul neon
        'sbg-blue-dark': '#003d99',  // Azul profundo
        'sbg-green': '#00ff00',     // Verde neon
        'sbg-green-dark': '#00aa00', // Verde oscuro
        'sbg-orange': '#ff6600',    // Naranja neon
        'sbg-orange-dark': '#cc5200', // Naranja oscuro
        'sbg-purple': '#cc00ff',    // Morado neon
        'sbg-purple-dark': '#9900cc', // Morado oscuro
        'sbg-grid': '#ffffff',      // Grid lines blancas
        'sbg-grid-light': 'rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        // Grid pattern con líneas blancas
        'grid-pattern': `
          linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)
        `,
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      boxShadow: {
        // Neon glow effects
        'glow-blue': '0 0 10px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3)',
        'glow-green': '0 0 10px rgba(0, 255, 0, 0.5), 0 0 20px rgba(0, 255, 0, 0.3)',
        'glow-orange': '0 0 10px rgba(255, 102, 0, 0.5), 0 0 20px rgba(255, 102, 0, 0.3)',
        'glow-purple': '0 0 10px rgba(204, 0, 255, 0.5), 0 0 20px rgba(204, 0, 255, 0.3)',
        'glow-card': '0 0 20px rgba(0, 102, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05)',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
