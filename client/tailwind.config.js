/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        quran: {
          emerald: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#0d422b',
            950: '#062518',
          },
          parchment: {
            50: '#fcfbf7',
            100: '#f8f5eb',
            200: '#ede7d5',
            300: '#dfd5bb',
          },
          gold: {
            300: '#f4d87f',
            400: '#e4bf58',
            500: '#d4af37',
            600: '#b38e22',
            700: '#8c6c13',
          },
          dark: {
            800: '#15221c',
            900: '#0e1814',
            950: '#070d0a',
          }
        },
        tajweed: {
          ghunnah: '#e11d48',
          qalqalah: '#2563eb',
          idgham: '#8b5cf6',
          ikhfa: '#059669',
          madd: '#ea580c',
          tafkhim: '#0284c7',
          iqlab: '#d97706',
          tarqiq: '#64748b'
        }
      },
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
        uthmani: ['KFGQPC Uthman Taha Naskh', 'Amiri', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'spiritual': '0 10px 30px -5px rgba(6, 37, 24, 0.08), 0 4px 6px -2px rgba(6, 37, 24, 0.04)',
        'spiritual-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
