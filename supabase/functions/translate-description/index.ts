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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { text } = body;

  if (typeof text !== 'string' || !text.trim()) {
    return json({ error: 'text field is required' }, 400);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500);
  }

  const prompt = `Translate the following Spanish event description into natural English. Return ONLY the translated text — no explanations, no quotes, no extra content.\n\n${text}`;

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
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (fetchErr) {
    console.error('[translate-description] Network error:', fetchErr);
    return json({ error: 'Failed to reach Anthropic API' }, 502);
  }

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text().catch(() => '');
    console.error(`[translate-description] Anthropic error ${anthropicRes.status}:`, detail);
    return json({ error: `Anthropic API error ${anthropicRes.status}` }, 502);
  }

  const data = await anthropicRes.json();
  const translated: string = data?.content?.[0]?.text?.trim() ?? '';

  if (!translated) {
    return json({ error: 'Empty translation returned' }, 422);
  }

  return json({ translated });
});
