require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const cheerio = require('cheerio');

// puppeteer.use(StealthPlugin());
// puppeteer.use(
//   RecaptchaPlugin({
//     provider: { id: '2captcha', token: process.env.API_2CAPTCHA_KEY }, // Clave API de 2Captcha
//     visualFeedback: true, // Muestra el proceso de resolución en la consola
//     debug: true
//   })
// );

// Constantes globales
const CONSTANTS = {
  NAVIGATION_TIMEOUT: 120000, // Aumentado a 2 minutos
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

    // Cargar cookies previamente guardadas
    await parseCookiesFile(page);

    // Configuración adicional
    // await page.setUserAgent(
    //   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    // );
    await page.setViewport({ width: 1280, height: 800 });
    // await page.setViewport({ width: 1040, height: 682 });
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
      'https://muisca.dian.gov.co/WebRutMuisca/DefConsultaEstadoRUT.faces',
      { waitUntil: 'networkidle2' }
    );

    await page.waitForTimeout(5000); // Espera adicional de 5 segundos

    // Esperar por el estado de carga del DOM
    await page.waitForFunction(() => document.readyState === 'complete', {
      timeout: 30000
    });

    await page.mouse.move(100, 100);

    const captchaElement = await page.$('#g-recaptcha');
    if (!captchaElement) console.log('CAPTCHA no detectado.');
    else console.log('CAPTCHA detectado.');

    // Detecta y resuelve automáticamente CAPTCHAs
    const { captchas, solved, error } = await page.solveRecaptchas();

    if (error) {
      console.error('Error al resolver CAPTCHA:', error);
    } else {
      console.log(
        `Se resolvieron ${solved.length} CAPTCHAs de ${captchas.length}`
      );
    }

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

function selector(item) {
  return `#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:${item}`;
}

// Función para consultar RUT en la página de la DIAN
async function consultRutDian(nit) {
  let originalPage = null;
  let currentPage = null;
  try {
    originalPage = await initWebConsult();
    currentPage = originalPage;

    console.log('Buscando el Buscador...');

    // Intentar encontrar el elemento
    try {
      await currentPage.waitForFunction(
        () =>
          document.getElementById(
            'vistaConsultaEstadoRUT:formConsultaEstadoRUT:numNit'
          ) !== null,
        { timeout: 10000 }
      );
      console.log('Elemento encontrado en el DOM');
    } catch (e) {
      console.error('Error al esperar el elemento:', e);
      const html = await currentPage.content();
      console.log('HTML de la página:', html);
      throw new Error('No se pudo encontrar el elemento ddlTipoID');
    }

    await currentPage.type(selector('numNit'), nit);
    await currentPage.keyboard.press('Enter');

    // Esperar por el estado de carga del DOM
    await currentPage.waitForFunction(
      () => document.readyState === 'complete',
      {
        timeout: 30000
      }
    );

    await currentPage.waitForSelector(selector('estado'));

    // Extraer el HTML de la página
    const pageContent = await currentPage.content();

    // Usar la función de extracción de datos anterior
    const rutData = await extractRutData(pageContent);

    await page.evaluate(() => limpiar());

    // Esperar por el estado de carga del DOM
    await currentPage.waitForFunction(
      () => document.readyState === 'complete',
      {
        timeout: 30000
      }
    );

    console.log('Busqueda exitosa', rutData);

    // Guardar cookies después de una sesión exitosa
    const newCookies = await currentPage.cookies();
    await fs.writeFile('cookies.json', JSON.stringify(newCookies));

    return {
      success: true,
      data: rutData
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

// Función para extraer información de RUT
async function extractRutData(htmlContent) {
  try {
    // Use cheerio to parse the HTML
    const $ = cheerio.load(htmlContent);

    // Objeto para almacenar los datos
    const rutData = {
      id: null, // Se dejará null, se puede asignar posteriormente si es necesario
      personType: null,
      docType: null, // Se determinará dinámicamente
      docNumber: null,
      verifyDigit: null,
      fullName: null,
      state: null, // Nuevo campo para el estado
      date: null, // Nuevo campo para la fecha
      additionalData: {
        lastName: null,
        arrayName: [],
        firstName: null,
        criminalRecord: 'El ciudadano no presenta antecedentes' // Valor por defecto
      },
      status: null
    };

    // Extraer NIT/Documento y Dígito de Verificación
    const nitElement = $(
      '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:numNit'
    );
    const dvElement = $('#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:dv');

    rutData.docNumber = nitElement.val() || nitElement.text().trim();
    rutData.verifyDigit = dvElement.text().trim();

    // Verificar si es una persona natural o jurídica
    const razonSocialElement = $(
      '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:razonSocial'
    );
    const primerNombreElement = $(
      '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:primerNombre'
    );

    if (razonSocialElement.length) {
      // Es una persona jurídica
      rutData.personType = 'JURIDICA';
      rutData.fullName = razonSocialElement.text().trim();
      rutData.docType = 'NIT'; // Documento de persona jurídica
    } else if (primerNombreElement.length) {
      // Es una persona natural
      rutData.personType = 'NATURAL';
      rutData.docType = 'CC'; // Cédula de Ciudadanía por defecto

      // Extraer nombres y apellidos
      const nombres = {
        primerNombre: $(
          '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:primerNombre'
        )
          .text()
          .trim(),
        otrosNombres: $(
          '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:otrosNombres'
        )
          .text()
          .trim(),
        primerApellido: $(
          '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:primerApellido'
        )
          .text()
          .trim(),
        segundoApellido: $(
          '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:segundoApellido'
        )
          .text()
          .trim()
      };

      // Construir nombre completo y array de nombres
      rutData.additionalData.arrayName = [
        nombres.primerNombre,
        nombres.otrosNombres,
        nombres.primerApellido,
        nombres.segundoApellido
      ].filter(Boolean);

      rutData.fullName = rutData.additionalData.arrayName.join(' ');
      rutData.additionalData.firstName = [
        nombres.primerNombre,
        nombres.otrosNombres
      ]
        .filter(Boolean)
        .join(' ');
      rutData.additionalData.lastName = [
        nombres.primerApellido,
        nombres.segundoApellido
      ]
        .filter(Boolean)
        .join(' ');
    }

    // Extraer Estado
    const estadoElement = $(
      '#vistaConsultaEstadoRUT\\:formConsultaEstadoRUT\\:estado'
    );
    if (estadoElement.length) {
      rutData.state = estadoElement.text().trim();
    }

    // Extraer Fecha Actual
    const currentDateElement = $('td.tipoFilaNormalVerde').filter(
      (i, el) =>
        $(el).prev('td.fondoTituloLeftAjustado').text().trim() ===
        'Fecha Actual'
    );
    rutData.date = currentDateElement.text().trim();
    rutData.status = currentDateElement.text().trim(); // Mantenemos status por compatibilidad

    // Extraer información adicional
    const additionalInfoElements = $('table.formulario_muisca tr');
    additionalInfoElements.each((i, row) => {
      const labelCell = $(row).find('td.fondoTituloLeftAjustado');
      const valueCell = $(row).find('td.tipoFilaNormalVerde');

      if (labelCell.length && valueCell.length) {
        const label = labelCell.text().trim();
        const value = valueCell.text().trim();

        switch (label) {
          case 'Dirección':
            rutData.additionalData.address = value;
            break;
          case 'Teléfono':
            rutData.additionalData.phone = value;
            break;
          case 'Correo Electrónico':
            rutData.additionalData.email = value;
            break;
        }
      }
    });

    return rutData;
  } catch (error) {
    console.error('Error extracting RUT data:', error);
    return null;
  }
}

async function ensureDirectoryExists(filePath) {
  const directory = path.dirname(filePath);
  try {
    await fs.access(directory);
  } catch {
    await fs.mkdir(directory, { recursive: true });
  }
}

// Función para extraer información de Cookies desde un archivo
async function parseCookiesFile(page, filePath = 'cookies.json') {
  try {
    // Cargar cookies previamente guardadas
    const cookiesText = await fs.readFile(filePath, 'utf-8');
    const cookiesData = JSON.parse(cookiesText);

    if (cookiesData.cookies && Array.isArray(cookiesData.cookies)) {
      await page.setCookie(...cookiesData.cookies);
    }

    return page;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Si el archivo no existe, crea uno vacío
      await ensureDirectoryExists(filePath);
      const emptyCookies = JSON.stringify({ cookies: [] }, null, 2);
      await fs.writeFile(filePath, emptyCookies);
      return page;
    }
    console.error('Error reading cookies file:', error);
    throw error; // Re-lanza otros tipos de errores
  }
}

// Exportar funciones principales
module.exports = {
  async consultRutDian(nit) {
    try {
      return await consultRutDian(nit);
    } catch (error) {
      console.error('Error in RUT query:', error);
      return { success: false, message: error.message };
    }
  },

  // Método para cerrar el browser cuando sea necesario
  async closeBrowser() {
    await browserManager.closeBrowser();
  }
};
