export const layout = {
  safeX: {
    base: '2rem',       // 32px - Brand Design System minimum
    md: '2.5rem',       // 40px
    lg: '6rem'          // 96px - meets Brand Design System requirement
  },
  sectionY: {
    base: '4rem',
    lg: '7rem'
  },
  slabMax: '32rem',
  /** 12-column grid system per Brand Design System */
  grid: {
    columns: 12,
    gap: {
      base: '1rem',
      md: '1.5rem',
      lg: '2rem'
    }
  }
};

export const motion = {
  easing: {
    brandEnter: 'cubic-bezier(0.19, 1, 0.22, 1)'
  },
  durations: {
    microUI: { min: 220, max: 260 },
    sectionTransition: { min: 320, max: 420 },
    heroBeat: { min: 450, max: 600 }
  },
  levels: {
    l1: 'subtle',
    l2: 'noticeable',
    l3: 'signature'
  }
};
