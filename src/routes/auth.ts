import { Hono } from 'hono';
import { store } from '../store.js';

const auth = new Hono();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * POST /auth/guest
 * Create a guest session (no credentials required).
 */
auth.post('/guest', (c) => {
  const session = store.sessions.create({
    id: generateId(),
    type: 'guest',
    createdAt: Date.now(),
  });

  return c.json({
    sessionId: session.id,
    type: session.type,
    message: 'Guest session created. Local data can be synced to this session.',
  });
});

/**
 * POST /auth/apple
 * Apple Sign-In placeholder - returns stub response.
 * TODO: Implement Apple Sign-In verification with identityToken.
 */
auth.post('/apple', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { identityToken } = body as { identityToken?: string };

  if (!identityToken) {
    return c.json({ error: 'identityToken required' }, 400);
  }

  // TODO: Verify identityToken with Apple's servers
  // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api

  return c.json(
    {
      error: 'not_implemented',
      message: 'Apple Sign-In stub. Implement token verification before production.',
      hint: 'Verify identityToken with Apple, then create/link session.',
    },
    501
  );
});

/**
 * POST /auth/google
 * Google Sign-In placeholder - returns stub response.
 * TODO: Implement Google Sign-In verification with idToken.
 */
auth.post('/google', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { idToken } = body as { idToken?: string };

  if (!idToken) {
    return c.json({ error: 'idToken required' }, 400);
  }

  // TODO: Verify idToken with Google
  // https://developers.google.com/identity/sign-in/web/backend-auth

  return c.json(
    {
      error: 'not_implemented',
      message: 'Google Sign-In stub. Implement token verification before production.',
      hint: 'Verify idToken with Google, then create/link session.',
    },
    501
  );
});

/**
 * DELETE /auth/session
 * End current session.
 */
auth.delete('/session', (c) => {
  const sessionId = c.req.header('X-Session-Id');

  if (!sessionId) {
    return c.json({ error: 'X-Session-Id header required' }, 400);
  }

  const existed = store.sessions.delete(sessionId);

  return c.json({
    success: existed,
    message: existed ? 'Session ended' : 'Session not found',
  });
});

export { auth };
