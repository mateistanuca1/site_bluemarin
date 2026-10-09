import type { Config } from 'tailwindcss';

/**
 * TEMA BLUEMARIN
 * Culorile sunt preluate din site-ul vechi (tema Brooklyn).
 * Daca vrei sa schimbi paleta, schimba doar valorile de mai jos
 * si se actualizeaza tot site-ul.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Albastrul principal Bluemarin - butoane, accente, linkuri
        brand: {
          DEFAULT: '#6b98ed',
          light: '#6fa0ff',
          soft: '#e8effc',
        },
        // Albastrul inchis folosit pe fundalurile de secțiune
        deep: {
          DEFAULT: '#4048c9',
          alt: '#4951de',
          dark: '#142b8c',
          darker: '#061982',
          night: '#100c6d',
        },
        // Rozul folosit la cifrele din countere
        accent: '#f25ca2',
        ink: '#151515',
        muted: '#7a7a7a',
      },
      fontFamily: {
        sans: ['var(--font-raleway)', 'Helvetica', 'Arial', 'sans-serif'],
        quote: ['var(--font-crimson)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        headline: '0.18em',
        wide2: '0.1em',
      },
      maxWidth: {
        content: '1180px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
