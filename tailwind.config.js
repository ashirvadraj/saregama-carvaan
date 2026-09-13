/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          dark: '#0e0b16',
          surface: '#18122B',
          card: '#22194D',
          gold: '#E5A93C',
          amber: '#F39C12',
          cream: '#FFF4E0',
          muted: '#9B90B2',
          accent: '#D97706'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 18s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.35s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.35s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      }
    },
  },
  plugins: [],
}
