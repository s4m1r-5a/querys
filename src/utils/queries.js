require('dotenv').config();
const puppeteer = require('puppeteer');
const OpenAI = require('openai');

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
    { pre: '¿ Cuanto es 3 X 3 ?', res: '9' }
  ]
};

// Mapeo de tipos de documento
const DOCUMENT_TYPES = new Map([
  ['1', 'CC'], // Cédula de ciudadanía
  ['4', 'CE'], // Cédula de extranjería
  ['5', 'PEP'] // Permiso Especial de Permanencia
]);

// Configure OpenAI (ensure to use environment variable for API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Make sure to set this environment variable
});

// Clase principal para manejar el browser
class BrowserManager {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disabled-setupid-sandbox', '--disable-dev-shm-usage', '--start-maximized'], // '--window-size=1920,1080'
        headless: true, // Cambiado a false para ver el navegador
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
    // await page.setViewport({ width: 1920, height: 1080 });
    // await page.setViewport({ width: 1040, height: 682 });
    return page;
  }
}

const browserManager = new BrowserManager();

// Función auxiliar para cambiar de pregunta
async function getQuestionChange(page, question) {
  await page.click('#ImageButton1');

  // Esperar a que la pregunta cambie
  await page.waitForFunction(
    currentQuestion => {
      document.getElementById('txtRespuestaPregunta').value = '';
      const newQuestion = document.querySelector('#lblPregunta').innerText;
      return newQuestion !== currentQuestion;
    },
    { timeout: 60000 },
    question
  );
}

// Función auxiliar para extraer antecedentes
async function extractRecords(page) {
  try {
    const hasRecords = await page.$('#divSec > div.SeccionAnt h2');
    if (!hasRecords) {
      return await page.$eval('#divSec > h2:nth-child(3)', e => e.innerText);
    }

    const records = await page.$$eval('#divSec > div.SeccionAnt > div.SessionNumSiri > h2, h3, tr', elements =>
      elements.map(e => (/th|td/.test(e.innerHTML) ? e.innerText.split(/\t|\n/) : e.innerText))
    );

    if (records.length === 0) {
      return await page.$$eval('#divSec > div.SeccionAnt > table > tbody > tr', rows =>
        rows.map(r => r.innerText.split('\t'))
      );
    }

    return records;
  } catch (error) {
    console.error('Error extracting records:', error);
    return 'Error al extraer antecedentes';
  }
}

// Función principal para consultar documentos
async function consultDocument(page, type, doc) {
  try {
    console.log('Navegando a la página...');
    await page.goto('https://www.procuraduria.gov.co/Pages/Consulta-de-Antecedentes.aspx', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    console.log('Esperando que la página cargue completamente...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Función auxiliar para verificar si el elemento existe
    const checkElementExists = async (context) => {
      try {
        await context.waitForSelector('#ddlTipoID', { 
          timeout: 5000,
          visible: true 
        });
        return true;
      } catch (e) {
        return false;
      }
    };

    console.log('Buscando el selector ddlTipoID...');
    
    // Intentar encontrar el elemento en la página principal
    let elementExists = await checkElementExists(page);
    let targetContext = page;

    if (!elementExists) {
      console.log('Elemento no encontrado en la página principal, buscando en iframes...');
      const frames = await page.frames();
      console.log(`Encontrados ${frames.length} frames`);

      for (const frame of frames) {
        try {
          const frameUrl = frame.url();
          console.log('Verificando frame:', frameUrl);
          
          if (frameUrl.includes('Consulta-de-Antecedentes')) {
            elementExists = await checkElementExists(frame);
            if (elementExists) {
              console.log('Elemento encontrado en iframe');
              targetContext = frame;
              break;
            }
          }
        } catch (e) {
          console.log('Error al buscar en frame:', e.message);
          continue;
        }
      }
    }

    if (!elementExists) {
      console.log('Intentando un último intento con refresco de página...');
      await page.reload({ waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 5000));
      elementExists = await checkElementExists(page);
      if (!elementExists) {
        throw new Error('No se pudo encontrar el elemento ddlTipoID después de múltiples intentos');
      }
    }

    console.log('Elemento ddlTipoID encontrado, procediendo con la selección...');
    page = targetContext;

    // Seleccionar tipo de documento
    await page.select('#ddlTipoID', type);
    await page.type('#txtNumID', doc);
    await page.waitForSelector('#lblPregunta', { timeout: 5000 });

    // Manejar preguntas de verificación
    let verified = false;
    let attempts = 0;
    const MAX_VERIFICATION_ATTEMPTS = 10;

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

    while (!verified && attempts < MAX_VERIFICATION_ATTEMPTS) {
      try {
        const question = await page.$eval('#lblPregunta', e => e.innerText);
        console.log('Pregunta recibida:', question);
        const answer = allQuestions.find(q => q.pre === question);

        if (!answer) {
          console.log('Pregunta no conocida, actualizando...');
          await getQuestionChange(page, question);

          attempts++;
          continue;
        }

        console.log('Pregunta conocida encontrada, respondiendo:', answer.res);
        await page.type('#txtRespuestaPregunta', answer.res);
        await page.click('#btnConsultar');

        let element = false;
        await page.waitForFunction(
          () => {
            if (!!document.getElementById('divSec')) element = '#divSec';
            else if (!!document.getElementById('ValidationSummary1')) element = '#ValidationSummary1';
            return element;
          },
          { timeout: 60000 }
        );
        console.log('Selector encontrado:', element);
        await page.waitForSelector(element, { visible: true, timeout: 30000 });
        const validationElement = await page.$('#ValidationSummary1');
        const validationText = await validationElement.evaluate(el => el.innerText);
        const texts = [
          'Falla la validación del CAPTCHA.',
          'El valor ingresado para la respuesta no responde a la pregunta.'
        ];

        const verifyText = texts.some(text => validationText.includes(text));

        if (!validationText) {
          console.log('Datos encontrados, procediendo a extraer...');
          verified = true;
          continue;
        } else if (verifyText) {
          console.log('Verificación fallida, intentando de nuevo...');
          await getQuestionChange(page, question);
          attempts++;
          continue;
        } else throw new Error(validationText);
      } catch (error) {
        // console.error('Error en el proceso de verificación:', error);
        throw error;
      }
    }

    if (!verified) {
      throw new Error('No se pudo completar la verificación después de varios intentos');
    }

    // Extraer información
    await page.waitForSelector('#divSec', { visible: true, timeout: 10000 });
    console.log('Extrayendo información...');
    const names = await page.$$eval('#divSec > div.datosConsultado > span', elements => elements.map(e => e.innerText));

    if (!names.length) {
      console.log('No se encontraron nombres en la respuesta');
      throw new Error('No se encontraron datos en la respuesta');
    }

    // Procesar nombres
    const fullName = names.join(' ').trim();
    const firstName = names.slice(0, 2).join(' ').trim();
    const lastName = names.slice(2).join(' ').trim();

    return {
      docType: DOCUMENT_TYPES.get(type), // Convertir el número al tipo de documento (CC, CE, etc.)
      docNumber: doc,
      fullName,
      additionalData: {
        firstName,
        lastName,
        arrayName: names,
        criminalRecord: await extractRecords(page)
      }
    };
  } catch (error) {
    console.error('Error en consulta de documento:', error);
    return { success: false, message: error.message };
  }
}

// Función principal de consulta de documentos
async function documentQuery(type, doc) {
  const page = await browserManager.createPage();

  try {
    return await consultDocument(page, type, doc);
  } catch (error) {
    console.error('Error in document query:', error);
    return { message: error.message };
  } finally {
    if (page && !page.isClosed()) await page.close();
  }
}

//////////////////////////////////////////////////////////////////////////

// Función para realizar la Consulta en rues.org.co
async function consultRues(page, nit) {
  try {
    // Navegar a la página
    await page.goto('https://www.rues.org.co', { waitUntil: 'networkidle0', timeout: 10000 });

    // Verificar si el campo búsqueda está presente
    const searchInput = await page.$('#search');

    if (!searchInput) {
      console.log('Campo de búsqueda no encontrado, intentando recargar...');
      await page.reload({ waitUntil: 'networkidle0' });
    }

    // Esperar y escribir el NIT
    await page.waitForSelector('#search', { visible: true, timeout: 10000 });
    await page.type('#search', nit);

    // Hacer clic en el botón de búsqueda
    await page.evaluate(selector => {
      const button = document.querySelector(selector);
      if (button) button.click();
    }, 'form button[type="submit"].btn-busqueda');

    // Esperar a que la página cambie y aparezcan los resultados
    await page.waitForFunction(
      () => !!document.querySelector('.card-result') || !!document.querySelector('.alert-info'),
      { timeout: 3000 }
    );

    // Verificar si no hay resultados
    const noResultsIni = await page.$('.alert-info');

    if (noResultsIni) {
      await page.click('#chk_cancelada');

      // Hacer clic en el botón de búsqueda
      await page.evaluate(selector => {
        const button = document.querySelector(selector);
        if (button) button.click();
      }, 'form.filtro__inside button[type="submit"]');

      // Esperar a que la página cambie y aparezcan los resultados
      await page.waitForFunction(
        () => !!document.querySelector('.card-result') || !!document.querySelector('.alert-info'),
        { timeout: 30000 }
      );

      // Verificar si no hay resultados
      const noResultsIni2 = await page.$('.alert-info');
      if (noResultsIni2) throw new Error('No se encontraron resultados, despues de la busqueda');
    }

    // Esperar a que los resultados sean visibles
    await page.waitForSelector('.card-result', { visible: true, timeout: 10000 });

    // Encontrar y hacer clic en el enlace de detalles
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.card-result a'));
      const link = links.find(a => a.href && a.href.includes('buscar'));
      if (link) link.click();
      else throw new Error('No se encontró el enlace de detalles');
    });

    // Esperar a que la página cambie y aparezcan los resultados
    await page.waitForSelector('#detail-tabs-tabpane-pestana_general', { visible: true, timeout: 10000 });

    // Esperar a que cargue la página de detalles
    await page.waitForSelector('.registroapi', { visible: true, timeout: 10000 });

    // Extraer información general
    const datosConsultados = await page.evaluate(() => {
      const datos = {
        docType: 'NIT',
        fullName: document.querySelector('h1.intro__nombre')?.textContent?.trim() || '',
        additionalData: {}
      };

      const pestanaGeneral = document.querySelector('#detail-tabs-tabpane-pestana_general');

      if (!pestanaGeneral) return;

      const registros = pestanaGeneral.querySelectorAll('.registroapi');

      registros.forEach(registro => {
        const etiqueta = registro.querySelector('.registroapi__etiqueta')?.textContent?.trim();

        const valor = registro.querySelector('.registroapi__valor')?.textContent?.trim();

        if (!etiqueta || !valor) return;

        switch (etiqueta) {
          case 'Identificación':
            const nitMatch = valor.match(/NIT (\d+)\s*-\s*(\d+)/);
            console.log('nitMatch:', nitMatch);
            if (nitMatch) {
              datos.docNumber = nitMatch[1];
              datos.verifyDigit = nitMatch[2];
            }
            break;
          case 'Categoria de la Matrícula':
            datos.personType = valor.toUpperCase() === 'PERSONA NATURAL' ? 'NATURAL' : 'JURIDICA';
            datos.additionalData.category = valor;
            break;
          case 'Tipo de Sociedad':
            datos.additionalData.societyType = valor;
            break;
          case 'Tipo Organización':
            datos.additionalData.legalOrganization = valor;
            break;
          case 'Número de Matrícula':
            datos.additionalData.tradeLicense = valor;
            break;
          case 'Estado de la matrícula':
            datos.status = valor;
            break;
          case 'Fecha de Actualización':
            datos.additionalData.tradeUpdateDate = valor;
            break;
          case 'Último año renovado':
            datos.additionalData.lastRenewedYear = valor;
            break;
          case 'Cámara de Comercio':
            datos.additionalData.city = valor;
            break;
          case 'Fecha de Matrícula':
            datos.additionalData.foundationDate = valor;
            break;
          case 'Fecha de Vigencia':
            datos.additionalData.expirationDate = valor;
            break;
          case 'Motivo Cancelación':
            datos.additionalData.cancellationReason = valor;
            break;
        }
      });

      return datos;
    });

    // Extraer actividades-economicas
    const actividades = await page.evaluate(() => {
      const pestanaEconomica = document.querySelector('#detail-tabs-tabpane-pestana_economica');
      if (!pestanaEconomica) return [];

      return Array.from(pestanaEconomica.querySelectorAll('.registroapi'))
        .map(reg => {
          const codigo = reg.querySelector('.registroapi__etiqueta')?.textContent?.trim();
          const descripcion = reg.querySelector('.registroapi__valor')?.textContent?.trim();
          if (!codigo || !descripcion) return null;
          return `${codigo} - ${descripcion}`;
        })
        .filter(Boolean);
    });

    datosConsultados.additionalData.activity = actividades;

    // Extract information of representatives
    const textorepresentantes = await page.evaluate(() => {
      const legalDiv = document.querySelector('#detail-tabs-tabpane-pestana_representante .legal');

      if (!legalDiv) return '';

      return legalDiv.textContent;
    });

    // Incluir los datos restantes
    if (datosConsultados?.personType === 'NATURAL') {
      datosConsultados.additionalData = {
        // Campos derivados del nombre
        arrayName: datosConsultados.fullName.split(' '),
        lastName: datosConsultados.fullName.split(' ').slice(-2).join(' '),
        firstName: datosConsultados.fullName.split(' ').slice(0, -2).join(' '),
        criminalRecord: 'No se encontró información',
        ...datosConsultados.additionalData
      };
    }

    if (!textorepresentantes) return datosConsultados;

    // Use OpenAI to extract document information
    const documentInfo = await extractDocumentInfo(textorepresentantes);

    datosConsultados.additionalData.legalRepresentatives = documentInfo.extractedDocuments;

    console.log('Datos consultados:', datosConsultados, textorepresentantes);

    return datosConsultados;
  } catch (error) {
    console.error('Error en consultRues:', error);
    throw error;
  }
}

// Modify the document extraction logic to use OpenAI
async function extractDocumentInfo(texto) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            "Extrae los cargos si se encuentran en el texto, nombres, números y tipos de documentos del siguiente texto. Devuelva un JSON con una matriz de documentos, cada uno de los cuales contiene 'position', 'name', 'docNumber' y 'docType'."
        },
        {
          role: 'user',
          content: texto
        }
      ],
      response_format: { type: 'json_object' }
    });

    const extractedInfo = JSON.parse(response.choices[0].message.content);
    // console.log('extractedInfo:', extractedInfo);

    // Extract just the document numbers
    const reprecntant = extractedInfo.documents.map(doc => doc.docNumber);

    return {
      docRepresentantes: reprecntant,
      extractedDocuments: extractedInfo.documents,
      texto: texto
    };
  } catch (error) {
    console.error('Error extracting document info:', error);
    return {
      docRepresentantes: [],
      texto: texto
    };
  }
}

// Función principal de consulta
async function companyQuery(nit) {
  const page = await browserManager.createPage();

  try {
    return await consultRues(page, nit);
  } catch (error) {
    console.error('Error en consulta de empresa:', error);
    return { message: error.message };
  } finally {
    if (page && !page.isClosed()) await page.close();
  }
}

// Exportar funciones principales
module.exports = { documentQuery, companyQuery };
