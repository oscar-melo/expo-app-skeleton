import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

const BREAKPOINTS = {
  sm: 0,
  md: 600,
  lg: 900,
} as const;

/**
 * Hook para layout responsive. Útil para ajustar estilos según ancho de pantalla
 * (móvil vs tablet vs web).
 */
export function useResponsive() {
  const { width } = useWindowDimensions();
  return useMemo(
    () => ({
      width,
      isSmall: width < BREAKPOINTS.md,
      isMedium: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isLarge: width >= BREAKPOINTS.lg,
      breakpoints: BREAKPOINTS,
    }),
    [width]
  );
}
