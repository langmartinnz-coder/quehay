import { supabase } from './supabase';

export async function translateDescription(text: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ translated: string }>('translate-description', {
    body: { text },
  });
  if (error) throw new Error(error.message);
  if (!data?.translated) throw new Error('No translation received');
  return data.translated;
}
