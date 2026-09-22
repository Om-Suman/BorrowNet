/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0c0e12',
        surface: '#15181e',
        surfaceElevated: '#1e222b',
        accent: '#ff5500',
        accentHover: '#e04b00',
        trust: '#0066ff',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        textPrimary: '#f3f4f6',
        textSecondary: '#9ca3af',
        borderSubtle: 'rgba(255, 255, 255, 0.08)',
        borderStrong: 'rgba(255, 255, 255, 0.16)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      }
    },
  },
  plugins: [],
}
