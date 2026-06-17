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

Reglas para el campo "date":
- Si el año no aparece en el cartel, usa siempre 2026 como año predeterminado.
- No intentes adivinar si la fecha ya pasó — devuelve siempre 2026 cuando no haya año visible.
- Si el cartel muestra un año explícito, úsalo tal cual.

Si un campo no es visible en el cartel, devuelve null para ese campo.`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = 'claude-sonnet-4-5';

function fixYear(dateStr: string): string {
  const currentYear = new Date().getUTCFullYear();
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const extractedYear = parseInt(yearStr, 10);
  // Claude was told to use 2026 when no year is visible, so the only remaining
  // correction needed is lifting obviously stale years (e.g. 2024) to current.
  if (extractedYear >= currentYear) return dateStr;
  return `${currentYear}-${monthStr}-${dayStr}`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const log = (...args: unknown[]) => console.log(`[extract-poster:${requestId}]`, ...args);
  const err = (...args: unknown[]) => console.error(`[extract-poster:${requestId}]`, ...args);

  log(`${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    err('Method not allowed:', req.method);
    return json({ error: 'Method not allowed' }, 405);
  }

  // --- Parse body ---
  let body: { base64?: unknown; mimeType?: unknown };
  try {
    body = await req.json();
  } catch (parseErr) {
    err('Failed to parse request body:', parseErr);
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { base64, mimeType = 'image/jpeg' } = body;

  if (typeof base64 !== 'string' || !base64) {
    err('Missing or invalid base64 field. Type received:', typeof base64);
    return json({ error: 'base64 field is required' }, 400);
  }

  log(`Image received — mimeType: ${mimeType}, base64 length: ${base64.length}`);

  // --- Check API key ---
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    err('ANTHROPIC_API_KEY secret is not set');
    return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500);
  }
  log('ANTHROPIC_API_KEY present, length:', apiKey.length);

  const safeType = (['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const).includes(
    mimeType as never,
  )
    ? (mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')
    : 'image/jpeg';

  if (safeType !== mimeType) {
    log(`mimeType "${mimeType}" not supported, falling back to image/jpeg`);
  }

  // --- Call Anthropic ---
  log(`Calling Anthropic API — model: ${MODEL}`);

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
        model: MODEL,
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
  } catch (fetchErr) {
    err('Network error reaching Anthropic API:', fetchErr);
    return json({ error: 'Failed to reach Anthropic API', detail: String(fetchErr) }, 502);
  }

  log(`Anthropic response status: ${anthropicRes.status}`);

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text().catch(() => '');
    err(`Anthropic API error ${anthropicRes.status}:`, detail);
    return json({ error: `Anthropic API error ${anthropicRes.status}`, detail }, 502);
  }

  // --- Parse response ---
  const anthropicData = await anthropicRes.json();
  const stopReason: string = anthropicData?.stop_reason ?? 'unknown';
  const raw: string = anthropicData?.content?.[0]?.text ?? '';

  log(`Stop reason: ${stopReason}, raw response length: ${raw.length}`);
  log('Raw response preview:', raw.slice(0, 300));

  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch (jsonErr) {
    err('Failed to JSON.parse Claude response:', jsonErr);
    err('Cleaned text was:', cleaned.slice(0, 500));
    return json({ error: 'Failed to parse Claude response', raw: raw.slice(0, 500) }, 422);
  }

  log('Parsed fields from Claude:', Object.keys(parsed).join(', '));

  // --- Validate and build result ---
  const result: PosterExtraction = {};

  if (typeof parsed.name === 'string' && parsed.name)
    result.name = parsed.name;

  if (typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
    const corrected = fixYear(parsed.date);
    if (corrected !== parsed.date) {
      log(`date year corrected: ${parsed.date} → ${corrected}`);
    }
    result.date = corrected;
  } else if (parsed.date !== null && parsed.date !== undefined) {
    log(`date field rejected (value: ${JSON.stringify(parsed.date)})`);
  }

  if (typeof parsed.time === 'string' && /^\d{1,2}:\d{2}$/.test(parsed.time))
    result.time = parsed.time;
  else if (parsed.time !== null && parsed.time !== undefined)
    log(`time field rejected (value: ${JSON.stringify(parsed.time)})`);

  if (typeof parsed.town === 'string' && parsed.town)
    result.town = parsed.town;

  if (typeof parsed.description === 'string' && parsed.description)
    result.description = parsed.description;

  if (
    typeof parsed.category === 'string' &&
    VALID_CATEGORIES.includes(parsed.category as EventCategory)
  ) {
    result.category = parsed.category as EventCategory;
  } else if (parsed.category !== null && parsed.category !== undefined) {
    log(`category field rejected (value: ${JSON.stringify(parsed.category)})`);
  }

  if (typeof parsed.isFree === 'boolean')
    result.isFree = parsed.isFree;

  if (typeof parsed.price === 'string' && parsed.price)
    result.price = parsed.price;

  log('Result fields returned:', Object.keys(result).join(', ') || '(none)');

  return json(result);
});
