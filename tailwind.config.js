/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)', surface: 'rgb(var(--surface) / <alpha-value>)', raised: 'rgb(var(--raised) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)', muted: 'rgb(var(--muted) / <alpha-value>)', line: 'rgb(var(--line) / <alpha-value>)',
        forest: 'rgb(var(--forest) / <alpha-value>)', moss: 'rgb(var(--moss) / <alpha-value>)', sand: 'rgb(var(--sand) / <alpha-value>)',
        earth: 'rgb(var(--earth) / <alpha-value>)', sunset: 'rgb(var(--sunset) / <alpha-value>)', onforest: 'rgb(var(--onforest) / <alpha-value>)',
        ok: 'rgb(var(--ok) / <alpha-value>)', warn: 'rgb(var(--warn) / <alpha-value>)', danger: 'rgb(var(--danger) / <alpha-value>)', info: 'rgb(var(--info) / <alpha-value>)',
      },
      fontFamily: { display: ['"Suez One"', 'Assistant', 'system-ui', 'serif'], sans: ['Assistant', 'system-ui', 'Arial', 'sans-serif'] },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: { card: '0 1px 2px rgb(var(--shadow) / .06), 0 6px 20px -8px rgb(var(--shadow) / .18)', lift: '0 12px 32px -12px rgb(var(--shadow) / .35)' },
    },
  },
  plugins: [],
};
