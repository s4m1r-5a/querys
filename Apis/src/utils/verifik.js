const axios = require('axios');

const getLoginVerifik = async () => {
  const token = (
    await axios.post('https://api.verifik.co/v2/auth/login', {
      password: '$@!)@rri@9A',
      phone: '3012673944'
    })
  ).data;
  return token.tokenType + ' ' + token.accessToken;
};

module.exports.consultPerson = async params => {
  const token = await getLoginVerifik();
  const country = params.documentType === 'CCVE' ? 've' : 'co';
  const url = `https://api.verifik.co/v2/${country}/consultarNombres`;
  const headers = { Authorization: token };
  const docQuery = await axios.get(url, { headers, params });
  return docQuery.data.data;
};

module.exports.consultCompany = async params => {
  const token = await getLoginVerifik();
  const url = 'https://api.verifik.co/v2/co/rues/consultarEmpresaPorNit';
  const headers = { Authorization: token };
  const docQuery = await axios.get(url, { headers, params });
  return docQuery.data.data;
};
