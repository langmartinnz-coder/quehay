import { supabase } from './supabase';
import type { Event } from '../types';

export interface TranslatedEventFields {
  name: string;
  description: string;
  location: string;
}

// Session-level cache: eventId -> translated fields
const cache = new Map<string, TranslatedEventFields>();

export function getCachedTranslation(eventId: string): TranslatedEventFields | null {
  return cache.get(eventId) ?? null;
}

export async function translateEvent(
  event: Pick<Event, 'id' | 'name' | 'description' | 'location'>,
): Promise<TranslatedEventFields> {
  const cached = cache.get(event.id);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke<TranslatedEventFields>('translate-event', {
    body: {
      name: event.name,
      description: event.description,
      location: event.location,
    },
  });

  if (error) throw new Error(error.message);
  if (!data?.name || !data?.description || !data?.location) {
    throw new Error('Incomplete translation response');
  }

  cache.set(event.id, data);
  return data;
}
