/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { emerald: { 950: '#052b20', 900: '#073b2c', 800: '#0b513d' }, gold: { 400: '#d7b86a', 500: '#ba9140' }, cream: '#f7f2e8', ink: '#171a18' },
    fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Playfair Display', 'serif'] },
    boxShadow: { soft: '0 18px 55px rgba(5,43,32,.10)' }
  }},
  plugins: []
};
