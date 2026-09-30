/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          dark: '#0B0F19',
          card: '#151C2C',
          border: '#242F46',
          critical: '#EF4444',
          warning: '#F59E0B',
          normal: '#10B981',
          info: '#3B82F6',
          purple: '#8B5CF6',
        }
      }
    },
  },
  plugins: [],
}
