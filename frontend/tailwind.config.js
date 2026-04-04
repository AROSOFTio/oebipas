/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1455c6',
          dark: '#0f4299',
        },
        sidebar: {
          DEFAULT: '#0b2e63',
        },
        accent: {
          red: '#b12917',
          green: '#12b76a',
          orange: '#f79009',
        },
        background: '#f5f7fb',
        border: '#dfe5ef',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
