import { query } from '@/lib/db';

type SessionRow = {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
};

export type AuthUser = {
  id: number;
};

export async function requireAuth(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  const bearerToken = header?.startsWith('Bearer ') ? header.slice(7).trim() : null;
  const token = bearerToken || request.headers.get('x-session-token');

  if (!token) return null;

  const sessions = await query<SessionRow>(
    'SELECT id, userId, token, expiresAt FROM `Session` WHERE token = ?',
    [token],
  );
  const session = sessions[0];
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) return null;

  return { id: session.userId };
}
