require('dotenv').config();
const { addExtra } = require('puppeteer-extra');
const basePuppeteerModule = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { calculateVerificationDigit } = require('./common');
const { browser: browserConfig } = require('../config/query.config');
const selectors = require('../config/selectors');
const { ProxyRotator } = require('./proxy');
const {
  ChallengeRequiredError,
  challengeStore
} = require('./challengeStore');

const puppeteer = addExtra(basePuppeteerModule.default || basePuppeteerModule);
puppeteer.use(StealthPlugin());

const CONSTANTS = {
  NAVIGATION_TIMEOUT: browserConfig.timeoutMs,
  RETRY_ATTEMPTS: browserConfig.retryAttempts,
  QUESTION_LOOKUP_ATTEMPTS: browserConfig.questionLookupAttempts,
  QUESTIONS_ANSWERS: [
    { pre: '¿ Cuanto es 4 + 3 ?', res: '7' },
    { pre: '¿ Cuanto es 2 X 3 ?', res: '6' },
    { pre: '¿ Cual es la Capital del Vallle del Cauca?', res: 'Cali' },
    { pre: '¿ Cual es la Capital de Antioquia (sin tilde)?', res: 'Medellin' },
    { pre: '¿ Cual es la Capital del Atlantico?', res: 'Barranquilla' },
    { pre: '¿ Cuanto es 9 - 2 ?', res: '7' },
    { pre: '¿ Cuanto es 5 + 3 ?', res: '8' },
    { pre: '¿ Cuanto es 6 + 2 ?', res: '8' },
    { pre: '¿ Cuanto es 3 - 2 ?', res: '1' },
    { pre: '¿ Cual es la Capital de Colombia (sin tilde)?', res: 'Bogota' },
    { pre: '¿ Cuanto es 3 X 3 ?', res: '9' }
  ]
};

const DOCUMENT_TYPES = new Map([
  ['CC', '1'],
  ['CE', '4'],
  ['PEP', '5']
]);

const proxyRotator = new ProxyRotator(browserConfig.proxyUrls);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const gotoWithRetries = async (page, url, options) => {
  let lastError;

  for (let attempt = 1; attempt <= CONSTANTS.RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await page.goto(url, options);
      const status = response?.status();

      if (status >= 500) {
        throw new Error(`El sitio respondio HTTP ${status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt === CONSTANTS.RETRY_ATTEMPTS) break;
      await wait(1000 * attempt);
    }
  }

  throw lastError;
};

const humanDelay = async (min = 80, max = 180) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await wait(delay);
};

const typeLikeHuman = async (context, selector, value) => {
  await context.focus(selector);
  await humanDelay();
  await context.type(selector, value, { delay: 90 });
};

class BrowserManager {
  async createBrowser() {
    const proxy = proxyRotator.next();
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ];

    if (proxy?.server) args.push(`--proxy-server=${proxy.server}`);

    const launchOptions = {
      args,
      headless: browserConfig.headless,
      defaultViewport: { width: 1366, height: 768 }
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    return { browser, proxy };
  }

  async createPage() {
    const { browser, proxy } = await this.createBrowser();
    const page = await browser.newPage();

    if (proxy?.username || proxy?.password) {
      await page.authenticate({
        username: proxy.username,
        password: proxy.password
      });
    }

    await page.setDefaultNavigationTimeout(CONSTANTS.NAVIGATION_TIMEOUT);
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );

    return { browser, page };
  }
}

const browserManager = new BrowserManager();

const getDynamicQuestions = docNumber => [
  {
    pre: '¿Escriba los dos ultimos digitos del documento a consultar?',
    res: docNumber.slice(-2)
  },
  {
    pre: '¿Escriba los tres primeros digitos del documento a consultar?',
    res: docNumber.slice(0, 3)
  }
];

const getQuestionAnswer = (question, docNumber) => {
  const normalizedQuestion = String(question || '').trim();
  const answers = [...CONSTANTS.QUESTIONS_ANSWERS, ...getDynamicQuestions(docNumber)];
  return answers.find(answer => answer.pre === normalizedQuestion);
};

async function getQuestionChange(page, question) {
  const procuraduria = selectors.procuraduria;
  await page.click(procuraduria.changeQuestionButton);
  await page.waitForFunction(
    (currentQuestion, questionSelector, answerSelector) => {
      const answerInput = document.querySelector(answerSelector);
      if (answerInput) answerInput.value = '';

      const questionElement = document.querySelector(questionSelector);
      return questionElement && questionElement.innerText.trim() !== currentQuestion;
    },
    { timeout: 60000 },
    question,
    procuraduria.questionLabel,
    procuraduria.answerInput
  );
}

async function extractRecords(page) {
  const procuraduria = selectors.procuraduria;

  try {
    const hasRecords = await page.$(procuraduria.recordsHeader);
    if (!hasRecords) {
      return await page.$eval(procuraduria.noRecords, e => e.innerText);
    }

    const records = await page.$$eval(procuraduria.recordsRows, elements =>
      elements.map(e =>
        /th|td/.test(e.innerHTML)
          ? e.innerText.split(/\t|\n/).filter(Boolean)
          : e.innerText
      )
    );

    if (records.length) return records;

    return await page.$$eval(procuraduria.recordsFallbackRows, rows =>
      rows.map(row => row.innerText.split('\t').filter(Boolean))
    );
  } catch (error) {
    console.error('Error extracting records:', error.message);
    return 'No se pudieron extraer antecedentes';
  }
}

async function findDocumentFrame(page) {
  const procuraduria = selectors.procuraduria;
  const hasSelector = async context => {
    try {
      await context.waitForSelector(procuraduria.docTypeSelect, {
        timeout: 5000,
        visible: true
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  if (await hasSelector(page)) return page;

  const preferredFrames = page
    .frames()
    .filter(frame => frame.url().includes(procuraduria.frameUrlIncludes));
  const remainingFrames = page
    .frames()
    .filter(frame => !frame.url().includes(procuraduria.frameUrlIncludes));

  for (const frame of [...preferredFrames, ...remainingFrames]) {
    if (await hasSelector(frame)) return frame;
  }

  await page.reload({ waitUntil: 'networkidle0' });
  await wait(5000);

  if (await hasSelector(page)) return page;

  for (const frame of page.frames()) {
    if (await hasSelector(frame)) return frame;
  }

  throw new Error('No se encontro el formulario de consulta de antecedentes');
}

async function waitForResultOrValidation(page) {
  const procuraduria = selectors.procuraduria;
  const selector = await page.waitForFunction(
    (resultSelector, validationSelector) => {
      if (document.querySelector(resultSelector)) return resultSelector;
      if (document.querySelector(validationSelector)) return validationSelector;
      return false;
    },
    { timeout: 60000 },
    procuraduria.resultContainer,
    procuraduria.validationSummary
  );

  const resultSelector = await selector.jsonValue();
  await page.waitForSelector(resultSelector, { visible: true, timeout: 30000 });
  return resultSelector;
}

async function extractDocumentResult(page, docType, docNumber) {
  const procuraduria = selectors.procuraduria;
  await page.waitForSelector(procuraduria.resultContainer, {
    visible: true,
    timeout: 10000
  });

  const names = await page.$$eval(procuraduria.names, elements =>
    elements.map(e => e.innerText.trim()).filter(Boolean)
  );

  if (!names.length) throw new Error('No se encontraron datos para el documento');

  return {
    personType: 'NATURAL',
    docType,
    docNumber,
    fullName: names.join(' '),
    status: 'CONSULTADO',
    additionalData: {
      firstName: names.slice(0, 2).join(' '),
      lastName: names.slice(2).join(' '),
      arrayName: names,
      criminalRecord: await extractRecords(page)
    }
  };
}

async function submitKnownAnswer(page, answer, docType, docNumber) {
  const procuraduria = selectors.procuraduria;
  await page.evaluate(answerSelector => {
    const answerInput = document.querySelector(answerSelector);
    if (answerInput) answerInput.value = '';
  }, procuraduria.answerInput);

  await typeLikeHuman(page, procuraduria.answerInput, answer);
  await humanDelay();
  await page.click(procuraduria.submitButton);
  await waitForResultOrValidation(page);

  const validationText = await page
    .$eval(procuraduria.validationSummary, element => element.innerText.trim())
    .catch(() => '');

  if (!validationText) return extractDocumentResult(page, docType, docNumber);

  const isRetryableValidation = [
    'Falla la validación del CAPTCHA.',
    'El valor ingresado para la respuesta no responde a la pregunta.'
  ].some(text => validationText.includes(text));

  if (isRetryableValidation) {
    const err = new Error(validationText);
    err.code = 'ANSWER_REJECTED';
    throw err;
  }

  throw new Error(validationText);
}

async function findKnownQuestionOrCreateChallenge({
  page,
  browser,
  docType,
  docNumber,
  attempts = CONSTANTS.QUESTION_LOOKUP_ATTEMPTS
}) {
  const procuraduria = selectors.procuraduria;
  let lastQuestion = '';

  for (let unknownAttempts = 0; unknownAttempts < attempts; unknownAttempts++) {
    const question = await page.$eval(procuraduria.questionLabel, e => e.innerText.trim());
    const answer = getQuestionAnswer(question, docNumber);

    if (answer) {
      return { question, answer: answer.res, attempts: unknownAttempts };
    }

    lastQuestion = question;

    if (unknownAttempts === attempts - 1) {
      const challenge = challengeStore.create({
        browser,
        page,
        question,
        attempts,
        docType,
        docNumber,
        close: async () => browser.close()
      });
      throw new ChallengeRequiredError(challenge);
    }

    await getQuestionChange(page, question);
  }

  throw new Error(`No se encontro una pregunta conocida. Ultima pregunta: ${lastQuestion}`);
}

async function consultDocument(page, browser, docType, docNumber) {
  const procuraduria = selectors.procuraduria;
  const documentTypeId = DOCUMENT_TYPES.get(docType);
  if (!documentTypeId) throw new Error('Tipo de documento no valido para consulta de antecedentes');

  await gotoWithRetries(page, procuraduria.url, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });
  await wait(8000);

  const formContext = await findDocumentFrame(page);

  await formContext.select(procuraduria.docTypeSelect, documentTypeId);
  await humanDelay();
  await typeLikeHuman(formContext, procuraduria.docNumberInput, docNumber);
  await formContext.waitForSelector(procuraduria.questionLabel, { timeout: 5000 });

  const knownQuestion = await findKnownQuestionOrCreateChallenge({
    page: formContext,
    browser,
    docType,
    docNumber
  });

  return submitKnownAnswer(formContext, knownQuestion.answer, docType, docNumber);
}

async function answerDocumentChallenge(sessionId, answer) {
  const session = challengeStore.get(sessionId);

  try {
    const result = await submitKnownAnswer(
      session.page,
      String(answer || ''),
      session.docType,
      session.docNumber
    );

    challengeStore.delete(sessionId);
    await session.browser.close();
    return result;
  } catch (error) {
    if (error.code === 'ANSWER_REJECTED') {
      challengeStore.delete(sessionId);
      await session.browser.close();
      const err = new Error('La respuesta enviada no fue aceptada');
      err.code = 'CHALLENGE_ANSWER_REJECTED';
      throw err;
    }

    throw error;
  }
}

async function consultRues(page, nit) {
  const rues = selectors.rues;
  const searchUrl = `${rues.url.replace(/\/$/, '')}/buscar/RM/${nit}`;
  const waitForRuesSearchState = async () =>
    page.waitForFunction(
      resultSelector => {
        const hasResult = !!document.querySelector(resultSelector);
        const text = document.body.innerText || '';
        const hasNoResults = /no se encontraron|no existen resultados|sin resultados/i.test(text);
        return hasResult || hasNoResults;
      },
      { timeout: 30000 },
      rues.resultCard
    );

  const hasRuesNoResults = async () =>
    page.evaluate(resultSelector => {
      if (document.querySelector(resultSelector)) return false;
      const text = document.body.innerText || '';
      return /no se encontraron|no existen resultados|sin resultados/i.test(text);
    }, rues.resultCard);

  await gotoWithRetries(page, searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  await waitForRuesSearchState().catch(async () => {
    await gotoWithRetries(page, rues.url, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.waitForSelector(rues.searchInput, { visible: true, timeout: 15000 });
    await typeLikeHuman(page, rues.searchInput, nit);

    await page.evaluate(selector => {
      const button = document.querySelector(selector);
      if (button) button.click();
    }, rues.searchButton);

    await page
      .waitForFunction(
        (resultSelector, expectedPath) =>
          !!document.querySelector(resultSelector) || window.location.pathname.includes(expectedPath),
        { timeout: 15000 },
        rues.resultCard,
        `/buscar/RM/${nit}`
      )
      .catch(() => {});

    if (!(await page.$(rues.resultCard))) {
      await gotoWithRetries(page, searchUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    }

    await waitForRuesSearchState();
  });

  const noResults = await hasRuesNoResults();
  if (noResults) {
    const includeCancelled = await page.$(rues.includeCancelledCheckbox);
    if (includeCancelled) {
      await includeCancelled.click();
      await page.evaluate(selector => {
        const button = document.querySelector(selector);
        if (button) button.click();
      }, rues.filteredSearchButton);
    }

    await waitForRuesSearchState();

    if (await hasRuesNoResults()) {
      throw new Error(`No se encontraron resultados para el NIT ${nit}`);
    }
  }

  await page.waitForSelector(rues.resultCard, { visible: true, timeout: 10000 });

  await page
    .evaluate(() => {
      const links = Array.from(document.querySelectorAll('.card-result a'));
      const link = links.find(a => a.textContent.trim().includes('Ver información'));
      if (link) link.click();
    })
    .catch(() => {});

  await page.waitForSelector(rues.registryRows, { visible: true, timeout: 15000 });

  const data = await page.evaluate(ruesSelectors => {
    const getRows = container =>
      Array.from(container.querySelectorAll(ruesSelectors.registryRows))
        .map(row => {
          const label = row.querySelector(ruesSelectors.registryLabel)?.textContent?.trim();
          const value = row.querySelector(ruesSelectors.registryValue)?.textContent?.trim();
          return { label, value };
        })
        .filter(row => row.label && row.value);

    const card = document.querySelector(ruesSelectors.resultCard);
    const cardLines = card?.innerText?.split('\n').map(line => line.trim()).filter(Boolean) || [];
    const source = document.querySelector(ruesSelectors.generalTab) || card;
    const response = {
      personType: 'JURIDICA',
      docType: 'NIT',
      fullName: document.querySelector(ruesSelectors.title)?.textContent?.trim() || cardLines[0] || '',
      additionalData: {}
    };

    getRows(source).forEach(({ label, value }) => {
      switch (label) {
        case 'Identificación': {
          const nitMatch = value.match(/(?:NIT\s+)?(\d+)\s*-\s*(\d+)/i);
          if (nitMatch) {
            response.docNumber = nitMatch[1];
            response.verifyDigit = nitMatch[2];
          }
          break;
        }
        case 'Categoria de la Matrícula':
        case 'Categoria':
          response.personType = value.toUpperCase() === 'PERSONA NATURAL' ? 'NATURAL' : 'JURIDICA';
          response.additionalData.category = value;
          break;
        case 'Tipo de Sociedad':
          response.additionalData.societyType = value;
          break;
        case 'Tipo Organización':
          response.additionalData.legalOrganization = value;
          break;
        case 'Número de Matrícula':
          response.additionalData.tradeLicense = value;
          break;
        case 'Estado de la matrícula':
        case 'Estado':
          response.status = value;
          break;
        case 'Fecha de Actualización':
          response.additionalData.tradeUpdateDate = value;
          break;
        case 'Último año renovado':
          response.additionalData.lastRenewedYear = value;
          break;
        case 'Cámara de Comercio':
          response.additionalData.city = value;
          break;
        case 'Fecha de Matrícula':
          response.additionalData.foundationDate = value;
          break;
        case 'Fecha de Vigencia':
          response.additionalData.expirationDate = value;
          break;
        case 'Motivo Cancelación':
          response.additionalData.cancellationReason = value;
          break;
      }
    });

    return response;
  }, rues);

  if (!data.docNumber) data.docNumber = nit;
  if (!data.verifyDigit) data.verifyDigit = String(calculateVerificationDigit(data.docNumber));
  if (!data.fullName) throw new Error(`No se encontro razon social para el NIT ${nit}`);

  const activities = await page.evaluate(ruesSelectors => {
    const economicTab = document.querySelector(ruesSelectors.economicTab);
    if (!economicTab) return [];

    return Array.from(economicTab.querySelectorAll(ruesSelectors.registryRows))
      .map(row => {
        const code = row.querySelector(ruesSelectors.registryLabel)?.textContent?.trim();
        const description = row.querySelector(ruesSelectors.registryValue)?.textContent?.trim();
        if (!code || !description) return null;
        return `${code} - ${description}`;
      })
      .filter(Boolean);
  }, rues);

  data.additionalData.activity = activities;

  if (data.personType === 'NATURAL') {
    const names = data.fullName.split(/\s+/).filter(Boolean);
    data.additionalData = {
      arrayName: names,
      firstName: names.slice(0, -2).join(' '),
      lastName: names.slice(-2).join(' '),
      criminalRecord: 'No se consultaron antecedentes en RUES',
      ...data.additionalData
    };
  }

  return data;
}

async function documentQuery(docType, docNumber) {
  const { browser, page } = await browserManager.createPage();

  try {
    const result = await consultDocument(page, browser, docType, docNumber);
    await browser.close();
    return result;
  } catch (error) {
    if (error instanceof ChallengeRequiredError) return error;
    await browser.close().catch(() => {});
    console.error('Error en consulta de documento:', error.message);
    return { success: false, message: error.message };
  }
}

async function companyQuery(nit) {
  const { browser, page } = await browserManager.createPage();

  try {
    const result = await consultRues(page, nit);
    await browser.close();
    return result;
  } catch (error) {
    await browser.close().catch(() => {});
    console.error('Error en consulta de NIT:', error.message);
    return { success: false, message: error.message };
  }
}

module.exports = {
  documentQuery,
  companyQuery,
  answerDocumentChallenge,
  closeExpiredChallenges: () => challengeStore.cleanupExpired(),
  __test: {
    getQuestionAnswer,
    findKnownQuestionOrCreateChallenge,
    gotoWithRetries,
    CONSTANTS
  }
};
