/** App-wide responsive breakpoints (px). */
export const BREAKPOINTS = {
  mobileMin: 330,
  mobileMax: 599,
  tabletMin: 600,
  tabletMax: 1199,
  desktopMin: 1200,
} as const;

export const MEDIA_QUERIES = {
  mobile: `(min-width: ${BREAKPOINTS.mobileMin}px) and (max-width: ${BREAKPOINTS.mobileMax}px)`,
  mobileDown: `(max-width: ${BREAKPOINTS.mobileMax}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tabletMin}px) and (max-width: ${BREAKPOINTS.tabletMax}px)`,
  tabletDown: `(max-width: ${BREAKPOINTS.tabletMax}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktopMin}px)`,
} as const;
