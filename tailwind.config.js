/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: '#0f766e', // teal-700
          oscuro: '#115e59', // teal-800
          claro: '#ccfbf1', // teal-100
        },
      },
    },
  },
  plugins: [],
}
