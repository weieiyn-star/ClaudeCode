import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b1020',
          800: '#141a30',
          700: '#1d2543',
          500: '#4b5475',
          300: '#9aa3c2',
          100: '#e5e8f2',
        },
        accent: {
          warn: '#f0a23a',
          bad: '#e15457',
          good: '#3bc28b',
          info: '#5b8def',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
