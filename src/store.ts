/**
 * In-memory store for MVP. Replace with SQLite or Postgres in production.
 */

export interface Session {
  id: string;
  type: 'guest' | 'apple' | 'google';
  createdAt: number;
  externalId?: string;
}

export interface UserData {
  sessionId: string;
  score: number;
  streak: number;
  lastPlayedAt: number | null;
  updatedAt: number;
}

const sessions = new Map<string, Session>();
const userData = new Map<string, UserData>();

export const store = {
  sessions: {
    create(session: Session): Session {
      sessions.set(session.id, session);
      return session;
    },
    get(id: string): Session | undefined {
      return sessions.get(id);
    },
    delete(id: string): boolean {
      return sessions.delete(id);
    },
  },

  userData: {
    get(sessionId: string): UserData | undefined {
      return userData.get(sessionId);
    },
    upsert(data: UserData): UserData {
      userData.set(data.sessionId, data);
      return data;
    },
  },
};
