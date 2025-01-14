const puppeteer = require('puppeteer');

// Constantes globales
const CONSTANTS = {
  NAVIGATION_TIMEOUT: 120000, // Aumentado a 2 minutos
  MAX_RETRIES: 3,
  RETRY_DELAY: 3000,
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
    { pre: '¿ Cuanto es 3 X 3 ?', res: '9' },
    { 
      pre: '¿Escriba las dos primeras letras del primer nombre de la persona a la cual esta expidiendo el certificado?',
      res: 'NO' // Respuesta por defecto ya que no conocemos el nombre
    }
  ]
};

// Mapeo de tipos de documento
const DOCUMENT_TYPES = new Map([
  ['1', 'CC'], // Cédula de ciudadanía
  ['4', 'CE'], // Cédula de extranjería
  ['5', 'PEP'] // Permiso Especial de Permanencia
]);

// Clase principal para manejar el browser
class BrowserManager {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disabled-setupid-sandbox',
          '--disable-dev-shm-usage'
        ],
        headless: false, // Cambiado a false para ver el navegador
        defaultViewport: null,
        slowMo: 50 // Agregado para ralentizar las acciones y verlas mejor
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async createPage() {
    if (!this.browser) {
      await this.initBrowser();
    }
    const page = await this.browser.newPage();
    await page.setDefaultNavigationTimeout(CONSTANTS.NAVIGATION_TIMEOUT);
    return page;
  }
}

const browserManager = new BrowserManager();

// Función para iniciar la consulta web
async function initWebConsult(retryCount = 0) {
  const page = await browserManager.createPage();

  try {
    console.log('Navegando a la página...');
    await page.goto(
      'https://www.procuraduria.gov.co/Pages/Consulta-de-Antecedentes.aspx'
    );
    await page.setViewport({ width: 1040, height: 682 });
    return page;
  } catch (error) {
    await page.close();
    if (retryCount >= CONSTANTS.MAX_RETRIES) {
      throw new Error(
        `Failed to init web consult after ${CONSTANTS.MAX_RETRIES} retries`
      );
    }
    console.log(`Retry attempt ${retryCount + 1} due to: ${error.message}`);
    await new Promise(resolve => setTimeout(resolve, CONSTANTS.RETRY_DELAY));
    return initWebConsult(retryCount + 1);
  }
}

// Función principal para consultar documentos
async function consultDocument(type, doc) {
  let originalPage = null;
  let currentPage = null;
  try {
    originalPage = await initWebConsult();
    currentPage = originalPage;
    
    console.log('Esperando a que la página se cargue...');
    // Esperar por el estado de carga del DOM
    await currentPage.waitForFunction(
      () => document.readyState === 'complete',
      { timeout: 30000 }
    );
    
    // Dar un pequeño tiempo adicional para que los scripts se ejecuten
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Buscando el selector ddlTipoID...');
    
    // Esperar a que el iframe se cargue si existe
    const frames = await currentPage.frames();
    for (const frame of frames) {
      try {
        const element = await frame.$('#ddlTipoID');
        if (element) {
          console.log('Elemento encontrado en un iframe');
          currentPage = frame;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Intentar encontrar el elemento
    try {
      await currentPage.waitForFunction(
        () => document.querySelector('#ddlTipoID') !== null,
        { timeout: 10000 }
      );
      console.log('Elemento encontrado en el DOM');
    } catch (e) {
      console.error('Error al esperar el elemento:', e);
      const html = await currentPage.content();
      console.log('HTML de la página:', html);
      throw new Error('No se pudo encontrar el elemento ddlTipoID');
    }

    // Seleccionar tipo de documento
    await currentPage.select('#ddlTipoID', type);
    console.log('Tipo de documento seleccionado:', type);
    
    await currentPage.type('#txtNumID', doc);

    // Manejar preguntas de verificación
    let verified = false;
    let attempts = 0;
    const MAX_VERIFICATION_ATTEMPTS = 10;

    while (!verified && attempts < MAX_VERIFICATION_ATTEMPTS) {
      try {
        await currentPage.waitForSelector('#lblPregunta', { timeout: 5000 });
        const question = await currentPage.$eval('#lblPregunta', e => e.innerText);
        console.log('Pregunta recibida:', question);

        // Agregar preguntas dinámicas sobre el documento
        const dynamicQuestions = [
          {
            pre: '¿Escriba los dos ultimos digitos del documento a consultar?',
            res: doc.slice(-2)
          },
          {
            pre: '¿Escriba los tres primeros digitos del documento a consultar?',
            res: doc.slice(0, 3)
          }
        ];

        const allQuestions = [...CONSTANTS.QUESTIONS_ANSWERS, ...dynamicQuestions];
        const answer = allQuestions.find(q => q.pre === question);

        if (!answer) {
          console.log('Pregunta no conocida, actualizando...');
          await currentPage.click('#ImageButton1');
          
          // Esperar a que la pregunta cambie
          await currentPage.waitForFunction(
            (currentQuestion) => {
              const newQuestion = document.querySelector('#lblPregunta').innerText;
              return newQuestion !== currentQuestion;
            },
            { timeout: 5000 },
            question
          );
          
          attempts++;
          continue;
        }

        console.log('Pregunta conocida encontrada, respondiendo:', answer.res);
        await currentPage.type('#txtRespuestaPregunta', answer.res);
        await currentPage.click('#btnConsultar');
        
        // Esperar a que aparezca la validación o los datos
        try {
          await currentPage.waitForFunction(
            () => {
              const validation = document.querySelector('#ValidationSummary1');
              const datos = document.querySelector('#divSec > div.datosConsultado > span');
              return validation || datos;
            },
            { timeout: 10000 }
          );
          
          // Dar tiempo adicional para que se complete la carga
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Verificar si hay mensaje de validación
          const validationElement = await currentPage.$('#ValidationSummary1');
          if (validationElement) {
            const validationText = await validationElement.evaluate(el => el.innerText);
            verified = !/Falla la validación del CAPTCHA.|El valor ingresado para la respuesta no responde a la pregunta./.test(
              validationText.trim()
            );

            if (!verified) {
              console.log('Verificación fallida, intentando de nuevo...');
              await currentPage.click('#ImageButton1');
              
              // Esperar a que la pregunta cambie
              await currentPage.waitForFunction(
                (currentQuestion) => {
                  const newQuestion = document.querySelector('#lblPregunta').innerText;
                  return newQuestion !== currentQuestion;
                },
                { timeout: 5000 },
                question
              );
              
              attempts++;
              continue;
            }
          }
          
          // Si no hay error de validación, verificar si hay datos
          const datosElement = await currentPage.$('#divSec > div.datosConsultado > span');
          if (datosElement) {
            console.log('Datos encontrados, procediendo a extraer...');
            verified = true;
          } else {
            console.log('No se encontraron datos, intentando de nuevo...');
            verified = false;
            await currentPage.click('#ImageButton1');
            attempts++;
            continue;
          }
          
        } catch (error) {
          console.error('Error esperando resultados:', error);
          verified = false;
          attempts++;
          continue;
        }
      } catch (error) {
        console.error('Error en el proceso de verificación:', error);
        await currentPage.click('#ImageButton1');
        
        try {
          // Esperar a que la pregunta cambie
          await currentPage.waitForFunction(
            (currentQuestion) => {
              const newQuestion = document.querySelector('#lblPregunta').innerText;
              return newQuestion !== currentQuestion;
            },
            { timeout: 5000 },
            question
          );
        } catch (e) {
          console.error('Error esperando el cambio de pregunta:', e);
        }
        
        attempts++;
        if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
          throw new Error('Se alcanzó el límite máximo de intentos de verificación');
        }
      }
    }

    if (!verified) {
      throw new Error('No se pudo completar la verificación después de varios intentos');
    }

    // Extraer información
    console.log('Extrayendo información...');
    const names = await currentPage.$$eval(
      '#divSec > div.datosConsultado > span',
      elements => elements.map(e => e.innerText)
    );

    if (!names.length) {
      console.log('No se encontraron nombres en la respuesta');
      throw new Error('No se encontraron datos en la respuesta');
    }

    console.log('Nombres encontrados:', names);
    // Procesar nombres
    const fullName = names.join(' ').trim();
    const firstName = names.slice(0, 2).join(' ').trim();
    const lastName = names.slice(2).join(' ').trim();

    return {
      success: true,
      docType: DOCUMENT_TYPES.get(type),  // Convertir el número al tipo de documento (CC, CE, etc.)
      docNumber: doc,
      firstName,
      lastName,
      fullName,
      arrayName: names,
      records: await extractRecords(currentPage)
    };
  } catch (error) {
    console.error('Error en consulta de documento:', error);
    return { success: false, message: error.message };
  } finally {
    if (originalPage && !originalPage.isClosed()) {
      await originalPage.close();
    }
  }
}

// Función auxiliar para extraer antecedentes
async function extractRecords(page) {
  try {
    const hasRecords = await page.$('#divSec > div.SeccionAnt h2');
    if (!hasRecords) {
      return await page.$eval('#divSec > h2:nth-child(3)', e => e.innerText);
    }

    const records = await page.$$eval(
      '#divSec > div.SeccionAnt > div.SessionNumSiri > h2, h3, tr',
      elements =>
        elements.map(e =>
          /th|td/.test(e.innerHTML) ? e.innerText.split(/\t|\n/) : e.innerText
        )
    );

    if (records.length === 0) {
      return await page.$$eval(
        '#divSec > div.SeccionAnt > table > tbody > tr',
        rows => rows.map(r => r.innerText.split('\t'))
      );
    }

    return records;
  } catch (error) {
    console.error('Error extracting records:', error);
    return 'Error al extraer antecedentes';
  }
}

// Exportar funciones principales
module.exports = {
  async documentQuery(type, doc) {
    try {
      return await consultDocument(type, doc);
    } catch (error) {
      console.error('Error in document query:', error);
      return { success: false, message: error.message };
    }
  },

  async usuryRateQuery() {
    let page = null;
    try {
      page = await browserManager.createPage();
      await page.goto(
        'https://www.larepublica.co/indicadores-economicos/bancos/tasa-de-usura'
      );

      const selector =
        '#vue-container > div.InternaIndicadores > div > div.flex-grow-1.wrapContentBody > div > div > div.grid-container > div > div > div.d-flex.CardDetailIndicator.multiple > div > div:nth-child(1) > div.priceIndicator > div > div.flex-grow-1 > span.price';
      await page.waitForSelector(selector);

      const rate = await page.$eval(selector, el => el.innerText);
      return { success: true, rate };
    } catch (error) {
      console.error('Error in usury rate query:', error);
      return { success: false, message: error.message };
    } finally {
      if (page) await page.close();
    }
  },

  // Método para cerrar el browser cuando sea necesario
  async closeBrowser() {
    await browserManager.closeBrowser();
  }
};
