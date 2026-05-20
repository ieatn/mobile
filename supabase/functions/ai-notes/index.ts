import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MODEL = 'gemini-2.5-flash-lite';
const TOPICS = ['philosophy', 'finance', 'self-improvement', 'history'] as const;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function pickTopic(seed?: number) {
  const i = seed != null ? Math.abs(seed) % TOPICS.length : Math.floor(Math.random() * TOPICS.length);
  return TOPICS[i];
}

async function fetchQuote(topic: string, seed: number | undefined, apiKey: string) {
  const prompt = `Topic: ${topic} (philosophy, finance, self-improvement, or history).
Seed: ${seed ?? 'random'}

Give ONE real, well-known quote from history (max 110 characters) with short attribution (— Author).
Use only quotes you are confident are real. Pick a different quote than obvious clichés. Plain text only.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 80, temperature: 0.9 },
      }),
    },
  );

  if (!res.ok) throw new Error('Gemini failed');

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response');

  return text.slice(0, 140);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!apiKey || !url || !anon) return json({ error: 'Server not configured' }, 503);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  let seed: number | undefined;
  try {
    const body = await req.json();
    if (typeof body?.seed === 'number') seed = body.seed;
  } catch {
    // empty body is fine
  }

  const supabase = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return json({ error: 'Unauthorized' }, 401);

  try {
    const text = await fetchQuote(pickTopic(seed), seed, apiKey);
    return json({ text });
  } catch {
    return json({ error: 'AI unavailable' }, 502);
  }
});
