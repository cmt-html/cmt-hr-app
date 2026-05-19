/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ← enables class-based dark mode (controlled by ThemeContext)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          150: '#e8edf5',
          350: '#94a8c0',
          450: '#707f94',
          550: '#556070',
          650: '#404f66',
          750: '#243147',
          850: '#152033',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Sleek Indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50: '#f0fdfa',
          500: '#0d9488', // Cyan/Teal
        },
        dark: {
          50: '#f8fafc',
          900: '#0f172a', // Slate-900 background
          950: '#020617', // Extra dark
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
