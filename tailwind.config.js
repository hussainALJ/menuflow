/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fdf6ee',
          100: '#f9e8cf',
          200: '#f3ce9b',
          300: '#ecad5e',
          400: '#e6913a',
          500: '#d97320',
          600: '#c05a17',
          700: '#9f4316',
          800: '#803619',
          900: '#692e18',
          950: '#3c1509',
        },
        surface: {
          50:  '#fafaf8',
          100: '#f4f3f0',
          200: '#e8e7e2',
          300: '#d5d3cc',
          400: '#b0ada4',
          500: '#8a8780',
          600: '#6e6b64',
          700: '#595650',
          800: '#4a4842',
          900: '#3d3b37',
          950: '#1e1d1a',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'warm': '0 4px 24px -4px rgba(217, 115, 32, 0.15)',
        'warm-lg': '0 8px 40px -8px rgba(217, 115, 32, 0.25)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'pulse-warm': 'pulseWarm 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseWarm: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 115, 32, 0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(217, 115, 32, 0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
