export const Colors = {
  primary: '#C0392B',
  primaryLight: '#E74C3C',
  primaryDark: '#96281B',
  secondary: '#E67E22',
  secondaryLight: '#F39C12',
  accent: '#2980B9',

  background: '#F8F6F2',
  surface: '#FFFFFF',
  surfaceVariant: '#F2EFEA',

  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',

  border: '#E5E0D9',
  divider: '#EDE9E3',

  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#2980B9',

  white: '#FFFFFF',
  black: '#000000',

  // Category
  festival: '#C0392B',
  fiesta: '#E67E22',
  mercado: '#16A085',
  concierto: '#8E44AD',
  gastronomia: '#D35400',
  deportes: '#2980B9',
  comunidad: '#27AE60',

  // Event size
  grande: '#E74C3C',
  mediano: '#F39C12',
  pequeño: '#27AE60',

  // Source
  ayuntamiento: '#2980B9',
  facebook: '#1877F2',
  instagram: '#E1306C',
  whatsapp: '#25D366',
  milanuncios: '#FF6B00',
  usuario: '#8E44AD',

  tab: {
    active: '#C0392B',
    inactive: '#9CA3AF',
    background: '#FFFFFF',
    border: '#E5E0D9',
  },
} as const;

export type ColorKey = keyof typeof Colors;
