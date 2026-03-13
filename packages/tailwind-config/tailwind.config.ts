import type { Config } from 'tailwindcss';

export default {
  content: [
    '../../apps/*/src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        'studio-black': '#0a0a0b',
        'studio-surface': '#141417',
        'studio-surface-hover': '#1a1a1f',
        'studio-surface-active': '#222228',
        'studio-border': '#2a2a32',
        'studio-border-bright': '#3a3a44',

        // Text
        'studio-text': '#e8e8ec',
        'studio-text-muted': '#8888a0',
        'studio-text-dim': '#555568',

        // Accent — Electric Cyan
        'studio-cyan': '#00d4ff',
        'studio-cyan-hover': '#00bfe6',
        'studio-cyan-muted': '#00d4ff1a',
        'studio-cyan-border': '#00d4ff33',

        // Secondary — Magenta
        'studio-magenta': '#ff0066',
        'studio-magenta-hover': '#e6005c',
        'studio-magenta-muted': '#ff00661a',

        // Status
        'studio-success': '#00cc88',
        'studio-warning': '#ffaa00',
        'studio-error': '#ff3344',

        // Pillar identity colors
        'pillar-label': '#00d4ff',
        'pillar-transfer': '#ff0066',
        'pillar-device': '#ffaa00',
        'pillar-market': '#00cc88',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'xs': ['0.6875rem', { lineHeight: '1rem' }],
        'sm': ['0.75rem', { lineHeight: '1.125rem' }],
        'base': ['0.8125rem', { lineHeight: '1.25rem' }],
        'md': ['0.875rem', { lineHeight: '1.375rem' }],
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'studio': '6px',
        'studio-lg': '8px',
        'studio-xl': '12px',
      },
      boxShadow: {
        'studio': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'studio-lg': '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'studio-glow-cyan': '0 0 20px rgba(0,212,255,0.15)',
        'studio-glow-magenta': '0 0 20px rgba(255,0,102,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
