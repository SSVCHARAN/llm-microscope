/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090A0C",
        surface: {
          DEFAULT: "#111317",
          raised: "#16191F",
          subtle: "#0D0F12"
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.05)",
          hover: "rgba(255, 255, 255, 0.15)",
          active: "rgba(16, 185, 129, 0.4)"
        },
        primary: {
          DEFAULT: "#10b981",
          hover: "#059669",
          muted: "rgba(16, 185, 129, 0.15)",
          glow: "rgba(16, 185, 129, 0.3)"
        },
        text: {
          main: "#EDEDED",
          secondary: "#D4D4D8",
          muted: "#94A3B8",
          dim: "#64748B"
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace']
      },
      keyframes: {
        'subtle-green-pulse': {
          '0%, 33.3%, 66.6%': { 
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            boxShadow: 'none'
          },
          '16.6%, 50%, 83.3%': { 
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.15)'
          },
          '100%': {
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.15)'
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
