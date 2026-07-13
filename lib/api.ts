import { supabase } from './supabase';
import { Event, AppFilters } from '../types';

type DbEvent = {
  id: string;
  name: string;
  date_start: string;
  date_end: string | null;
  time: string;
  location: string;
  town: string;
  region: string;
  lat: number;
  lng: number;
  category: string;
  size: string;
  description: string;
  image_url: string;
  source: string;
  source_detail: string;
  tags: string[];
  is_free: boolean;
  price: string | null;
};

function rowToEvent(row: DbEvent): Event {
  return {
    id: row.id,
    name: row.name,
    dateStart: row.date_start,
    dateEnd: row.date_end ?? undefined,
    time: row.time,
    location: row.location,
    town: row.town,
    region: row.region as Event['region'],
    coordinates: { latitude: row.lat, longitude: row.lng },
    category: row.category as Event['category'],
    size: row.size as Event['size'],
    description: row.description,
    imageUrl: row.image_url,
    source: row.source as Event['source'],
    sourceDetail: row.source_detail,
    tags: row.tags ?? [],
    isFree: row.is_free,
    price: row.price ?? undefined,
  };
}

export async function fetchAllEvents(): Promise<Event[]> {
  console.log('[api] fetchAllEvents: querying Supabase for is_verified=true events...');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_verified', true)
    .order('date_start', { ascending: true });
  if (error) {
    console.error('[api] fetchAllEvents Supabase error:', error.message, error.code);
    throw error;
  }
  const rows = data as DbEvent[];
  console.log(`[api] fetchAllEvents: ${rows.length} verified events from DB`);
  const withCoords = rows.filter((r) => r.lat !== 0 || r.lng !== 0);
  const noCoords = rows.length - withCoords.length;
  if (noCoords > 0) {
    console.warn(`[api] fetchAllEvents: ${noCoords} event(s) have lat=0,lng=0 — they will not appear on the map`);
  }
  return rows.map(rowToEvent);
}

export async function fetchEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToEvent(data as DbEvent);
}

export async function fetchFavorites(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', userId);
  return (data ?? []).map((r: { event_id: string }) => r.event_id);
}

export async function addFavorite(userId: string, eventId: string): Promise<void> {
  await supabase.from('favorites').upsert({ user_id: userId, event_id: eventId });
}

export async function removeFavorite(userId: string, eventId: string): Promise<void> {
  await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);
}

export async function submitEvent(
  form: {
    name: string;
    dateStart: string;
    dateEnd?: string;
    time: string;
    town: string;
    region: string;
    category: string;
    description: string;
    isFree: boolean;
    price?: string;
    imageUrl?: string;
    lat?: number;
    lng?: number;
  },
  userId?: string,
): Promise<void> {
  const { error } = await supabase.from('events').insert({
    id: `usr_${Date.now()}`,
    name: form.name,
    date_start: form.dateStart,
    date_end: form.dateEnd ?? null,
    time: form.time || 'Por confirmar',
    location: form.town,
    town: form.town,
    region: form.region,
    lat: form.lat ?? 0,
    lng: form.lng ?? 0,
    category: form.category || 'comunidad',
    size: 'pequeño',
    description: form.description || '',
    image_url: form.imageUrl ?? 'https://picsum.photos/seed/usuario/800/450',
    source: 'usuario',
    source_detail: 'Enviado por la comunidad QuéHay',
    tags: [],
    is_free: form.isFree,
    price: form.isFree ? null : (form.price || null),
    is_verified: false,
    submitted_by: userId ?? null,
  });
  if (error) throw error;
}

export function applyFilters(events: Event[], filters: AppFilters): Event[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events
    .filter((event) => {
      if (filters.category !== 'all' && event.category !== filters.category) return false;
      if (filters.region !== 'todas' && event.region !== filters.region) return false;

      const [ey, em, ed] = event.dateStart.split('-').map(Number);
      const eventDate = new Date(ey, em - 1, ed);
      if (filters.dateFilter === 'hoy') {
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (event.dateStart !== todayStr) return false;
      } else if (filters.dateFilter === 'semana') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (eventDate < today || eventDate > weekEnd) return false;
      } else if (filters.dateFilter === 'mes') {
        const monthEnd = new Date(today);
        monthEnd.setDate(monthEnd.getDate() + 30);
        if (eventDate < today || eventDate > monthEnd) return false;
      }

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (
          !event.name.toLowerCase().includes(q) &&
          !event.town.toLowerCase().includes(q) &&
          !event.description.toLowerCase().includes(q) &&
          !event.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }

      return true;
    })
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}
