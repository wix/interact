/**
 * Shared Tailwind config — keeps colors, fonts, and tokens consistent across pages.
 * Both pages load Tailwind CDN, then this script sets the config.
 */
tailwind.config = {
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      helvetica: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        'off-black': '#111111',
        'apple-gray': '#86868b',
      },
      fontSize: {
        'giant': ['6rem', { lineHeight: '1' }],
        'mega': ['11rem', { lineHeight: '0.9' }],
      },
      letterSpacing: {
        'tighter': '-0.04em',
      }
    }
  }
};
