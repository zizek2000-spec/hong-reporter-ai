export const config = { runtime: 'edge' };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function toOpenAIInput(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(message => message && typeof message.content === 'string')
    .map(message => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    }));
}

function transformOpenAIStream(openaiBody) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = openaiBody.getReader();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            const dataLines = event
              .split('\n')
              .filter(line => line.startsWith('data:'))
              .map(line => line.slice(5).trim());

            for (const data of dataLines) {
              if (!data || data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'response.output_text.delta' && parsed.delta) {
                  controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'content_block_delta',
                      delta: { text: parsed.delta },
                    })}\n\n`
                  ));
                }
              } catch {
                // Ignore non-JSON stream lines.
              }
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({
            type: 'content_block_delta',
            delta: { text: `\n\n[stream error] ${err.message}` },
          })}\n\n`
        ));
        controller.close();
      }
    },
    async cancel() {
      await reader.cancel();
    },
  });
}

async function callOpenAI(messages, systemPrompt, apiKey) {
  const model = process.env.OPENAI_MODEL || 'gpt-5';
  const body = {
    model,
    input: toOpenAIInput(messages),
    max_output_tokens: 4096,
    stream: true,
  };

  if (systemPrompt) {
    body.instructions = systemPrompt;
  }

  const openaiRes = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    return jsonResponse({ error: `OpenAI API 오류 (${openaiRes.status}): ${err}` }, openaiRes.status);
  }

  return new Response(transformOpenAIStream(openaiRes.body), {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

async function callAnthropicFallback(messages, systemPrompt, apiKey) {
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
    return jsonResponse({ error: `Anthropic API 오류 (${anthropicRes.status}): ${err}` }, anthropicRes.status);
  }

  return new Response(anthropicRes.body, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  let messages, systemPrompt;
  try {
    const body = await req.json();
    messages = body.messages;
    systemPrompt = body.systemPrompt;
  } catch {
    return new Response('요청 형식 오류', { status: 400, headers: CORS_HEADERS });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return callOpenAI(messages, systemPrompt, openaiKey);
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return callAnthropicFallback(messages, systemPrompt, anthropicKey);
  }

  return jsonResponse({
    error: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다. Vercel 대시보드의 Environment Variables에 OPENAI_API_KEY를 추가하세요.',
  }, 500);
}
