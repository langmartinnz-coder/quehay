import { EventCategory, Region, DateFilter } from '../types';
import { t } from '../i18n';

export interface CategoryConfig {
  id: EventCategory | 'all';
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'all', label: t.catAll, emoji: '✨', color: '#6B7280' },
  { id: 'festival', label: t.catFestival, emoji: '🎉', color: '#C0392B' },
  { id: 'fiesta', label: t.catFiesta, emoji: '🔥', color: '#E67E22' },
  { id: 'mercado', label: t.catMercado, emoji: '🛒', color: '#16A085' },
  { id: 'concierto', label: t.catConcierto, emoji: '🎵', color: '#8E44AD' },
  { id: 'gastronomia', label: t.catGastronomia, emoji: '🍷', color: '#D35400' },
  { id: 'deportes', label: t.catDeportes, emoji: '⚽', color: '#2980B9' },
  { id: 'comunidad', label: t.catComunidad, emoji: '🤝', color: '#27AE60' },
];

export const DATE_FILTERS: { id: DateFilter; label: string }[] = [
  { id: 'todas', label: t.dfAll },
  { id: 'hoy', label: t.dfToday },
  { id: 'semana', label: t.dfWeek },
  { id: 'mes', label: t.dfMonth },
];

export const REGIONS: { id: Region; label: string; flag: string }[] = [
  { id: 'todas', label: t.rAll, flag: '🇪🇸' },
  { id: 'teruel', label: t.rTeruel, flag: '🏔️' },
  { id: 'cataluña', label: t.rCatalunya, flag: '🌊' },
];

export const SOURCE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  ayuntamiento: { label: 'Ayuntamiento', emoji: '🏛️', color: '#2980B9' },
  facebook: { label: 'Facebook', emoji: '📘', color: '#1877F2' },
  instagram: { label: 'Instagram', emoji: '📷', color: '#E1306C' },
  whatsapp: { label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  milanuncios: { label: 'Milanuncios', emoji: '📋', color: '#FF6B00' },
  usuario: { label: 'Comunidad', emoji: '👤', color: '#8E44AD' },
};

export const SIZE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  grande: { label: t.sizeBig, color: '#E74C3C', dot: '🔴' },
  mediano: { label: t.sizeMedium, color: '#F39C12', dot: '🟡' },
  pequeño: { label: t.sizeSmall, color: '#27AE60', dot: '🟢' },
};

export const RADIUS_OPTIONS = [
  { km: 10, label: '10 km' },
  { km: 25, label: '25 km' },
  { km: 50, label: '50 km' },
  { km: 100, label: '100 km' },
];
