/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brew: {
          'darkest': '#0f2018',
          'dark': '#1b4332',
          'mid': '#2d6a4f',
          'light': '#40916c',
          'lighter': '#52b788',
          'accent': '#82a584',
          'pale': '#95d5b2',
          'lightest': '#d8f3dc',
        },
        success: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        error: {
          light: '#fca5a5',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        chat: {
          'bg': '#2d2d2d',
          'message': '#374151',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(100px) scale(0)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        messageSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInBackdrop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}