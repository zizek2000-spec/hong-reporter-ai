export const config = { runtime: 'edge' };

export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let messages, systemPrompt;
  try {
    const body = await req.json();
    messages = body.messages;
    systemPrompt = body.systemPrompt;
  } catch (e) {
    return new Response('요청 형식 오류', { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다. Vercel 대시보드 → Settings → Environment Variables에서 추가하세요.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      temperature: 1.0,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    return new Response(
      JSON.stringify({ error: `Anthropic API 오류 (${anthropicRes.status}): ${err}` }),
      { status: anthropicRes.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(anthropicRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
