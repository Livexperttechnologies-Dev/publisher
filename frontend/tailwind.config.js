/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: 'var(--brand-primary, #690BA8)',
          'purple-hover': 'var(--brand-primary-hover, #57088d)',
          'purple-light': 'var(--brand-primary-light, rgba(105, 11, 168, 0.08))',
          deep: 'var(--brand-deep, #340771)',
          'deep-dark': 'var(--brand-deep-dark, #23044d)',
          magenta: 'var(--brand-accent, #E91E63)',
          'magenta-light': 'var(--brand-accent-light, rgba(233, 30, 99, 0.08))',
          coral: 'var(--brand-coral, #F06A64)',
          'coral-light': 'var(--brand-coral-light, rgba(240, 106, 100, 0.08))',
        },
        surface: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          'border-subtle': '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
