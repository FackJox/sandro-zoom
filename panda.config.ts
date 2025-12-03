import { defineConfig } from '@pandacss/dev';

const fonts = {
  trade: {
    value: '"Trade Gothic Next", "Trade Gothic", "Oswald", system-ui, sans-serif'
  },
  plex: {
    value: '"IBM Plex Sans", "Space Grotesk", system-ui, sans-serif'
  }
};

const colors = {
  blackStallion: { value: '#0f171a' },
  blackPearl: { value: '#20292b' },
  coverOfNight: { value: '#464f4c' },
  phantom: { value: '#707977' },
  walrus: { value: '#939c9a' },
  tradewind: { value: '#b7c6cc' },
  silverplate: { value: '#c0bfb6' },
  eggToast: { value: '#f6c605' }
};

const semanticColors = {
  bg: { value: '{colors.blackStallion}' },
  surface: { value: '{colors.blackPearl}' },
  text: { value: '{colors.silverplate}' },
  muted: { value: '{colors.phantom}' },
  accent: { value: '{colors.eggToast}' },
  border: { value: '{colors.coverOfNight}' }
};

const radii = {
  none: { value: '0' },
  sharp: { value: '2px' },
  subtle: { value: '4px' }
};

const fontSizes = {
  xs: { value: '0.75rem' },
  sm: { value: '0.85rem' },
  md: { value: '1rem' },
  lg: { value: '1.35rem' },
  xl: { value: '2.1rem' },
  '2xl': { value: '3rem' }
};

const letterSpacings = {
  tight: { value: '-0.04em' },
  looser: { value: '0.12em' }
};

const lineHeights = {
  snug: { value: '1.2' },
  relaxed: { value: '1.5' }
};

const animations = {
  brandEnter: {
    value: 'cubic-bezier(0.19, 1, 0.22, 1)'
  }
};

const durations = {
  ui: { value: '0.24s' },
  section: { value: '0.4s' },
  hero: { value: '0.55s' }
};

const motionLevels = {
  l1: { value: '0.4' },
  l2: { value: '0.7' },
  l3: { value: '1.0' }
};

export default defineConfig({
  presets: ['@pandacss/preset-panda'],
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx,svelte}'],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors,
        radii,
        fonts,
        fontSizes,
        letterSpacings,
        lineHeights,
        animations,
        durations,
        motionLevels
      },
      semanticTokens: {
        colors: semanticColors
      },
      recipes: {
        heading: {
          className: 'heading',
          base: {
            fontFamily: '{fonts.trade}',
            textTransform: 'uppercase',
            letterSpacing: '{letterSpacings.looser}',
            color: '{colors.accent}'
          },
          variants: {
            size: {
              sm: { fontSize: '{fontSizes.sm}' },
              md: { fontSize: '{fontSizes.lg}' },
              lg: { fontSize: '{fontSizes.xl}' }
            }
          },
          defaultVariants: { size: 'md' }
        },
        body: {
          className: 'body',
          base: {
            fontFamily: '{fonts.plex}',
            color: '{colors.text}',
            lineHeight: '{lineHeights.relaxed}'
          },
          variants: {
            tone: {
              muted: { color: '{colors.muted}' },
              standard: { color: '{colors.text}' }
            }
          },
          defaultVariants: { tone: 'standard' }
        }
      }
    }
  },
  outdir: 'src/styled-system'
});
