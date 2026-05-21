export const Colors = {
  primary: '#C4622D',
  primaryLight: '#E8956C',
  primaryDark: '#A34F22',
  secondary: '#D4813A',
  secondaryLight: '#EEB889',

  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F0E8',

  text: '#2C1810',
  textSecondary: '#7A6B5D',
  textLight: '#B5A99A',

  border: '#EDE8E0',
  divider: '#EDE8E0',

  success: '#27AE60',
  warning: '#D4813A',
  error: '#C4622D',
  info: '#C4622D',

  white: '#FFFFFF',
  black: '#000000',

  // Category — keep distinct for visual differentiation on card images
  festival: '#C0392B',
  fiesta: '#E67E22',
  mercado: '#16A085',
  concierto: '#8E44AD',
  gastronomia: '#D35400',
  deportes: '#2980B9',
  comunidad: '#27AE60',

  // Event size
  grande: '#E74C3C',
  mediano: '#D4813A',
  pequeño: '#27AE60',

  // Source
  ayuntamiento: '#5B7EA8',
  facebook: '#1877F2',
  instagram: '#E1306C',
  whatsapp: '#25D366',
  milanuncios: '#FF6B00',
  usuario: '#8E44AD',

  tab: {
    active: '#C4622D',
    inactive: '#B5A99A',
    background: '#FFFFFF',
    border: '#EDE8E0',
  },
} as const;

export type ColorKey = keyof typeof Colors;
