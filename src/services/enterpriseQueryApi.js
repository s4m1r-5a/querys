const axios = require('axios');
const cheerio = require('cheerio');
const { documentQuery } = require('../utils/queries');
let token = '';

dataDefaultEinforma = {
  ici: false,
  nit: false,
  razón_social: 'fullName',
  forma_jurídica: 'legalOrganization',
  departamento: 'state',
  dirección_actual: 'address',
  teléfono: 'phone',
  email: 'email',
  actividad_ciiu: 'activity',
  fecha_constitución: 'foundationDate',
  matrícula_mercantil: false, //'tradeLicense',
  información_financiera: false,
  fecha_del_último_balance: 'lastBalanceDate',
  último_balance_disponible: 'lastBalanceAvailable',
  fecha_último_dato: 'lastUpdateDate',
  fecha_actualización_cámara_comercio: 'tradeUpdateDate'
};

const fncVals = (prop, value) => {
  const obj = {
    personType: value === 'PERSONA NATURAL' ? 'NATURAL' : 'JURIDICA'
  };

  return obj[prop] ?? value;
};

const transformBusinessQueryData = (data, dataEinforma) => {
  // Si no hay registros o hay un error, devolver null
  if (!data.registros || data.registros.length === 0) {
    if (dataEinforma) return { additionalData: dataEinforma };
    return {};
  }

  // Tomar el primer registro
  // const registro = data.registros[0];
  const {
    registros: [registro],
    ...rest
  } = data;

  // Mapear los datos al nuevo formato
  const transformedData = {
    personType:
      registro.categoria === 'PERSONA NATURAL' ? 'NATURAL' : 'JURIDICA',
    docType: registro.tipo_documento === 'C.C.' ? 'CC' : 'NIT',
    docNumber: registro.nit,
    verifyDigit: registro.dv,
    fullName: registro.razon_social,
    status: registro.estado_matricula,
    date: `${rest.fecha_respuesta} ${rest.hora_respuesta}`,
    additionalData: {
      ...dataEinforma,
      id_rm: registro.id_rm,
      city: registro.nom_camara,
      category: registro.categoria,
      codLicense: registro.cod_camara,
      tradeLicense: registro.matricula,
      licenseStatus: registro.estado_matricula,
      lastRenewedYear: registro.ultimo_ano_renovado,
      legalOrganization: registro.organizacion_juridica
    }
  };

  // Incluir los datos restantes
  if (registro?.categoria === 'PERSONA NATURAL') {
    transformedData.additionalData = {
      // Campos derivados del nombre
      arrayName: registro.razon_social.split(' '),
      lastName: registro.razon_social.split(' ').slice(-2).join(' '),
      firstName: registro.razon_social.split(' ').slice(0, -2).join(' '),
      criminalRecord: 'No se encontró información',
      ...transformedData.additionalData
    };
  }

  return transformedData;
};

const consultCompanyData = async nit => {
  try {
    if (!token) {
      const { headers } = await axios.post(
        'https://ruesapi.rues.org.co/WEB2/api/Token/ObtenerToken'
      );
      token = headers.tokenruesapi;
    }

    const api = axios.create({
      maxBodyLength: Infinity,
      baseURL: `https://ruesapi.rues.org.co/api/ConsultasRUES/BusquedaAvanzadaRM`,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    const { data } = await api.post('/', {
      Razon: null,
      Nit: nit,
      Dpto: null,
      Cod_Camara: null,
      Matricula: null
    });
    console.log(data, 'data consultCompanyData');

    return data;
  } catch (error) {
    console.log(error.message, 'error en businessQuery');
    token = '';
    return { error: error.message };
  }
};

const consultEinforma = async nit => {
  try {
    const { data } = await axios.get(
      `https://www.einforma.co/servlet/app/portal/ENTP/prod/LISTA_EMPRESAS/razonsocial/${nit}`
    );

    // Use cheerio to parse the HTML
    const $ = cheerio.load(data);

    // Find the table element
    const table = $('#imprimir > table');

    // Extract the table data
    const tableData = {};
    table.find('tr').each((_, row) => {
      const cell = $(row).find('td:first-child'); // Primera celda de la fila
      const label = cell.text().trim().replace(/\s+/g, '_').slice(0, -1); // Extrae texto, eliminando el último carácter (:)
      if (label === 'Último_Balance_disponible' || cell.attr('colspan')) return; // Omite esta etiqueta específica
      const prop = dataDefaultEinforma[label.toLowerCase()];
      if (prop) tableData[prop] = fncVals(prop, cell.next().text().trim());
    });

    console.log(tableData, 'tableData consultEinforma');

    return tableData;
  } catch (error) {
    console.log(error.message, 'error en consultEinforma');
    return { error: error.message };
  }
};

module.exports.businessQuery = async (type, doc) => {
  try {
    const dataEinforma = await consultEinforma(doc);
    const companyData = await consultCompanyData(doc);

    // Transformar los datos al nuevo formato
    let transformedData = transformBusinessQueryData(companyData, dataEinforma);

    if (!transformedData?.docNumber) {
      const additionalData = transformedData?.additionalData;
      transformedData = await documentQuery(type, doc);

      if (additionalData) {
        transformedData.additionalData = {
          ...transformedData.additionalData,
          ...additionalData
        };
      }
    }

    console.log(transformedData, 'transformedData');

    return transformedData;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};
