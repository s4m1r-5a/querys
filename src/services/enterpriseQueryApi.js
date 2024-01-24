const axios = require('axios');

const consultCompanyRepresentatives = async (camara, matricula) => {
  try {
    const api = axios.create({
      baseURL: `https://ruesapi.rues.org.co/api/ConsultFacultadesXCamYMatricula`,
      params: { codigo_camara: camara, matricula },
      headers: {
        Authorization:
          'Bearer j0cyS5vrl9VbKA2VDEeXtyjYfbDwrf26-4fVOZspU13X5ZnomZpu3JdFCXfXSAHDPhKLBWAtyxT4SuyCXqcaEwo_s-EI6uVPdPh01pWS7zUB6SfaCPEsYNDDlijN8TU4Gf5kh6gpf1rI2FMz-WR9vfN4XQOkdyH9TGwJOrYNgOSocAOdQL9H0b_d6inNmqCByuL-lZabz1O4LCxiRvxPoDHTSfamBFmycn9AygaHnPamEYdHqwKHcCKEXPgNY-MzlbO_raGkKBZg35x20UgVlVK6b1KafU6OsMCM-8Bq_Qkw5OanWvToZrd2J7pA7zG4Geg17foCehDtBgttnvoBBryvM54xtFdgugiDemQt8tf1N7KMq7bmHASS_ZZUGtPANIzaGwN-rMa6pqyGl0kGC7NZTfwP14HqV_IjJBdzoHjj4QckbtX9-g7aZze9RIEGMa_shuLHyUwZ1xwRFuRy74Y3--ezG1-RWND-mt5p95kv1eUCRh3eZtXCTPIlsbCoCIS3oi6Zx4Hld-ZgmHFpyY098FasZhvvV28IJHI0YhbIeoXRayA1aPMw-nHXf1-T'
      }
    });
    const { data } = await api.post('/');
    // console.log(data, 'data consultCompanyRepresentatives');
    const reprecntantes = data
      .replace(/\./g, '')
      .split(/[^0-9]/)
      .filter(e => /[0-9]{7,}/.test(e));

    return { reprecntantes };
  } catch (error) {
    console.log(error.message, 'error en businessQuery');
    return { error: error.message };
  }
};

const consultCompanyData = async ID_RM => {
  try {
    const api = axios.create({
      baseURL: `https://ruesapi.rues.org.co/api/ConsultaExpediente`,
      params: { ID_RM },
      headers: {
        Authorization:
          'Bearer j0cyS5vrl9VbKA2VDEeXtyjYfbDwrf26-4fVOZspU13X5ZnomZpu3JdFCXfXSAHDPhKLBWAtyxT4SuyCXqcaEwo_s-EI6uVPdPh01pWS7zUB6SfaCPEsYNDDlijN8TU4Gf5kh6gpf1rI2FMz-WR9vfN4XQOkdyH9TGwJOrYNgOSocAOdQL9H0b_d6inNmqCByuL-lZabz1O4LCxiRvxPoDHTSfamBFmycn9AygaHnPamEYdHqwKHcCKEXPgNY-MzlbO_raGkKBZg35x20UgVlVK6b1KafU6OsMCM-8Bq_Qkw5OanWvToZrd2J7pA7zG4Geg17foCehDtBgttnvoBBryvM54xtFdgugiDemQt8tf1N7KMq7bmHASS_ZZUGtPANIzaGwN-rMa6pqyGl0kGC7NZTfwP14HqV_IjJBdzoHjj4QckbtX9-g7aZze9RIEGMa_shuLHyUwZ1xwRFuRy74Y3--ezG1-RWND-mt5p95kv1eUCRh3eZtXCTPIlsbCoCIS3oi6Zx4Hld-ZgmHFpyY098FasZhvvV28IJHI0YhbIeoXRayA1aPMw-nHXf1-T'
      }
    });
    const { data } = await api.post('/');
    // console.log(data, 'data consultCompanyData');
    return data;
  } catch (error) {
    console.log(error.message, 'error en businessQuery');
    return { error: error.message };
  }
};

module.exports.businessQuery = async nit => {
  console.log(nit, 'nit');
  try {
    const api = axios.create({
      baseURL: 'https://elasticprd.rues.org.co/query',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = JSON.stringify({
      term: nit,
      offset: '0',
      type: 2,
      filter: {
        Category: ['agencia', 'natural', 'juridica', 'sucursal', 'comercio'],
        Status: ['Activa'],
        advanced: false,
        tipoRegistro: 'RM'
      },
      recaptchaToken: {
        __zone_symbol__state: true
      }
    });
    const {
      data: {
        hits: [{ _source: query }]
      }
    } = await api.post('/', data);

    if (query?.id) {
      const { id, codigo_camara, matricula } = query;
      const companyData = await consultCompanyData(id);
      const reprecntantes = await consultCompanyRepresentatives(
        codigo_camara,
        matricula
      );
      //   console.log({ ...query, ...companyData, ...reprecntantes }, 'query');
      return { ...query, ...companyData, ...reprecntantes };
    }

    return query;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};
