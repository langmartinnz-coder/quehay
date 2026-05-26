const VALID_CATEGORIES = [
  'festival', 'fiesta', 'mercado', 'concierto', 'gastronomia', 'deportes', 'comunidad',
] as const;

type EventCategory = typeof VALID_CATEGORIES[number];

interface PosterExtraction {
  name?: string;
  date?: string;        // YYYY-MM-DD
  time?: string;        // HH:MM
  town?: string;
  description?: string;
  category?: EventCategory;
  isFree?: boolean;
  price?: string;
}

const PROMPT = `Eres un extractor de información de carteles de eventos en España.

Analiza la imagen y extrae la información del evento. Devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional ni bloques de código markdown.

Formato exacto:
{
  "name": "nombre completo del evento",
  "date": "fecha de inicio en formato YYYY-MM-DD, o null",
  "time": "hora en formato HH:MM, o null",
  "town": "municipio o ciudad donde se celebra, o null",
  "description": "descripción breve en español, 1-2 frases, o null",
  "category": "una de: festival | fiesta | mercado | concierto | gastronomia | deportes | comunidad",
  "isFree": true o false,
  "price": "precio como texto (ej: '10€', 'Desde 5€') o null si es gratis o no aparece"
}

Guía de categorías:
- festival: festivales, ferias, fiestas populares de varios días
- fiesta: fiestas patronales, verbenas, celebraciones locales
- mercado: mercados, ferias de artesanía, mercadillos
- concierto: conciertos, actuaciones musicales
- gastronomia: ferias gastronómicas, catas, jornadas culinarias
- deportes: carreras, torneos, eventos deportivos
- comunidad: eventos culturales, charlas, talleres, exposiciones

Si un campo no es visible en el cartel, devuelve null para ese campo.`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  let body: { base64?: unknown; mimeType?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const { base64, mimeType = 'image/jpeg' } = body;

  if (typeof base64 !== 'string' || !base64) {
    return new Response(JSON.stringify({ error: 'base64 field is required' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const safeType = (['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const).includes(
    mimeType as never,
  )
    ? (mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')
    : 'image/jpeg';

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: safeType, data: base64 } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reach Anthropic API', detail: String(err) }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `Anthropic API error ${anthropicRes.status}`, detail }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  const anthropicData = await anthropicRes.json();
  const raw: string = anthropicData?.content?.[0]?.text ?? '';
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to parse Claude response', raw }), {
      status: 422,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const result: PosterExtraction = {};

  if (typeof parsed.name === 'string' && parsed.name)
    result.name = parsed.name;

  if (typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date))
    result.date = parsed.date;

  if (typeof parsed.time === 'string' && /^\d{1,2}:\d{2}$/.test(parsed.time))
    result.time = parsed.time;

  if (typeof parsed.town === 'string' && parsed.town)
    result.town = parsed.town;

  if (typeof parsed.description === 'string' && parsed.description)
    result.description = parsed.description;

  if (
    typeof parsed.category === 'string' &&
    VALID_CATEGORIES.includes(parsed.category as EventCategory)
  )
    result.category = parsed.category as EventCategory;

  if (typeof parsed.isFree === 'boolean')
    result.isFree = parsed.isFree;

  if (typeof parsed.price === 'string' && parsed.price)
    result.price = parsed.price;

  return new Response(JSON.stringify(result), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
