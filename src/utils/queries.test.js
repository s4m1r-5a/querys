const { ChallengeRequiredError, challengeStore } = require('./challengeStore');
const { __test } = require('./queries');

const createQuestionPage = questions => {
  let index = 0;

  return {
    $eval: jest.fn(async () => questions[index]),
    click: jest.fn(async () => {
      index += 1;
    }),
    waitForFunction: jest.fn(async () => true)
  };
};

describe('procuraduria question flow', () => {
  afterEach(async () => {
    for (const sessionId of challengeStore.sessions.keys()) {
      const session = challengeStore.delete(sessionId);
      if (session?.close) await Promise.resolve(session.close()).catch(() => {});
    }
  });

  test('finds a known question after four unknown attempts', async () => {
    const page = createQuestionPage([
      'Pregunta desconocida 1',
      'Pregunta desconocida 2',
      'Pregunta desconocida 3',
      'Pregunta desconocida 4',
      '¿ Cuanto es 4 + 3 ?'
    ]);

    const result = await __test.findKnownQuestionOrCreateChallenge({
      page,
      browser: { close: jest.fn() },
      docType: 'CC',
      docNumber: '1082926704',
      attempts: 5
    });

    expect(result.answer).toBe('7');
    expect(result.attempts).toBe(4);
    expect(page.click).toHaveBeenCalledTimes(4);
  });

  test('returns challenge after five unknown questions', async () => {
    const page = createQuestionPage([
      'Pregunta desconocida 1',
      'Pregunta desconocida 2',
      'Pregunta desconocida 3',
      'Pregunta desconocida 4',
      'Pregunta desconocida 5'
    ]);

    await expect(
      __test.findKnownQuestionOrCreateChallenge({
        page,
        browser: { close: jest.fn() },
        docType: 'CC',
        docNumber: '1082926704',
        attempts: 5
      })
    ).rejects.toMatchObject({
      code: 'CHALLENGE_REQUIRED',
      challenge: {
        question: 'Pregunta desconocida 5',
        attempts: 5
      }
    });

    expect(page.click).toHaveBeenCalledTimes(4);
  });

  test('retries navigation when the site responds with 5xx', async () => {
    const page = {
      goto: jest
        .fn()
        .mockResolvedValueOnce({ status: () => 503 })
        .mockResolvedValueOnce({ status: () => 200 })
    };

    const response = await __test.gotoWithRetries(page, 'https://example.test', {
      waitUntil: 'networkidle0'
    });

    expect(response.status()).toBe(200);
    expect(page.goto).toHaveBeenCalledTimes(2);
  });
});
