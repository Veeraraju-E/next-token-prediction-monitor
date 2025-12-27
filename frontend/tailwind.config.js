/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'anthropic': {
          'bg': '#fafafa',
          'surface': '#ffffff',
          'border': '#e0e0e0',
          'text': '#1a1a1a',
          'text-secondary': '#6b7280',
          'text-tertiary': '#9ca3af',
          'accent': '#2563eb',
          'accent-hover': '#1d4ed8',
          'accent-light': '#eff6ff',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'anthropic': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'anthropic-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}

