import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { requireAuth } from '@/lib/auth-session';
import type { ResultSetHeader } from 'mysql2/promise';
import { allowRequest } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type Payload = { sessionId?: number; message?: string };

async function callOpenAI(messages: { role: string; content: string }[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: 800 }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content.trim() : null;
}

export async function POST(request: Request) {
  const authUser = await requireAuth(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit per user
  if (!allowRequest(authUser.id, 1)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = (await request.json()) as Payload;
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });

    let sessionId = body.sessionId;
    if (sessionId) {
      const sessions = await query<{ id: number }>(
        'SELECT id FROM `ChatSession` WHERE id = ? AND userId = ?',
        [sessionId, authUser.id],
      );
      if (sessions.length === 0) return NextResponse.json({ error: 'Invalid session.' }, { status: 404 });
    } else {
      const title = message.replace(/\s+/g, ' ').trim().slice(0, 60);
      const result = await execute<ResultSetHeader>('INSERT INTO `ChatSession` (userId, title) VALUES (?, ?)', [authUser.id, title]);
      sessionId = result.insertId;
    }

    await execute<ResultSetHeader>('INSERT INTO `ChatMessage` (sessionId, role, content) VALUES (?, ?, ?)', [sessionId, 'USER', message]);

    const rows = await query<{ role: string; content: string }>('SELECT role, content FROM `ChatMessage` WHERE sessionId = ? ORDER BY createdAt ASC', [sessionId]);
    const messages = rows.map((r) => ({ role: r.role === 'ASSISTANT' ? 'assistant' : 'user', content: r.content }));

    // Optional system prompt
    const systemPrompt = process.env.OPENAI_SYSTEM_PROMPT?.trim();
    const openAiMessages = [] as { role: string; content: string }[];
    if (systemPrompt) openAiMessages.push({ role: 'system', content: systemPrompt });
    openAiMessages.push(...messages);
    openAiMessages.push({ role: 'user', content: message });

    const assistantText = await callOpenAI(openAiMessages);
    const reply = assistantText ?? 'Unable to get response.';

    await execute<ResultSetHeader>('INSERT INTO `ChatMessage` (sessionId, role, content) VALUES (?, ?, ?)', [sessionId, 'ASSISTANT', reply]);
    await execute<ResultSetHeader>('UPDATE `ChatSession` SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);

    return NextResponse.json({ sessionId, reply });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to complete chat', details: String(error) }, { status: 500 });
  }
}
