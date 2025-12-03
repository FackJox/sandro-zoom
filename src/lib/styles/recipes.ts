import { cva } from '$styled-system/css';
import { token } from '$styled-system/tokens';

export const lensBadge = cva({
  base: {
    borderRadius: 'full',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: token('colors.eggToast'),
    backgroundColor: token('colors.eggToast'),
    boxShadow: `0 0 0 1px ${token('colors.blackPearl')}`,
    fontFamily: token('fonts.plex'),
    fontSize: token('fontSizes.xs'),
    textTransform: 'uppercase',
    letterSpacing: token('letterSpacings.looser'),
    color: token('colors.blackStallion'),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: token('lineHeights.normal'),
    textAlign: 'center'
  },
  variants: {
    tone: {
      solid: {
        backgroundColor: token('colors.eggToast')
      },
      ghost: {
        backgroundColor: 'transparent',
        color: token('colors.eggToast')
      }
    }
  },
  defaultVariants: {
    tone: 'solid'
  }
});

export const metadataStrip = cva({
  base: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    textTransform: 'uppercase',
    fontFamily: token('fonts.plex'),
    letterSpacing: token('letterSpacings.looser'),
    fontSize: token('fontSizes.xs'),
    color: token('colors.silverplate'),
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderColor: token('colors.coverOfNight'),
    paddingTop: '1.25rem',
    paddingBottom: '0.75rem',
    textAlign: 'center'
  },
  variants: {
    variant: {
      hero: {},
      logos: {
        backgroundColor: token('colors.blackPearl'),
        color: token('colors.accent'),
        letterSpacing: '0.16em'
      }
    }
  },
  defaultVariants: {
    variant: 'hero'
  }
});

export const filmCard = {
  root: cva({
    base: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      color: token('colors.silverplate'),
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: token('colors.coverOfNight'),
      backgroundColor: token('colors.blackPearl')
    },
    variants: {
      size: {
        mobile: { paddingInline: '1rem', paddingBlock: '1.5rem' },
        desktop: { paddingInline: '2rem', paddingBlock: '2.5rem' }
      }
    },
    defaultVariants: {
      size: 'mobile'
    }
  }),
  media: cva({
    base: {
      width: '100%',
      aspectRatio: '2.39 / 1',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: token('colors.coverOfNight'),
      overflow: 'hidden',
      backgroundColor: token('colors.blackPearl')
    }
  }),
  body: cva({
    base: {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: token('colors.coverOfNight'),
      backgroundColor: token('colors.blackPearl'),
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }
  })
};

export const stepIndicator = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: token('fonts.plex'),
    fontSize: token('fontSizes.xs'),
    letterSpacing: token('letterSpacings.looser'),
    textTransform: 'uppercase',
    color: token('colors.walrus'),
    opacity: 0.7,
    transition: 'color 0.2s ease, opacity 0.2s ease',
    '&::before': {
      content: '""',
      width: '0.4rem',
      height: '0.4rem',
      borderRadius: '999px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: token('colors.eggToast'),
      backgroundColor: 'transparent',
      transition: 'background-color 0.2s ease, transform 0.2s ease'
    }
  },
  variants: {
    active: {
      true: {
        color: token('colors.eggToast'),
        opacity: 1,
        '&::before': {
          backgroundColor: token('colors.eggToast'),
          transform: 'scale(1.2)'
        }
      },
      false: {}
    }
  },
  defaultVariants: {
    active: false
  }
});
