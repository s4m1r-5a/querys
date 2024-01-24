const moment = require('moment');
const cron = require('node-cron');
const { usuryRateQuery } = require('./queries');
const repositories = require('../repositories/usurys.repository');
const { checkUsuryRate } = require('../services/servicesQueryApi');
moment.locale('es');

cron.schedule('30 11 1 * *', async () => {
  const currentDate = moment().startOf('month').format('YYYY-MM-DD');
  rate = await repositories.getUsurysBySearch({ date: currentDate });
  if (!rate) {
    const data = await checkUsuryRate(currentDate);
    await repositories.createUsury(data);
  }
});
