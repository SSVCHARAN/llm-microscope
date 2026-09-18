/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#171717",
        border: "#262626",
        primary: "#3b82f6",
        text: {
          main: "#f5f5f5",
          muted: "#a3a3a3"
        }
      },
      keyframes: {
        'subtle-green-pulse': {
          '0%, 33.3%, 66.6%': { 
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            boxShadow: 'none'
          },
          '16.6%, 50%, 83.3%': { 
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.1)'
          },
          '100%': {
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.1)'
          }
        }
      },
      animation: {
        'subtle-green-pulse': 'subtle-green-pulse 1000ms ease-in-out forwards'
      }
    },
  },
  plugins: [],
}
