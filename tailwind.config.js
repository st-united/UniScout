/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '0px',
      xsS: '300px',
      xsM: '410px',
      xsL: '470px',
      sm: '600px',
      smXS: '642px',
      smS: '681px',
      smM: '746px',
      smL: '780px',
      md: '960px', // > iPad gen 9 vertical (810x1080)
      mdS: '1045px',
      mdM: '1120px',
      mdL: '1230px',
      lg: '1281px',
      lgS: '1350px',
      lgM: '1440px',
      lgL: '1600px',
      xl: '1920px',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E67E22',
          light: '#F39C12',
          dark: '#D35400',
        },
        secondary: {
          DEFAULT: '#34495E',
          light: '#2C3E50',
        },
        accent: '#1ABC9C',
        success: '#2ECC71',
        warning: '#F1C40F',
        error: '#E74C3C',
        background: '#F5F7FA',
        text: '#2C3E50',
        'text-light': '#7F8C8D',
        border: '#BDC3C7',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
