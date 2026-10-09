import type { Config } from 'tailwindcss';

/**
 * TEMA BLUEMARIN
 *
 * Paleta porneste de la culorile site-ului vechi (#6b98ed / #4048c9 / #f25ca2),
 * dar e organizata pe scari, ca sa poti folosi aceeasi culoare in mai multe
 * intensitati fara sa inventezi valori noi in fiecare componenta.
 *
 * Daca vrei sa schimbi identitatea vizuala, schimba doar valorile de aici.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Albastrul principal — butoane, linkuri, accente
        brand: {
          50: '#f3f7fe',
          100: '#e6eefc',
          200: '#cadcf9',
          300: '#9fc0f3',
          400: '#6b98ed',
          500: '#4f7fe4',
          600: '#3a63d1',
          700: '#3050b5',
          DEFAULT: '#4f7fe4',
          light: '#9fc0f3',
          soft: '#e6eefc',
        },
        // Albastrul inchis al sectiunilor pline
        deep: {
          400: '#4951de',
          500: '#4048c9',
          600: '#3038ab',
          700: '#232a86',
          800: '#151c62',
          900: '#0b1142',
          DEFAULT: '#4048c9',
          alt: '#4951de',
          dark: '#232a86',
          darker: '#151c62',
          night: '#0b1142',
        },
        // Rozul folosit la cifre si la detalii mici
        accent: {
          DEFAULT: '#f25ca2',
          soft: '#fde8f1',
          dark: '#d93f86',
        },
        ink: {
          DEFAULT: '#121829',
          soft: '#3d465f',
          muted: '#6b7490',
        },
        line: 'rgba(18, 24, 41, 0.10)',
        muted: '#6b7490',
      },
      fontFamily: {
        sans: ['var(--font-raleway)', 'Helvetica', 'Arial', 'sans-serif'],
        quote: ['var(--font-crimson)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        headline: '0.08em',
        label: '0.16em',
        wide2: '0.1em',
      },
      maxWidth: {
        content: '1200px',
        prose: '68ch',
      },
      borderRadius: {
        DEFAULT: '4px',
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 24, 41, 0.04), 0 8px 24px -12px rgba(18, 24, 41, 0.14)',
        'card-hover': '0 2px 4px rgba(18, 24, 41, 0.05), 0 20px 40px -16px rgba(18, 24, 41, 0.22)',
        header: '0 1px 0 rgba(18, 24, 41, 0.07), 0 8px 24px -16px rgba(18, 24, 41, 0.3)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.22s ease-out both',
        bob: 'bob 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
