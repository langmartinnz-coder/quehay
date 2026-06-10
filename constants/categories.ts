import { EventCategory, Region, DateFilter } from '../types';
import { getCurrentT } from '../i18n';

export interface CategoryConfig {
  id: EventCategory | 'all';
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'all', get label() { return getCurrentT().catAll; }, emoji: '✨', color: '#6B7280' },
  { id: 'festival', get label() { return getCurrentT().catFestival; }, emoji: '🎉', color: '#C0392B' },
  { id: 'fiesta', get label() { return getCurrentT().catFiesta; }, emoji: '🔥', color: '#E67E22' },
  { id: 'mercado', get label() { return getCurrentT().catMercado; }, emoji: '🛒', color: '#16A085' },
  { id: 'concierto', get label() { return getCurrentT().catConcierto; }, emoji: '🎵', color: '#8E44AD' },
  { id: 'gastronomia', get label() { return getCurrentT().catGastronomia; }, emoji: '🍷', color: '#D35400' },
  { id: 'deportes', get label() { return getCurrentT().catDeportes; }, emoji: '⚽', color: '#2980B9' },
  { id: 'comunidad', get label() { return getCurrentT().catComunidad; }, emoji: '🤝', color: '#27AE60' },
];

export const DATE_FILTERS: { id: DateFilter; label: string }[] = [
  { id: 'todas', get label() { return getCurrentT().dfAll; } },
  { id: 'hoy', get label() { return getCurrentT().dfToday; } },
  { id: 'semana', get label() { return getCurrentT().dfWeek; } },
  { id: 'mes', get label() { return getCurrentT().dfMonth; } },
];

export const REGIONS: { id: Region; label: string; flag: string }[] = [
  { id: 'todas',         get label() { return getCurrentT().rAll; },          flag: '🇪🇸' },
  { id: 'aragon',        get label() { return getCurrentT().rAragon; },        flag: '🏔️' },
  { id: 'cataluña',      get label() { return getCurrentT().rCatalunya; },     flag: '🌊' },
  { id: 'madrid',        get label() { return getCurrentT().rMadrid; },        flag: '🏙️' },
  { id: 'andalucia',     get label() { return getCurrentT().rAndalucia; },     flag: '☀️' },
  { id: 'valencia',      get label() { return getCurrentT().rValencia; },      flag: '🍊' },
  { id: 'pais-vasco',    get label() { return getCurrentT().rPaisVasco; },     flag: '🌿' },
  { id: 'galicia',       get label() { return getCurrentT().rGalicia; },       flag: '🌧️' },
  { id: 'castilla-leon', get label() { return getCurrentT().rCastillaLeon; },  flag: '🏰' },
  { id: 'murcia',        get label() { return getCurrentT().rMurcia; },        flag: '🌅' },
  { id: 'extremadura',   get label() { return getCurrentT().rExtremadura; },   flag: '🦅' },
  { id: 'canarias',      get label() { return getCurrentT().rCanarias; },      flag: '🌋' },
  { id: 'baleares',      get label() { return getCurrentT().rBaleares; },      flag: '⛵' },
];

export function getRegionLabel(regionId: string): string {
  return REGIONS.find((r) => r.id === regionId)?.label ?? regionId;
}

export const SOURCE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  ayuntamiento: { get label() { return getCurrentT().srcTownHall; }, emoji: '🏛️', color: '#2980B9' },
  facebook: { label: 'Facebook', emoji: '📘', color: '#1877F2' },
  instagram: { label: 'Instagram', emoji: '📷', color: '#E1306C' },
  whatsapp: { label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  milanuncios: { label: 'Milanuncios', emoji: '📋', color: '#FF6B00' },
  usuario: { get label() { return getCurrentT().srcCommunity; }, emoji: '👤', color: '#8E44AD' },
};

export const SIZE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  grande: { get label() { return getCurrentT().sizeBig; }, color: '#E74C3C', dot: '🔴' },
  mediano: { get label() { return getCurrentT().sizeMedium; }, color: '#F39C12', dot: '🟡' },
  pequeño: { get label() { return getCurrentT().sizeSmall; }, color: '#27AE60', dot: '🟢' },
};

export const RADIUS_OPTIONS = [
  { km: 10, label: '10 km' },
  { km: 25, label: '25 km' },
  { km: 50, label: '50 km' },
  { km: 100, label: '100 km' },
];
