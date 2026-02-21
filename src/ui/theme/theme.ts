/**
 * Tema base: colores, tipografía, espaciado.
 * Cambiar aquí para adaptar estilos en toda la app.
 */
export const theme = {
  colors: {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
    error: '#dc2626',
    menuItemActive: '#eff6ff',
    menuItemText: '#334155',
    searchBackground: '#f1f5f9',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    title: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
} as const;

export type Theme = typeof theme;
