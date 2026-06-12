require('dotenv').config();

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseNumber = (value, defaultValue) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

module.exports = {
  browser: {
    headless: parseBoolean(process.env.BROWSER_HEADLESS, true),
    timeoutMs: parseNumber(process.env.QUERY_TIMEOUT_MS, 120000),
    retryAttempts: parseNumber(process.env.QUERY_RETRIES, 3),
    challengeTtlMs: parseNumber(process.env.CHALLENGE_TTL_MS, 300000),
    questionLookupAttempts: parseNumber(process.env.QUESTION_LOOKUP_ATTEMPTS, 5),
    proxyRotation: process.env.PROXY_ROTATION || 'round_robin',
    proxyUrls: (process.env.PROXY_URLS || '')
      .split(',')
      .map(proxy => proxy.trim())
      .filter(Boolean)
  },
  tests: {
    runLiveQueries: parseBoolean(process.env.RUN_LIVE_QUERIES, false)
  }
};
