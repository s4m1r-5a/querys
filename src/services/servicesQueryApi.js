const axios = require('axios');
const moment = require('moment');

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

    const rates = graphData.map(([rateDate, value]) => ({
      annualRate: value,
      date: moment(rateDate, 'DD MMM YY').format('YYYY-MM-DD')
    }));

    return rates.find(rate => rate.date === month);
  } catch (error) {
    return { error: error.message };
  }
};
