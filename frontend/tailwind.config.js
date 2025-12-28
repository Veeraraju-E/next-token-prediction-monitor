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
          'bg': '#faf9f7',
          'surface': '#fefdfb',
          'border': '#e8e5e0',
          'divider': '#f0ede8',
          'text': '#1f1d1a',
          'text-secondary': '#6b6658',
          'text-tertiary': '#9c9688',
          'accent': '#8B6F47',
          'accent-hover': '#6B5638',
          'accent-light': '#f5f1eb',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'base': ['16px', { lineHeight: '1.75' }],
      },
      boxShadow: {
        'anthropic': '0 0 0 1px rgba(0, 0, 0, 0.05)',
        'anthropic-subtle': '0 1px 1px 0 rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        'anthropic': '4px',
      },
      transitionDuration: {
        'anthropic': '200ms',
      },
    },
  },
  plugins: [],
}

