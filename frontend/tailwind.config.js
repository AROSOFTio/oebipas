/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          25: '#fbfcfd',
        },
      },
      boxShadow: {
        soft: '0 20px 40px rgba(20, 59, 93, 0.08)',
      },
    },
  },
  plugins: [],
};
