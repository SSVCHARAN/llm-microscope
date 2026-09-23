/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background-rgb) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface-rgb) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised-rgb) / <alpha-value>)",
          subtle: "rgb(var(--color-surface-subtle-rgb) / <alpha-value>)",
          border: "var(--color-border)"
        },
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
          hover: "var(--color-border-hover)",
          active: "var(--color-border-active)"
        },
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          hover: "var(--color-primary-hover)",
          muted: "var(--color-primary-muted)",
          glow: "var(--color-primary-glow)"
        },
        text: {
          DEFAULT: "var(--color-text-main)",
          main: "var(--color-text-main)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          dim: "var(--color-text-dim)"
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
