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
