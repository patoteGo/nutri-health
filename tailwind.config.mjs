/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#43C59E', // Green as primary
          DEFAULT: '#43C59E',
          dark: '#43C59E',
        },
        secondary: {
          light: '#3D7068', // Deep teal as secondary
          dark: '#14453D',
        },
        accent: {
          light: '#14453D', // Dark accent
          dark: '#3D7068',
        },
        bg: {
          light: '#FFFFFF',
          dark: '#14453D',
        },
        text: {
          light: '#14453D',
          dark: '#43C59E', // Updated to match dark mode foreground
        },
      },
    },
  },
  plugins: [],
};
