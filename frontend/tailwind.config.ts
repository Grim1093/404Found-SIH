import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
          elevated: 'var(--surface-elevated)',
        },
        border: {
          DEFAULT: 'var(--border)',
          hover: 'var(--border-hover)',
        },
        ring: 'var(--ring)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        genuine: {
          DEFAULT: 'var(--genuine)',
          muted: 'var(--genuine-muted)',
        },
        suspicious: {
          DEFAULT: 'var(--suspicious)',
          muted: 'var(--suspicious-muted)',
        },
        cloned: {
          DEFAULT: 'var(--cloned)',
          muted: 'var(--cloned-muted)',
        },
        critical: {
          DEFAULT: 'var(--critical)',
          muted: 'var(--critical-muted)',
        },
        info: {
          DEFAULT: 'var(--info)',
          muted: 'var(--info-muted)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
    },
  },
  plugins: [],
};

export default config;
