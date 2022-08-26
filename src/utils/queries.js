const puppeteer = require('puppeteer');
//const doctype = require('../controllers/query.controller');
const webConsulPerson = async (page, cont = 0) => {
  const tipoDoc = '#ddlTipoID';
  const url = 'https://apps.procuraduria.gov.co/webcert/inicio.aspx?tpo=1';
  try {
    /* await Promise.all(
      await page.goto(
        'https://apps.procuraduria.gov.co/webcert/inicio.aspx?tpo=1'
      ),
      page.waitForNavigation()
    ); */

    await page.goto(url);
    await page.setViewport({ width: 1040, height: 682 });

    //await navigationPromise;

    await page.waitForSelector(tipoDoc, { visible: true });
    return true;
  } catch (error) {
    if (cont > 3) return false;
    console.log(error);
    cont++;
    await setTimeout(async () => await webConsulPerson(page), 3000);
  }
};
let browser;

(async () => {
  browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disabled-setupid-sandbox',
      '--disable-dev-shm-usage'
    ],
    headless: false,
    defaultViewport: null
  });
})();

const documentPerson = async (type, doc) => {
  /* type
  1 - Cedula de ciudadania
  2 - Permiso de permanencia
  3 - Nit (no parece funcionar)
  4 - Cedula de extranjeria
  5 - Pasaporte
  */
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
  //const slow3G = puppeteer.networkConditions['Slow 3G'];
  const tipoDoc = '#ddlTipoID';
  const cc = '#ddlTipoID > option:nth-child(2)';

  /* browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disabled-setupid-sandbox',
      '--disable-dev-shm-usage'
    ],
    headless: false,
    defaultViewport: null
  }); */
  console.log('hasta aqui vamos bien');
  //const pages = await browser.pages(); //.newPage();
  const page = await browser.newPage(); // await pages[0]; //
  await page.setDefaultNavigationTimeout(100000);

  console.log('hasta aqui vamos bien 2');
  const pg = await webConsulPerson(page);
  console.log('estado de la pagina ', pg);
  //await page.emulateNetworkConditions(slow3G);
  /* await page.goto('https://apps.procuraduria.gov.co/webcert/inicio.aspx?tpo=1');

  await page.setViewport({ width: 1040, height: 682 });

  await navigationPromise;
  await navigationPromise;
  await navigationPromise;

  await page.waitForSelector(tipoDoc); */

  await page.click(tipoDoc);
  await page.select(tipoDoc, type);
  await page.type('#txtNumID', doc);
  const Query = await page.$eval('#lblPregunta', e => e.innerText);
  let res = pregResp.filter(e => e.pre === Query);
  //console.log(Query, res[0]?.res);

  while (!res[0]?.res) {
    await page.click('#ImageButton1', { delay: 500 });
    await page.waitForSelector('#lblPregunta');
    const Query = await page.$eval('#lblPregunta', e => e.innerText);
    res = pregResp.filter(e => e.pre === Query);
    //console.log(Query, res[0]?.res, !!res[0]?.res);
  }
  await page.type('#txtRespuestaPregunta', res[0]?.res);
  await page.click('#btnConsultar');
  await page.waitForTimeout(3000);
  let Nombres = await page.$$eval('#divSec > div.datosConsultado > span', e =>
    e.map(r => r.innerText)
  );
  let info = await page.$eval('#ValidationSummary1', e => e.innerText);

  while (!Nombres.length && info === '\n\n') {
    await page.waitForSelector('#divSec > div > span', { visible: true });
    Nombres = await page.$$eval('#divSec > div.datosConsultado > span', e =>
      e.map(r => r.innerText)
    );
    info = await page.$eval('#ValidationSummary1', e => e.innerText);
  }
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
      std: true,
      data: {
        documentType: type,
        documentNumber: doc,
        fullName,
        firstName,
        lastName,
        arrayName: Nombres
      },
      Antecedentes
    };

    console.log(datos);
  } else datos = { std: false, msg: info };

  //await browser.close();
  await page.close();
  return datos;
};

module.exports.documentQuery = async (type, doc) => {
  try {
    return await documentPerson(type, doc);
  } catch (error) {
    //await browser.close();
    console.log(error);
    return await documentPerson(type, doc);
  }
};

module.exports.usuryRateQuery = async () => {
  //const slow3G = puppeteer.networkConditions['Slow 3G'];
  const Tex =
    '#vue-container > div.InternaIndicadores > div > div.flex-grow-1.wrapContentBody > div > div > div.grid-container > div > div > div.d-flex.CardDetailIndicator.multiple > div > div:nth-child(1) > div.priceIndicator > div > div.flex-grow-1 > span.price';
  browser = await puppeteer.launch({
    timeout: 1000000,
    args: ['--no-sandbox', '--disabled-setupid-sandbox']
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(1000000);
  //await page.emulateNetworkConditions(slow3G);
  await page.goto(
    'https://www.larepublica.co/indicadores-economicos/bancos/tasa-de-usura'
  );
  await page.waitForSelector(Tex);
  const tasa = await page.evaluate(Tex => {
    return parseFloat(
      document.querySelector(Tex).innerText.slice(0, -2).replace(/,/, '.')
    );
  }, Tex);
  console.log('Tasa:', tasa);

  await browser.close();
  return tasa / 100;
};

module.exports.companyQuery = async (nit, method = 2) => {
  browser = await puppeteer.launch({
    timeout: 1000000,
    args: ['--no-sandbox', '--disabled-setupid-sandbox'],
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();
  await page.setDefaultNavigationTimeout(1000000);
  //await page.emulateNetworkConditions(slow3G);

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

    await navigationPromise;

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
    await browser.close();

    console.log(datos);
    return datos;
  } else if (method === 2) {
    await page.goto('http://www.rues.org.co');

    await page.setViewport({ width: 1040, height: 682 });

    await navigationPromise;

    await page.waitForSelector('#txtNIT', { visible: true });
    await page.type('#txtNIT', nit);
    await page.click('#btnConsultaNIT');
    await page.waitForTimeout(4000);
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
    const matricula = await page.$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(1) > td:nth-child(2)',
      e => e.innerText
    );
    const estado = await page.$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(6) > td:nth-child(2)',
      e => e.innerText
    );
    const sociedad = await page.$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(7) > td:nth-child(2)',
      e => e.innerText
    );
    const organizacion = await page.$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(8) > td:nth-child(2)',
      e => e.innerText
    );
    const categoria = await page.$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(9) > td:nth-child(2)',
      e => e.innerText
    );
    const actualizado = await page.$eval(
      'body > div:nth-child(2) > main > div > div.container-fluid > div:nth-child(5) > div > div.col-md-8 > div > div.card-block > div > table > tbody > tr:nth-child(10) > td:nth-child(2)',
      e => e.innerText
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
      matricula,
      estado,
      sociedad,
      organizacion,
      categoria,
      actualizado,
      actividades,
      representante: reprecntant,
      docRepresentantes: reprecntant
    };

    console.log(reprecntant);
    await browser.close();
    await page.waitForTimeout(4000);
    console.log('pasaron 4 segundos');
    try {
      const representante = (await documentPerson('1', reprecntant[0])).data;
      representante && (datosConsultados.representante = representante);
    } catch (error) {
      console.log(error);
    }

    return datosConsultados;
  }
};
