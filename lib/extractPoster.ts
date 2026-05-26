import { EventCategory } from '../types';
import { supabase } from './supabase';

export interface PosterExtraction {
  name?: string;
  date?: string;        // YYYY-MM-DD
  time?: string;        // HH:MM
  town?: string;
  description?: string;
  category?: EventCategory;
  isFree?: boolean;
  price?: string;
}

export async function extractPosterData(
  base64Image: string,
  mimeType: string = 'image/jpeg',
): Promise<PosterExtraction> {
  const { data, error } = await supabase.functions.invoke<PosterExtraction>('extract-poster', {
    body: { base64: base64Image, mimeType },
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No se recibió respuesta del servidor');

  return data;
}
