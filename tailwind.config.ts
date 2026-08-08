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
          950: '#090909',
          900: '#111111',
          800: '#1f1f1f',
          accent: '#d12a18'
        }
      },
      boxShadow: {
        soft: '0 25px 80px rgba(0,0,0,0.18)'
      }
    }
  },
  plugins: [],
};

export default config;
