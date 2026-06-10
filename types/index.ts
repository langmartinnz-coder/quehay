export type EventCategory =
  | 'festival'
  | 'fiesta'
  | 'mercado'
  | 'concierto'
  | 'gastronomia'
  | 'deportes'
  | 'comunidad';

export type EventSize = 'pequeño' | 'mediano' | 'grande';

export type EventSource =
  | 'ayuntamiento'
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'milanuncios'
  | 'usuario';

export type Region =
  | 'todas'
  | 'aragon'
  | 'cataluña'
  | 'madrid'
  | 'andalucia'
  | 'valencia'
  | 'pais-vasco'
  | 'galicia'
  | 'castilla-leon'
  | 'murcia'
  | 'extremadura'
  | 'canarias'
  | 'baleares';
export type DateFilter = 'hoy' | 'semana' | 'mes' | 'todas';

export interface EventCoords {
  latitude: number;
  longitude: number;
}

export interface Event {
  id: string;
  name: string;
  dateStart: string;
  dateEnd?: string;
  time: string;
  location: string;
  town: string;
  region: Region;
  coordinates: EventCoords;
  category: EventCategory;
  size: EventSize;
  description: string;
  imageUrl: string;
  source: EventSource;
  sourceDetail: string;
  tags: string[];
  isFree: boolean;
  price?: string;
}

export interface AppFilters {
  category: EventCategory | 'all';
  region: Region;
  dateFilter: DateFilter;
  searchQuery: string;
}
