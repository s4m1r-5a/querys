const { tests } = require('../config/query.config');
const { execFileSync } = require('child_process');
const path = require('path');

const describeLive = tests.runLiveQueries ? describe : describe.skip;
const liveSmokeScript = path.resolve(__dirname, '../../scripts/live-smoke.js');

const runLiveSmoke = name =>
  JSON.parse(
    execFileSync(process.execPath, [liveSmokeScript, name], {
      encoding: 'utf8',
      timeout: 180000
    })
  )[name];

describeLive('live query smoke tests', () => {
  jest.setTimeout(180000);

  test('consults one CC fixture in Procuraduria', async () => {
    const result = runLiveSmoke('document');

    expect(result.success).not.toBe(false);
    expect(result.docType).toBe('CC');
    expect(result.docNumber).toBe('1082926704');
    expect(result.fullName).toEqual(expect.any(String));
  });

  test('consults one NIT fixture in RUES', async () => {
    const result = runLiveSmoke('company');

    expect(result.success).not.toBe(false);
    expect(result.docType).toBe('NIT');
    expect(result.docNumber).toBe('901600406');
    expect(result.verifyDigit).toBe('1');
  });

  test('consults usury rate service', async () => {
    const result = runLiveSmoke('usury');

    expect(result.error).toBeUndefined();
    expect(result.annualRate).toBeDefined();
  });
});
