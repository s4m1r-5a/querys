require('dotenv').config();
const puppeteer = require('puppeteer');
const { documentPerson } = require('./queries');
const { getPerson } = require('../repositories/persons.repository');
const moment = require('moment');
const OpenAI = require('openai');

// Constantes globales
const CONSTANTS = {
  NAVIGATION_TIMEOUT: 120000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 3000
};

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
        headless: false,
        defaultViewport: null,
        slowMo: 50
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

// Configure OpenAI (ensure to use environment variable for API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Make sure to set this environment variable
});

// Función auxiliar para verificar existencia de elementos
const existElement = async (page, selector) => {
  try {
    const element = await page.$(selector);
    if (!element) return false;
    const text = await page.evaluate(el => el.textContent, element);
    return text || true;
  } catch (error) {
    console.error('Error en existElement:', error);
    return false;
  }
};

// Función auxiliar para esperar
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Función auxiliar para formatear fechas
const formatDate = dateStr => {
  if (!dateStr) return null;
  try {
    return moment(dateStr, 'YYYY/MM/DD').format('YYYY-MM-DD');
  } catch (error) {
    console.error('Error formateando fecha:', dateStr, error);
    return dateStr;
  }
};

// Método 1: Consulta en einforma.co
async function consultEinforma(page, nit) {
  const datos = {
    name: '',
    city: '',
    matricula: '',
    estado: '',
    sociedad: '',
    organizacion: '',
    categoria: '',
    actualizado: '',
    actividades: '',
    representante: ''
  };

  try {
    await page.goto(
      `https://www.einforma.co/servlet/app/portal/ENTP/prod/LISTA_EMPRESAS/razonsocial/${nit}`,
      { waitUntil: 'networkidle0' }
    );

    await page.setViewport({ width: 1040, height: 682 });

    await page.waitForSelector('#imprimir > table > tbody > tr:nth-child(1)', {
      visible: true,
      timeout: 30000
    });

    await wait(3000);

    const table = await page.$$eval('#imprimir > table > tbody > tr', e =>
      e.map(t => t.innerText.split(/\t|\n/))
    );

    table.forEach(d => {
      switch (d[0]) {
        case 'Razón Social:':
          datos.name = d[1];
          break;
        case 'Forma Jurídica:':
          datos.sociedad = d[1];
          break;
        case 'Departamento:':
          datos.city = d[1];
          break;
        case 'Actividad CIIU:':
          datos.actividades = d[1];
          break;
        case 'Fecha Último Dato:':
          datos.actualizado = d[1];
          break;
        case 'Matrícula Mercantil:':
          datos.matricula = d[1];
          break;
        case 'Dirección Actual:':
          datos.address = d[1];
          break;
      }
    });

    datos.table = table;
    return datos;
  } catch (error) {
    console.error('Error en consultEinforma:', error);
    throw error;
  }
}

// Método 2: Consulta en rues.org.co
async function consultRues(page, nit) {
  try {
    // Navegar a la página
    await page.goto('https://www.rues.org.co', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Esperar a que la página cargue completamente
    await page.waitForFunction(() => document.readyState === 'complete', {
      timeout: 30000
    });

    // Verificar si el campo búsqueda está presente
    const searchInput = await page.$('#search');
    if (!searchInput) {
      console.log('Campo de búsqueda no encontrado, intentando recargar...');
      await page.reload({ waitUntil: 'networkidle0' });
      // await wait(5000);
    }

    // Esperar y escribir el NIT
    await page.waitForSelector('#search', {
      visible: true,
      timeout: 30000
    });
    await page.type('#search', nit);
    await wait(1000);

    // Intentar diferentes estrategias para el botón de búsqueda
    const searchButtonSelectors = [
      'button[type="submit"]',
      'button.btn-primary',
      'button.busqueda__button--xs',
      'button.btn-busqueda',
      'form button[type="submit"]'
    ];

    let buttonFound = false;
    for (const selector of searchButtonSelectors) {
      try {
        // Intentar hacer clic usando JavaScript
        await page.evaluate(selector => {
          const button = document.querySelector(selector);
          if (button) {
            button.click();
            return true;
          }
          return false;
        }, selector);

        // Esperar un momento para ver si la página cambia
        await wait(2000);

        // Verificar si la URL cambió o si hay resultados
        const hasChanged = await page.evaluate(() => {
          return (
            document.querySelector('.card-result') !== null ||
            document.querySelector('.no-results') !== null
          );
        });

        if (hasChanged) {
          buttonFound = true;
          break;
        }
      } catch (error) {
        console.log(`Error con selector ${selector}:`, error.message);
      }
    }

    if (!buttonFound) {
      // Si no se encuentra el botón, intentar enviar el formulario directamente
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          // Crear y disparar un evento submit
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
          });
          form.dispatchEvent(submitEvent);

          // Si el evento no funcionó, intentar submit() directamente
          if (!submitEvent.defaultPrevented) {
            form.submit();
          }
        }
      });

      await wait(2000);
    }
    // Esperar a que la página cambie y aparezcan los resultados
    await page.waitForFunction(
      () =>
        document.querySelector('.card-result') !== null ||
        document.querySelector('.no-results') !== null,
      { timeout: 30000 }
    );

    // Verificar si hay resultados
    const noResultsIni = await page.$('.no-results');
    if (noResultsIni) {
      console.log('No se encontraron resultados en la inicial');
      return null;
    }

    // Esperar y hacer clic en el primer resultado
    await page.waitForSelector('.card-result', {
      visible: true,
      timeout: 30000
    });

    // Encontrar y hacer clic en el enlace de detalles
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.card-result a'));
      const link = links.find(a => a.href && a.href.includes('buscar'));
      if (link) link.click();
      else throw new Error('No se encontró el enlace de detalles');
    });

    // Esperar a que la página cambie y aparezcan los resultados
    await page.waitForFunction(
      () =>
        document.querySelector('#detail-tabs-tabpane-pestana_general') !== null,
      { timeout: 30000 }
    );

    // Esperar a que cargue la página de detalles
    await page.waitForSelector('.registroapi', {
      visible: true,
      timeout: 30000
    });

    // Extraer información general
    const datosConsultados = await page.evaluate(() => {
      const datos = {
        name:
          document.querySelector('h1.intro__nombre')?.textContent?.trim() || ''
      };

      const pestanaGeneral = document.querySelector(
        '#detail-tabs-tabpane-pestana_general'
      );

      if (!pestanaGeneral) return;

      const registros = pestanaGeneral.querySelectorAll('.registroapi');
      registros.forEach(registro => {
        const etiqueta = registro
          .querySelector('.registroapi__etiqueta')
          ?.textContent?.trim();

        const valor = registro
          .querySelector('.registroapi__valor')
          ?.textContent?.trim();

        if (!etiqueta || !valor) return;

        switch (etiqueta) {
          case 'Identificación':
            const nitMatch = valor.match(/NIT (\d+)\s*-\s*(\d+)/);
            if (nitMatch) {
              datos.nit = nitMatch[1];
              datos.digitoVerificacion = nitMatch[2];
            }
            break;
          case 'Categoria de la Matrícula':
            datos.categoria = valor;
            break;
          case 'Tipo de Sociedad':
            datos.sociedad = valor;
            break;
          case 'Tipo Organización':
            datos.organizacion = valor;
            break;
          case 'Número de Matrícula':
            datos.matricula = valor;
            break;
          case 'Estado de la matrícula':
            datos.estado = valor;
            break;
          case 'Fecha de Actualización':
            datos.actualizado = valor; //formatDate(valor);
            break;
          case 'Cámara de Comercio':
            datos.city = valor;
            break;
          case 'Fecha de Matrícula':
            datos.date = valor; //formatDate(valor);
            break;
        }
      });
      return datos;
    });

    // Extraer actividades-economicas
    const actividades = await page.evaluate(() => {
      const pestanaEconomica = document.querySelector(
        '#detail-tabs-tabpane-pestana_economica'
      );
      if (!pestanaEconomica) return [];

      return Array.from(pestanaEconomica.querySelectorAll('.registroapi'))
        .map(reg => {
          const codigo = reg
            .querySelector('.registroapi__etiqueta')
            ?.textContent?.trim();
          const descripcion = reg
            .querySelector('.registroapi__valor')
            ?.textContent?.trim();
          if (!codigo || !descripcion) return null;
          return `${codigo} - ${descripcion}`;
        })
        .filter(Boolean);
    });

    datosConsultados.actividades = actividades;

    let texto2 = '';

    // Extract information of representatives
    const textorepresentantes = await page.evaluate(() => {
      const legalDiv = document.querySelector(
        '#detail-tabs-tabpane-pestana_representante .legal'
      );

      texto2 = legalDiv;

      if (!legalDiv) return '';

      return legalDiv.textContent;
    });

    console.log('Datos consultados1:', { textorepresentantes, texto2 });

    if (!textorepresentantes) return datosConsultados;

    // Use OpenAI to extract document information
    const documentInfo = await extractDocumentInfo(textorepresentantes);

    datosConsultados.docRepresentantes = documentInfo.docRepresentantes;
    datosConsultados.texto = documentInfo.texto;
    datosConsultados.extractedDocuments = documentInfo.extractedDocuments;

    console.log('Datos consultados:', datosConsultados, textorepresentantes);

    // Consultar información de representantes
    try {
      datosConsultados.representantes = [];
      for (const docNumber of documentInfo.docRepresentantes) {
        let person = await getPerson('CC', docNumber);

        if (person) {
          person = person.dataValues;
        } else {
          try {
            person = await documentPerson('CC', docNumber);
          } catch (error) {
            console.error('Error consultando documentPerson:', error);
          }
        }

        if (person) {
          datosConsultados.representantes.push(person);
        }
      }
    } catch (error) {
      console.log('Error consultando representantes:', error);
    }

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
async function companyQuery(nit, method = 1) {
  const page = await browserManager.createPage();

  try {
    let result;

    if (method === 1) {
      result = await consultEinforma(page, nit);
    } else if (method === 2) {
      result = await consultRues(page, nit);
    } else {
      throw new Error('Método de consulta no válido');
    }

    return {
      success: true,
      ...result,
      nit
    };
  } catch (error) {
    console.error('Error en consulta de empresa:', error);
    return {
      success: false,
      message: error.message,
      nit
    };
  } finally {
    if (page && !page.isClosed()) {
      await page.close();
    }
  }
}

// Exportar funciones principales
module.exports = {
  companyQuery
};
