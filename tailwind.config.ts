import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        'task-lineitem': '#2563eb',
        'task-component': '#0d9488',
        'task-element': '#4f46e5',
        'task-fixed': '#ca8a04',
        'gantt-grid': '#f1f5f9',
        'gantt-today': '#fef3c7',
      },
      animation: {
        'task-appear': 'task-appear 0.3s ease-out',
      },
      keyframes: {
        'task-appear': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;