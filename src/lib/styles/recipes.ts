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
    borderColor: token('colors.eggToast'),
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

// Step indicator with mask wipe animation (§3.5)
export const stepIndicatorItem = cva({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    overflow: 'hidden'
  }
});

export const stepIndicatorBase = cva({
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
    '&::before': {
      content: '""',
      width: '0.4rem',
      height: '0.4rem',
      borderRadius: '999px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: token('colors.eggToast'),
      backgroundColor: 'transparent'
    }
  }
});

export const stepIndicatorActive = cva({
  base: {
    position: 'absolute',
    inset: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: token('fonts.plex'),
    fontSize: token('fontSizes.xs'),
    letterSpacing: token('letterSpacings.looser'),
    textTransform: 'uppercase',
    color: token('colors.eggToast'),
    opacity: 1,
    clipPath: 'inset(0 100% 0 0)',
    '&::before': {
      content: '""',
      width: '0.4rem',
      height: '0.4rem',
      borderRadius: '999px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: token('colors.eggToast'),
      backgroundColor: token('colors.eggToast'),
      transform: 'scale(1.2)'
    }
  }
});

// Legacy export for backward compatibility
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

// Film Exit Portal styles (Framework 2 §4.3)
export const filmExitOverlay = cva({
  base: {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.eggToast'),
    borderRadius: '999px',
    opacity: 0,
    mixBlendMode: 'screen',
    transformOrigin: 'center center',
    filter: 'blur(1px)'
  }
});

export const filmExitPreviewStrip = cva({
  base: {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '1rem',
    opacity: 0,
    pointerEvents: 'none',
    gap: '1rem'
  }
});

export const filmExitPreviewCard = cva({
  base: {
    width: '28%',
    aspectRatio: '1 / 0.65',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.coverOfNight'),
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(15, 23, 26, 0.8)',
    position: 'relative'
  }
});

export const filmExitPreviewVideo = cva({
  base: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
});

export const filmExitPreviewLabel = cva({
  base: {
    position: 'absolute',
    left: '0.5rem',
    right: '0.5rem',
    bottom: '0.4rem',
    fontSize: '0.65rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: token('colors.eggToast'),
    textShadow: '0 0 6px rgba(0, 0, 0, 0.6)'
  }
});

export const filmExitStickyLabel = cva({
  base: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontFamily: token('fonts.trade'),
    color: token('colors.eggToast'),
    opacity: 0
  }
});

// Film Stories Section styles (Framework 3)
export const filmStoryViewport = cva({
  base: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.eggToast'),
    overflow: 'hidden',
    backgroundColor: token('colors.blackPearl')
  }
});

export const filmStoryCard = cva({
  base: {
    position: 'absolute',
    inset: 0,
    willChange: 'transform, opacity'
  }
});

export const filmStoryMedia = cva({
  base: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
});

export const filmStoryPanel = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: 'rgba(15, 23, 26, 0.85)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.coverOfNight'),
    borderRadius: '4px'
  },
  variants: {
    layout: {
      mobile: {
        marginTop: '1.5rem'
      },
      desktop: {
        marginTop: 0,
        alignSelf: 'center'
      }
    }
  },
  defaultVariants: {
    layout: 'mobile'
  }
});

export const filmStoryTitle = cva({
  base: {
    fontFamily: token('fonts.trade'),
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: token('colors.eggToast'),
    lineHeight: '1.2'
  },
  variants: {
    size: {
      sm: { fontSize: '1rem' },
      md: { fontSize: '1.25rem' },
      lg: { fontSize: '1.5rem' }
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export const filmStoryBody = cva({
  base: {
    fontFamily: token('fonts.plex'),
    fontSize: '1rem',
    lineHeight: '1.6',
    color: token('colors.silverplate')
  }
});

export const filmStoryFocusRing = cva({
  base: {
    position: 'absolute',
    width: '80px',
    height: '80px',
    borderRadius: '999px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: token('colors.eggToast'),
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    transform: 'translate(-50%, -50%)',
    opacity: 0
  }
});

export const filmStoriesExitRing = cva({
  base: {
    position: 'absolute',
    inset: 0,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.eggToast'),
    borderRadius: '999px',
    opacity: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    transformOrigin: 'center center'
  }
});

export const filmStoriesVerticalStrip = cva({
  base: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 10
  }
});

export const filmStoriesStripCard = cva({
  base: {
    position: 'relative',
    width: '4rem',
    aspectRatio: '16 / 9',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.coverOfNight'),
    borderRadius: '2px',
    overflow: 'hidden',
    opacity: 0.7,
    filter: 'grayscale(0.5)',
    backgroundColor: token('colors.blackPearl')
  }
});

export const filmStoriesStripCardMedia = cva({
  base: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none'
  }
});

export const filmStoriesStripLabel = cva({
  base: {
    position: 'absolute',
    bottom: '-1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '0.55rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: token('colors.eggToast'),
    whiteSpace: 'nowrap'
  }
});

export const filmStoriesStatsPreview = cva({
  base: {
    position: 'absolute',
    right: '2rem',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '1.5rem',
    backgroundColor: 'rgba(15, 23, 26, 0.9)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.coverOfNight'),
    borderRadius: '4px',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 10,
    minWidth: '12rem'
  }
});

export const filmStoriesStatsHeading = cva({
  base: {
    fontFamily: token('fonts.trade'),
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: token('colors.eggToast'),
    marginBottom: '0.75rem'
  }
});

export const filmStoriesStatsLine = cva({
  base: {
    fontFamily: token('fonts.plex'),
    fontSize: '0.8rem',
    color: token('colors.silverplate'),
    marginBottom: '0.35rem'
  }
});

export const filmStoriesExitFocusRing = cva({
  base: {
    position: 'absolute',
    width: '5rem',
    height: '3rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: token('colors.eggToast'),
    borderRadius: '6px',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    transform: 'translate(-50%, -50%)',
    opacity: 0
  }
});

// Film Stories Entry styles (Framework 3 §3.2)
export const filmStoriesEntryStrip = cva({
  base: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    zIndex: 20,
    opacity: 0
  }
});

export const filmStoriesEntryFrame = cva({
  base: {
    width: '12vw',
    minWidth: '80px',
    maxWidth: '140px',
    aspectRatio: '16 / 9',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.coverOfNight'),
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: token('colors.blackPearl'),
    opacity: 0.6,
    filter: 'blur(2px) grayscale(0.5)',
    transition: 'opacity 0.2s, filter 0.2s'
  },
  variants: {
    active: {
      true: {
        opacity: 1,
        filter: 'blur(0) grayscale(0)',
        borderColor: token('colors.eggToast')
      }
    }
  }
});

export const filmStoriesEntryMedia = cva({
  base: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
});

export const filmStoriesEntryFocusRing = cva({
  base: {
    position: 'absolute',
    width: '14vw',
    height: '8vw',
    minWidth: '90px',
    minHeight: '50px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: token('colors.eggToast'),
    borderRadius: '8px',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    transform: 'translate(-50%, -50%)',
    opacity: 0
  }
});

export const filmStoriesEntryDivider = cva({
  base: {
    width: '2px',
    height: '6vh',
    backgroundColor: token('colors.coverOfNight'),
    opacity: 0.5
  }
});

// ─────────────────────────────────────────────────────────────────
// Shared Portal & Focus Ring Styles (used across sections)
// ─────────────────────────────────────────────────────────────────

// Portal focus ring - accent circle that pulses during transitions
export const portalFocusRing = cva({
  base: {
    position: 'absolute',
    borderRadius: '999px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: token('colors.accent'),
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    transform: 'translate(-50%, -50%)',
    top: 0,
    left: 0
  },
  variants: {
    size: {
      sm: { width: '48px', height: '48px' },
      md: { width: '70px', height: '70px' },
      lg: { width: '90px', height: '90px' },
      xl: { width: '100px', height: '100px' }
    },
    position: {
      topLeft: { top: 0, left: 0 },
      center: { top: '50%', left: '50%' }
    }
  },
  defaultVariants: {
    size: 'md',
    position: 'topLeft'
  }
});

// Portal mask - fixed overlay for section transitions
export const portalMask = cva({
  base: {
    position: 'fixed',
    borderRadius: '999px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.accent'),
    opacity: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    zIndex: 14,
    transform: 'translate(-50%, -50%)',
    backgroundColor: `color-mix(in srgb, ${token('colors.blackStallion')} 50%, transparent)`
  },
  variants: {
    size: {
      sm: { width: '36px', height: '36px' },
      md: { width: '48px', height: '48px' },
      lg: { width: '60px', height: '60px' }
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

// Portal entry overlay - full-screen clip-path masked container
export const portalEntryOverlay = cva({
  base: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 15,
    opacity: 0,
    clipPath: 'circle(0% at 50% 50%)'
  }
});

// Outside blur layer - backdrop blur during portal transitions
export const portalOutsideBlur = cva({
  base: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 14,
    opacity: 0,
    backdropFilter: 'blur(0px)',
    backgroundColor: 'transparent'
  }
});

// Ghost grid - preview of next section during exit
export const portalGhostGrid = cva({
  base: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'grid',
    gap: token('spacing.4'),
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 4
  },
  variants: {
    columns: {
      2: { gridTemplateColumns: 'repeat(2, 1fr)' },
      3: { gridTemplateColumns: 'repeat(3, 1fr)' },
      4: { gridTemplateColumns: 'repeat(4, 1fr)' }
    }
  },
  defaultVariants: {
    columns: 2
  }
});

// Ghost label - individual label in ghost grid
export const portalGhostLabel = cva({
  base: {
    fontFamily: token('fonts.trade'),
    fontSize: token('fontSizes.xs'),
    textTransform: 'uppercase',
    letterSpacing: token('letterSpacings.looser'),
    color: token('colors.muted'),
    padding: `${token('spacing.3')} ${token('spacing.4')}`,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: token('colors.border'),
    borderRadius: token('radii.subtle'),
    backgroundColor: `color-mix(in srgb, ${token('colors.blackStallion')} 60%, transparent)`,
    whiteSpace: 'nowrap'
  }
});

// ─────────────────────────────────────────────────────────────────
// Section Container Styles
// ─────────────────────────────────────────────────────────────────

// Base section container - absolute positioned, full viewport
export const sectionContainer = cva({
  base: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    color: token('colors.text')
  },
  variants: {
    bg: {
      stallion: { backgroundColor: token('colors.blackStallion') },
      pearl: { backgroundColor: token('colors.blackPearl') },
      transparent: { backgroundColor: 'transparent' }
    }
  },
  defaultVariants: {
    bg: 'transparent'
  }
});

// Beat/panel container - stacked full-viewport panels
export const beatContainer = cva({
  base: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    clipPath: 'circle(0% at 50% 50%)'
  }
});

// Full-bleed background with gradient overlay
export const beatBackground = cva({
  base: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  variants: {
    visibility: {
      mobile: { display: { base: 'block', lg: 'none' } },
      desktop: { display: { base: 'none', lg: 'block' } },
      always: { display: 'block' }
    }
  },
  defaultVariants: {
    visibility: 'always'
  }
});

// Standard gradient overlay for text legibility
export const beatOverlay = cva({
  base: {
    position: 'absolute',
    inset: 0
  },
  variants: {
    direction: {
      bottom: { background: `linear-gradient(180deg, rgba(15, 23, 26, 0.15) 0%, rgba(15, 23, 26, 0.92) 70%)` },
      radial: { background: `radial-gradient(circle at center, transparent 0, ${token('colors.blackStallion')} 70%)` },
      left: { background: `linear-gradient(90deg, rgba(15, 23, 26, 0.7) 0%, transparent 100%)` }
    }
  },
  defaultVariants: {
    direction: 'bottom'
  }
});

// Portal background layer for crossfades
export const portalBackground = cva({
  base: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0
  }
});

// Portal background overlay (radial darkening)
export const portalBackgroundOverlay = cva({
  base: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 50% 50%, transparent 0%, color-mix(in srgb, ${token('colors.blackStallion')} 60%, transparent) 100%)`,
    zIndex: 1
  }
});

// Portal text (centered, uppercase)
export const portalText = cva({
  base: {
    position: 'absolute',
    fontFamily: token('fonts.trade'),
    fontSize: { base: '0.875rem', md: '1rem' },
    textTransform: 'uppercase',
    letterSpacing: token('letterSpacings.looser'),
    color: token('colors.text'),
    textAlign: 'center',
    maxWidth: '20rem',
    px: '1rem',
    zIndex: 2
  }
});
