/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme
        warm: {
          50: '#fef8ea',
          100: '#fef3d8',
          200: '#efe7d8',
          300: '#e5d9c7',
          400: '#d9c7ad',
          500: '#c4a88a',
          600: '#a8885a',
          700: '#8a6b45',
          800: '#6b5434',
          900: '#4a3a23',
        },
        // Accent colors
        burnt: {
          DEFAULT: '#b2421a',
          light: '#d96b2a',
          dark: '#8a2e0f',
        },
        teal: {
          DEFAULT: '#0f6f60',
          light: '#1a8b7c',
          dark: '#0a4d45',
        },
        slate: {
          950: '#0f0f14',
          900: '#1a1a1e',
          800: '#25252d',
        },
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['15px', '24px'],
        lg: ['16px', '24px'],
        xl: ['18px', '28px'],
        '2xl': ['20px', '30px'],
        '3xl': ['24px', '32px'],
        '4xl': ['30px', '40px'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 10px 30px rgba(70, 41, 9, 0.08)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        title: ['Open Sans', 'Segoe UI', 'sans-serif'],
        main: ['Open Sans', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        slideDown: 'slideDown 0.15s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

