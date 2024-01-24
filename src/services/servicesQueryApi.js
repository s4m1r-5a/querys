const axios = require('axios');
const moment = require('moment');

const checkUsuryRateCurrent = async ID_RM => {
  try {
    const api = axios.create({
      baseURL: `https://www.larepublica.co/api/master`
    });
    const {
      data: { bannerQuotes }
    } = await api.get('/');

    console.log(bannerQuotes, 'data checkUsuryRateCurrent');
    return bannerQuotes.find(e => e.name === 'TASA DE USURA CRÉDITO CONSUMO');
  } catch (error) {
    console.log(error.message, 'error en businessQuery');
    return { error: error.message };
  }
};

module.exports.checkUsuryRate = async (date = null) => {
  try {
    const month = moment(date).startOf('month').format('YYYY-MM-DD');

    const api = axios.create({
      baseURL: 'https://www.larepublica.co/api/quote/historic/21',
      params: { scale: 4, qName: 'TASA DE USURA CRÉDITO CONSUMO' }
    });

    const {
      data: { graphData }
    } = await api.get('/');

    const data = graphData.map(([date, val]) => ({
      annualRate: val,
      date: moment(date, 'DD MMM YY').format('YYYY-MM-DD')
    }));

    console.log(
      data,
      ' data checkUsuryRate ',
      data.find(e => e.date === month)
    );

    return data.find(e => e.date === month);
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

var t = {
  bannerQuotes: [
    {
      id: '1',
      url: 'https://www.larepublica.co/indicadores-economicos/mercado-cambiario/dolar',
      name: 'TRM',
      value: '$ 3.934,62',
      upDownClass: 'up',
      absVariation: '+$ 30,13',
      perVariation: '+0,77 %'
    },
    {
      id: 'MSCI COLCAP',
      url: 'https://www.larepublica.co/indicadores-economicos/movimiento-accionario/msci-colcap',
      name: 'MSCI COLCAP',
      value: '1.263,15',
      upDownClass: 'down',
      absVariation: '-7,95',
      perVariation: '-0,63 %'
    },
    {
      id: '55',
      url: 'https://www.larepublica.co/indicadores-economicos/commodities/petroleo',
      name: 'PETRÓLEO WTI',
      value: 'US$ 74,49',
      upDownClass: 'down',
      absVariation: '-US$ 0,52',
      perVariation: '-0,69 %'
    },
    {
      id: '26',
      url: 'https://www.larepublica.co/indicadores-economicos/commodities/cafe',
      name: 'CAFÉ COLOMBIAN MILDS',
      value: 'US$ 2,09',
      upDownClass: 'up',
      absVariation: 'US$ 0,04',
      perVariation: '+2,15 %'
    },
    {
      id: '46',
      url: 'https://www.larepublica.co/indicadores-economicos/commodities/oro-banco-de-la-republica',
      name: 'ORO COMPRA BANCO DE LA REPÚBLICA',
      value: '$ 241.087,18',
      upDownClass: 'down',
      absVariation: '-$ 1.566,13',
      perVariation: '-0,65 %'
    },
    {
      id: '21',
      url: 'https://www.larepublica.co/indicadores-economicos/bancos/tasa-de-usura',
      name: 'TASA DE USURA CRÉDITO CONSUMO',
      value: '34,98 %',
      upDownClass: 'down',
      absVariation: '-2,58 %',
      perVariation: '-6,87 %'
    },
    {
      id: '56',
      url: 'https://www.larepublica.co/indicadores-economicos/bancos/dtf',
      name: 'DTF',
      value: '11,59 %',
      upDownClass: 'down',
      absVariation: '-0,27 %',
      perVariation: '-2,28 %'
    },
    {
      id: '24',
      url: 'https://www.larepublica.co/indicadores-economicos/bancos/uvr',
      name: 'UVR',
      value: '$ 359,11',
      upDownClass: 'up',
      absVariation: '+$ 0,05',
      perVariation: '+0,01 %'
    }
  ],
  trends: [
    {
      id: 3786396,
      created: '2024-01-23T14:00:00-05:00',
      url: 'https://www.larepublica.co/finanzas/la-razon-por-la-que-bancolombia-comenzo-a-hacer-cobros-por-transferencias-a-nequi-3786396',
      header: 'Bancos ',
      className: 'finanzasSect',
      title:
        'La razón por la que Bancolombia comenzó a hacer cobros por transferencias a Nequi'
    },
    {
      id: 3786570,
      created: '2024-01-23T18:40:46-05:00',
      url: 'https://www.larepublica.co/economia/minhacienda-le-responde-a-minsalud-sobre-la-tributaria-3786570',
      header: 'Hacienda',
      className: 'economiaSect',
      title:
        '"Dejémoslo que divague", dijo el Minhacienda Bonilla sobre propuesta de Minsalud'
    },
    {
      id: 3786473,
      created: '2024-01-23T16:36:14-05:00',
      url: 'https://www.larepublica.co/finanzas/davivienda-corredores-presento-su-primer-fondo-de-capital-privado-por-1-4-billones-3786473',
      header: 'Bancos ',
      className: 'finanzasSect',
      title:
        'Davivienda Corredores presentó su primer Fondo de Capital Privado por $1,4 billones'
    },
    {
      id: 3786368,
      created: '2024-01-23T14:10:29-05:00',
      url: 'https://www.larepublica.co/empresas/implementacion-de-vehiculos-electricos-en-la-flota-de-taxis-libres-3786368',
      header: 'Transporte ',
      className: 'empresasSect',
      title:
        'Taxis Libres y Grupo Carrera anuncian implementación de vehículos eléctricos en flota'
    },
    {
      id: 3786758,
      created: '2024-01-23T19:47:19-05:00',
      url: 'https://www.larepublica.co/economia/alcaldia-de-bogota-controlo-seis-incendios-en-bogota-3786758',
      header: 'Ambiente',
      className: 'economiaSect',
      title:
        'Alcaldía de Bogotá confirmó que ya son 12 hectáreas afectadas por incendio forestal'
    },
    {
      id: 3786124,
      created: '2024-01-23T08:35:53-05:00',
      url: 'https://www.larepublica.co/finanzas/encuesta-de-opinion-financiera-de-fedesarrollo-en-enero-de-2024-3786124',
      header: 'Bolsas',
      className: 'finanzasSect',
      title:
        'Los analistas esperan un menor crecimiento económico y caídas en la tasa de interés'
    }
  ]
};
