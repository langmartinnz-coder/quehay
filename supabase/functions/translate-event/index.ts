const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = 'claude-haiku-4-5-20251001';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function extractJSON(text: string): Record<string, string> {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in response');
  return JSON.parse(match[0]);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: { name?: unknown; description?: unknown; location?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { name, description, location } = body;

  if (typeof name !== 'string' || typeof description !== 'string' || typeof location !== 'string') {
    return json({ error: 'name, description, and location are required strings' }, 400);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500);
  }

  const input = JSON.stringify({ name, description, location });
  const prompt = `Translate the following event details from Spanish or Catalan into natural British English. Return ONLY a valid JSON object with exactly the keys "name", "description", and "location". Translate descriptive text naturally. Keep proper place names (cities, streets, venue names) unchanged.\n\n${input}`;

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
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (fetchErr) {
    console.error('[translate-event] Network error:', fetchErr);
    return json({ error: 'Failed to reach Anthropic API' }, 502);
  }

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text().catch(() => '');
    console.error(`[translate-event] Anthropic error ${anthropicRes.status}:`, detail);
    return json({ error: `Anthropic API error ${anthropicRes.status}` }, 502);
  }

  const data = await anthropicRes.json();
  const rawText: string = data?.content?.[0]?.text?.trim() ?? '';

  if (!rawText) {
    return json({ error: 'Empty response from Anthropic' }, 422);
  }

  let translated: Record<string, string>;
  try {
    translated = extractJSON(rawText);
  } catch {
    console.error('[translate-event] Failed to parse JSON from:', rawText);
    return json({ error: 'Failed to parse translation response' }, 422);
  }

  if (!translated.name || !translated.description || !translated.location) {
    return json({ error: 'Missing fields in translation response' }, 422);
  }

  return json({
    name: translated.name,
    description: translated.description,
    location: translated.location,
  });
});
