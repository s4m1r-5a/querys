const crypto = require('crypto');
const { browser } = require('../config/query.config');

class ChallengeRequiredError extends Error {
  constructor(challenge) {
    super('Se requiere respuesta del cliente para continuar la consulta');
    this.code = 'CHALLENGE_REQUIRED';
    this.challenge = challenge;
  }
}

class ChallengeExpiredError extends Error {
  constructor() {
    super('La sesion de la pregunta expiro');
    this.code = 'CHALLENGE_EXPIRED';
  }
}

class ChallengeStore {
  constructor({ ttlMs = browser.challengeTtlMs, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.sessions = new Map();
  }

  create(session) {
    const sessionId = crypto.randomUUID();
    const expiresAtMs = this.now() + this.ttlMs;
    const challenge = {
      sessionId,
      question: session.question,
      attempts: session.attempts,
      expiresAt: new Date(expiresAtMs).toISOString()
    };

    this.sessions.set(sessionId, {
      ...session,
      sessionId,
      expiresAtMs
    });

    return challenge;
  }

  get(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new ChallengeExpiredError();

    if (session.expiresAtMs <= this.now()) {
      this.delete(sessionId);
      throw new ChallengeExpiredError();
    }

    return session;
  }

  delete(sessionId) {
    const session = this.sessions.get(sessionId);
    this.sessions.delete(sessionId);
    return session;
  }

  async cleanupExpired() {
    const expired = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAtMs <= this.now()) {
        expired.push(sessionId);
        if (session.close) await Promise.resolve(session.close()).catch(() => {});
        this.sessions.delete(sessionId);
      }
    }

    return expired;
  }
}

module.exports = {
  ChallengeRequiredError,
  ChallengeExpiredError,
  ChallengeStore,
  challengeStore: new ChallengeStore()
};
