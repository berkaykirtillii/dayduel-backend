import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { health } from './routes/health.js';
import { auth } from './routes/auth.js';
import { sync } from './routes/sync.js';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Session-Id'],
  })
);

app.route('/health', health);
app.route('/auth', auth);
app.route('/sync', sync);

app.get('/', (c) => {
  return c.json({
    name: 'DayDuel API',
    version: '0.1.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        guest: 'POST /auth/guest',
        apple: 'POST /auth/apple (stub)',
        google: 'POST /auth/google (stub)',
        logout: 'DELETE /auth/session',
      },
      sync: {
        get: 'GET /sync',
        post: 'POST /sync',
      },
    },
  });
});

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🎮 DayDuel API starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
