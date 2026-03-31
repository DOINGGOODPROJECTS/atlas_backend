export type MakeWebhookResponse =
  | {
      reply?: unknown;
      response?: unknown;
      text?: unknown;
      error?: unknown;
    }
  | null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const firstString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
};

export const parseMakeWebhookResponse = (raw: string): MakeWebhookResponse => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as MakeWebhookResponse;
  } catch {
    return null;
  }
};

const unwrapStringifiedJson = (value: string): unknown => {
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
};

export const extractMakeAssistantText = (raw: string, parsed: MakeWebhookResponse): string => {
  const direct = firstString(parsed?.reply, parsed?.response, parsed?.text, raw) || '';
  const unwrapped = unwrapStringifiedJson(direct);

  if (typeof unwrapped === 'string') return unwrapped;

  if (isRecord(unwrapped)) {
    const nested = firstString(unwrapped.reply, unwrapped.response, unwrapped.text, unwrapped.message);
    if (nested) return nested;
  }

  return direct;
};

export const extractMakeError = (raw: string, parsed: MakeWebhookResponse): string | null => {
  const direct = firstString(parsed?.error);
  if (direct) return direct;

  const directText = firstString(parsed?.reply, parsed?.response, parsed?.text, raw);
  if (!directText) return null;
  const unwrapped = unwrapStringifiedJson(directText);
  if (isRecord(unwrapped) && typeof unwrapped.error === 'string' && unwrapped.error.trim()) {
    return unwrapped.error.trim();
  }
  return null;
};

