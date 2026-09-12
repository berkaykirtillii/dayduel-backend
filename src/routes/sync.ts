import { Hono } from 'hono';
import { store } from '../store.js';

type Variables = {
  sessionId: string;
};

const sync = new Hono<{ Variables: Variables }>();

/**
 * Middleware: require valid session for sync routes.
 */
sync.use('*', async (c, next) => {
  const sessionId = c.req.header('X-Session-Id');

  if (!sessionId) {
    return c.json({ error: 'X-Session-Id header required' }, 401);
  }

  const session = store.sessions.get(sessionId);
  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  c.set('sessionId', sessionId);
  await next();
});

/**
 * GET /sync
 * Retrieve current synced score/streak data.
 */
sync.get('/', (c) => {
  const sessionId = c.get('sessionId');
  const data = store.userData.get(sessionId);

  if (!data) {
    return c.json({
      sessionId,
      score: 0,
      streak: 0,
      lastPlayedAt: null,
      message: 'No data synced yet',
    });
  }

  return c.json({
    sessionId: data.sessionId,
    score: data.score,
    streak: data.streak,
    lastPlayedAt: data.lastPlayedAt,
    updatedAt: data.updatedAt,
  });
});

/**
 * POST /sync
 * Upload local score/streak data.
 * Body: { score: number, streak: number, lastPlayedAt?: number }
 *
 * NOTE: This is a simple overwrite for MVP. Production should handle
 * conflict resolution (e.g., last-write-wins or merge strategies).
 */
sync.post('/', async (c) => {
  const sessionId = c.get('sessionId');

  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { score, streak, lastPlayedAt } = body as {
    score?: number;
    streak?: number;
    lastPlayedAt?: number;
  };

  if (typeof score !== 'number' || typeof streak !== 'number') {
    return c.json({ error: 'score and streak are required numbers' }, 400);
  }

  if (score < 0 || streak < 0) {
    return c.json({ error: 'score and streak must be non-negative' }, 400);
  }

  const data = store.userData.upsert({
    sessionId,
    score,
    streak,
    lastPlayedAt: lastPlayedAt ?? null,
    updatedAt: Date.now(),
  });

  return c.json({
    success: true,
    data: {
      sessionId: data.sessionId,
      score: data.score,
      streak: data.streak,
      lastPlayedAt: data.lastPlayedAt,
      updatedAt: data.updatedAt,
    },
    message: 'Data synced successfully',
  });
});

export { sync };
