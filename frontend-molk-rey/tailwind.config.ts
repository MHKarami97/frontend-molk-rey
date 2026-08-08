import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B5502F',
          dark: '#8F3D22',
        },
        secondary: '#F2E9DE',
        ink: '#2B2521',
        success: '#2F7D5A',
        warning: '#C98A1E',
        danger: '#B23B3B',
        surface: {
          DEFAULT: '#FFFFFF',
          border: '#E4D9C9',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn Variable', 'sans-serif'],
      },
      fontWeight: {
        body: '400',
        label: '500',
        heading: '700',
        hero: '900',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      },
      borderRadius: {
        control: '4px',
        card: '8px',
      },
      borderColor: {
        DEFAULT: '#E4D9C9',
      },
      boxShadow: {
        none: 'none',
        overlay: '0 4px 12px rgba(43, 37, 33, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
