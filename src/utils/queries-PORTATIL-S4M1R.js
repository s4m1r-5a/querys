const puppeteer = require('puppeteer');
const { getPerson } = require('../repositories/persons.repository');
//const doctype = require('../controllers/query.controller');
let browser;
(async () => {
  browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disabled-setupid-sandbox',
      '--disable-dev-shm-usage'
    ],
    headless: false, //'new',  // false, - Ejecutar el navegador en modo no headless (visible)
    //slowMo: 500,
    defaultViewport: null
  });
})();

const tpe = new Map();
/* type
  1 - Cedula de ciudadania
  2 - Permiso de permanencia
  3 - Nit (no parece funcionar)
  4 - Cedula de extranjeria
  5 - Pasaporte
  */
tpe.set('1', 'CC');
tpe.set('4', 'CE');
tpe.set('5', 'PEP');

const webConsulPerson = async (cont = 0) => {
  const tipoDoc = '#ddlTipoID';
  const url = 'https://apps.procuraduria.gov.co/webcert/inicio.aspx?tpo=1';
  
  const page = await browser.newPage(); 
  await page.setDefaultNavigationTimeout(100000);
  try {
    await page.goto(url);
    await page.setViewport({ width: 1040, height: 682 });

    await page.waitForSelector(tipoDoc, { visible: true });
    return page;
  } catch (error) {
    if (cont > 3) return false;
    console.log(error, ' Este es el error del intento numero: ', cont);
    cont++;
    await page.close();
    await setTimeout(async () => await webConsulPerson(cont), 3000);
  }
};

const documentPerson = async (type, doc) => {
  
  const pregResp = [
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
      pre: '¿Escriba los dos ultimos digitos del documento a consultar?',
      res: doc.slice(-2)
    },
    {
      pre: '¿Escriba los tres primeros digitos del documento a consultar?',
      res: doc.slice(0, 3)
    }
  ];

  const tipoDoc = '#ddlTipoID';
  const cc = '#ddlTipoID > option:nth-child(2)';

  const page = await webConsulPerson();
  if (!page) return { std: false };

  await page.click(tipoDoc);
  await page.select(tipoDoc, type);
  await page.type('#txtNumID', doc);
  
  let info;
  let ciclo = false;

  while (!ciclo) {
    await page.waitForSelector('#lblPregunta');
    const Query = await page.$eval('#lblPregunta', e => e.innerText);
    const res = pregResp.find(e => e.pre === Query) || false;

    if (res) {
      await page.type('#txtRespuestaPregunta', res?.res);
      await page.click('#btnConsultar');
      await page.waitForTimeout(2000);
      info = await page.$eval('#ValidationSummary1', e => e.innerText);
      ciclo =
        res &&
        !/Falla la validación del CAPTCHA.|El valor ingresado para la respuesta no responde a la pregunta./.test(
          info.trim()
        );

      if (!ciclo) {
        await page.close();
        return await documentPerson(type, doc);
      }
    }

    if (!ciclo) await page.click('#ImageButton1', { delay: 1000 });
  }

  const Nombres = await page.$$eval('#divSec > div.datosConsultado > span', e =>
    e.map(r => r.innerText)
  );
  console.log(info.trim(), info === '\n\n', info === '\n\n\t', Nombres, ciclo);

  let datos;
  if (Nombres.length) {
    const tex = '#divSec > div.SeccionAnt h2';

    const Antcdnts = await page.evaluate(tex => {
      const select = document.querySelector(tex);
      return select ? select.innerText : null;
    }, tex);

    if (Antcdnts) {
      const listSiri = await page.$$eval(
        '#divSec > div.SeccionAnt > div.SessionNumSiri > h2, h3, tr',
        e =>
          e.map(t =>
            /th|td/.test(t.innerHTML) ? t.innerText.split(/\t|\n/) : t.innerText
          )
      );

      if (listSiri.length) {
        listSiri.splice(0, 0, Antcdnts);
        Antecedentes = listSiri;
      } else {
        Antecedentes = await page.$$eval(
          '#divSec > div.SeccionAnt > table > tbody > tr',
          e => e.map(r => r.innerText.split('\t'))
        );
        Antecedentes.splice(0, 0, Antcdnts);
      }
    } else {
      Antecedentes = await page.$eval(
        '#divSec > h2:nth-child(3)',
        e => e.innerText
      );
    }

    const fullName = JSON.stringify(Nombres)
      .replace(/[^a-zA-Z]+/g, ' ')
      .trim();

    const firstName = JSON.stringify(Nombres.slice(0, 2))
      .replace(/[^a-zA-Z]+/g, ' ')
      .trim();

    const lastName = JSON.stringify(Nombres.slice(2))
      .replace(/[^a-zA-Z]+/g, ' ')
      .trim();

    datos = {
      docType: tpe.get(type),
      docNumber: doc,
      fullName,
      firstName,
      lastName,
      arrayName: Nombres,
      Antecedentes
    };

    console.log(datos);
  } else datos = { std: false, msg: info };

  await page.close();
  return datos;
};

module.exports.documentQuery = async (type, doc) => {
  try {
    return await documentPerson(type, doc);
  } catch (error) {    
    console.log(error, ' Este es el error de la funcion en total');
    return { std: false };
  }
};

module.exports.usuryRateQuery = async () => {
  const Tex =
    '#vue-container > div.InternaIndicadores > div > div.flex-grow-1.wrapContentBody > div > div > div.grid-container > div > div > div.d-flex.CardDetailIndicator.multiple > div > div:nth-child(1) > div.priceIndicator > div > div.flex-grow-1 > span.price';
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(1000000);
  
  await page.goto(
    'https://www.larepublica.co/indicadores-economicos/bancos/tasa-de-usura'
  );
  // Esperar a que el selector esté disponible
  await page.waitForSelector(Tex);

  const butonYear =
    '#vue-container > div.InternaIndicadores > div > div.flex-grow-1.wrapContentBody > div > div > div.grid-container > div > div > div.d-flex.CardDetailIndicator.multiple > div > div:nth-child(1) > div.quote-graph-bar > div.graph-buttons > button:nth-child(4)';
  await page.locator(butonYear).click();
  //await page.click(butonYear);
  const tasa = await page.evaluate(Tex => {
    return parseFloat(
      document.querySelector(Tex).innerText.slice(0, -2).replace(/,/, '.')
    );
  }, Tex);
  console.log('Tasa:', tasa);

  await page.close();
  return tasa / 100;
};

module.exports.companyQuery = async (nit, method = 2) => {
  const page = await browser.newPage();
  //const navigationPromise = page.waitForNavigation();
  await page.setDefaultNavigationTimeout(1000000);
  //await page.emulateNetworkConditions(slow3G);

  const existElement = async selector => {
    const text = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent;
      }

      return false;
    });
    console.log(text);
    return text;
  };

  if (method === 1) {
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
    await page.goto(
      `https://www.einforma.co/servlet/app/portal/ENTP/prod/LISTA_EMPRESAS/razonsocial/${nit}`
    );

    await page.setViewport({ width: 1040, height: 682 });

    //await navigationPromise;

    await page.waitForSelector('#imprimir > table > tbody > tr:nth-child(1)', {
      visible: true
    });
    await page.waitForTimeout(3000);

    const table = await page.$$eval('#imprimir > table > tbody > tr', e =>
      e.map(t => t.innerText.split(/\t|\n/))
    );
    table.map(d => {
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
    await page.close();

    console.log(datos);
    return datos;
  } else if (method === 2) {
    await page.goto('http://www.rues.org.co');

    await page.setViewport({ width: 1040, height: 682 });

    //await navigationPromise;

    await page.waitForSelector('#txtNIT', { visible: true });
    await page.type('#txtNIT', nit);
    await page.click('#btnConsultaNIT');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#rmTable2', { visible: true });
    let name = await page.$eval(
      '#rmTable2 > tbody > tr > td:nth-child(2)',
      e => e.innerText
    );

    /* while (!!name === false) {
    await page.waitForSelector('#rmTable2', { visible: true });
    name = await page.$eval(
      '#rmTable2 > tbody > tr > td:nth-child(2)',
      e => e.innerText
    );
  } */
    const city = await page.$eval(
      '#rmTable2 > tbody > tr > td:nth-child(4)',
      e => e.innerText
    );
    await page.click('#rmTable2 > tbody > tr > td:nth-child(1)');
    await page.click(
      '#rmTable2 > tbody > tr.child > td > ul > li > span.dtr-data > a'
    );
    await page.waitForSelector(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(1) > td:nth-child(2)'
    );
    await page.waitForTimeout(1500);
    let cardtexto = await existElement('#card-info');
    console.log(cardtexto);
    if (cardtexto) {
      await page.click('#card-info > input[type=submit]');
      await page.waitForSelector(
        'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(1) > td:nth-child(2)'
      );
      while (cardtexto) {
        cardtexto = await existElement('#card-info');
        if (cardtexto) await page.click('#card-info > input[type=submit]');
      }
    }

    arrayData = await page.$$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr',
      e => e.map(r => r.innerText.split('\t'))
    );

    const actividades = await page.$$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-4 > div:nth-child(3) > div.card-body > ul > li',
      e => e.map(r => r.innerText)
    );
    await page.click('#Facultades');
    await page.waitForSelector('#txtFacultades', { visible: true });
    let texto = await page.$eval('#txtFacultades', e => e.innerText);
    console.log(texto);
    while (texto === 'Consultando....') {
      await page.waitForSelector('#txtFacultades', { visible: true });
      texto = await page.$eval('#txtFacultades', e => e.innerText);
    }
    const reprecntant = texto
      .replace(/\./g, '')
      .split(/[^0-9]/)
      .filter(e => /[0-9]{7,}/.test(e));
    /* texto
      .split('\n')
      .find(e => /REPRESENTANTE LEGAL/.test(e))
      .replace(/[^0-9]/g, '')
      : texto.includes('REPRESENTANTE LEGAL') */

    const datosConsultados = {
      name,
      city,
      actividades,
      docRepresentantes: reprecntant,
      texto
    };
    arrayData.map((e, i) => {
      e[0] === 'Numero de Matricula' && (datosConsultados.matricula = e[1]);
      e[0] === 'Fecha de Matricula' && (datosConsultados.date = e[1]);
      e[0] === 'Estado de la matricula' && (datosConsultados.estado = e[1]);
      e[0] === 'Tipo de Sociedad' && (datosConsultados.sociedad = e[1]);
      e[0] === 'Tipo de Organización' && (datosConsultados.organizacion = e[1]);
      e[0] === 'Categoria de la Matricula' &&
        (datosConsultados.categoria = e[1]);
      e[0] === 'Fecha Ultima Actualización' &&
        (datosConsultados.actualizado = e[1]);
    });

    await page.close();
    await page.waitForTimeout(2000);
    console.log(reprecntant);
    try {
      for (var i = 0; i < reprecntant.length; i++) {
        const person =
          (await getPerson('CC', `${parseFloat(reprecntant[i])}`))
            ?.dataValues || false;

        if (person && !i) datosConsultados.representantes = [person];
        else if (person) datosConsultados.representantes.push(person);
        else {
          const represent = await documentPerson(
            '1',
            `${parseFloat(reprecntant[i])}`
          );

          if (represent && !i) datosConsultados.representantes = [represent];
          else if (represent) datosConsultados.representantes.push(represent);
        }
      }
    } catch (error) {
      console.log(error);
    }

    console.log(datosConsultados);
    return datosConsultados;
  }
};

/* fetch('https://ruesapi.rues.org.co/api/ConsultaExpediente?ID_RM=90047174112', {
  headers: {
    accept: 'application/json, text/plain, ',
    'accept-language': 'es-ES,es;q=0.9',
    authorization:
      'Bearer j0cyS5vrl9VbKA2VDEeXtyjYfbDwrf26-4fVOZspU13X5ZnomZpu3JdFCXfXSAHDPhKLBWAtyxT4SuyCXqcaEwo_s-EI6uVPdPh01pWS7zUB6SfaCPEsYNDDlijN8TU4Gf5kh6gpf1rI2FMz-WR9vfN4XQOkdyH9TGwJOrYNgOSocAOdQL9H0b_d6inNmqCByuL-lZabz1O4LCxiRvxPoDHTSfamBFmycn9AygaHnPamEYdHqwKHcCKEXPgNY-MzlbO_raGkKBZg35x20UgVlVK6b1KafU6OsMCM-8Bq_Qkw5OanWvToZrd2J7pA7zG4Geg17foCehDtBgttnvoBBryvM54xtFdgugiDemQt8tf1N7KMq7bmHASS_ZZUGtPANIzaGwN-rMa6pqyGl0kGC7NZTfwP14HqV_IjJBdzoHjj4QckbtX9-g7aZze9RIEGMa_shuLHyUwZ1xwRFuRy74Y3--ezG1-RWND-mt5p95kv1eUCRh3eZtXCTPIlsbCoCIS3oi6Zx4Hld-ZgmHFpyY098FasZhvvV28IJHI0YhbIeoXRayA1aPMw-nHXf1-T',
    'sec-ch-ua':
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    Referer: 'https://ruesfront.rues.org.co/',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },
  body: null,
  method: 'POST'
}); */
