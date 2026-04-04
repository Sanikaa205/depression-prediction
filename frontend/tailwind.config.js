/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom depression severity colors
        severe: '#ef4444',      // Red - severe
        moderate: '#f97316',    // Orange - moderate
        mild: '#eab308',        // Yellow - mild
        normal: '#22c55e',      // Green - normal
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
