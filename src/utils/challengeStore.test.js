const {
  ChallengeExpiredError,
  ChallengeStore
} = require('./challengeStore');

describe('challenge store', () => {
  test('creates and retrieves a pending challenge', () => {
    const store = new ChallengeStore({ ttlMs: 1000, now: () => 100 });
    const challenge = store.create({
      question: 'Pregunta desconocida',
      attempts: 5,
      close: jest.fn()
    });

    expect(challenge.question).toBe('Pregunta desconocida');
    expect(challenge.attempts).toBe(5);
    expect(store.get(challenge.sessionId).question).toBe('Pregunta desconocida');
  });

  test('expires old challenge sessions', () => {
    let now = 100;
    const store = new ChallengeStore({ ttlMs: 1000, now: () => now });
    const challenge = store.create({
      question: 'Pregunta desconocida',
      attempts: 5,
      close: jest.fn()
    });

    now = 1200;
    expect(() => store.get(challenge.sessionId)).toThrow(ChallengeExpiredError);
  });

  test('deletes a consumed challenge session', () => {
    const store = new ChallengeStore({ ttlMs: 1000, now: () => 100 });
    const challenge = store.create({
      question: 'Pregunta desconocida',
      attempts: 5,
      close: jest.fn()
    });

    expect(store.delete(challenge.sessionId).question).toBe('Pregunta desconocida');
    expect(() => store.get(challenge.sessionId)).toThrow(ChallengeExpiredError);
  });
});
