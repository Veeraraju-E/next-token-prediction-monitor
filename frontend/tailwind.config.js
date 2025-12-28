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
          'surface': '#fefefe',
          'border': '#e5e5e5',
          'divider': '#f0f0f0',
          'text': '#1f1f1f',
          'text-secondary': '#6b7280',
          'text-tertiary': '#9ca3af',
          'accent': '#2563eb',
          'accent-hover': '#1e40af',
          'accent-light': '#f0f4ff',
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

