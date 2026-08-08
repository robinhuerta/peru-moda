import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: 'rgb(var(--brand-950) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          accent: '#d12a18'
        },
        ink: 'rgb(var(--ink) / <alpha-value>)'
      },
      boxShadow: {
        soft: '0 25px 80px rgba(0,0,0,0.18)'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        marquee: 'marquee 28s linear infinite'
      }
    }
  },
  plugins: [],
};

export default config;
