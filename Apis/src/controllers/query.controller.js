const moment = require('moment');
const {
  documentQuery,
  usuryRateQuery,
  companyQuery
} = require('../utils/queries');
const { consultPerson, consultCompany } = require('../utils/verifik');
const repositories = require('../repositories/usurys.repository');

const type = new Map();
type.set('CC', '1');
type.set('CE', '4');
type.set('PEP', '5');

moment.locale('es');

module.exports.person = async (req, res) => {
  //["CC", "CE", "PEP", "CCVE"]
  const { documentType, documentNumber } = req.body;
  if (type.has(documentType)) {
    const data = await documentQuery(type.get(documentType), documentNumber);
    if (data?.std) return res.json(data);
    consultPerson({ documentType, documentNumber })
      .then(response => res.json(response))
      .catch(error => res.json(error.response.data));
  } else
    consultPerson({ documentType, documentNumber })
      .then(response => res.json(response))
      .catch(error => res.json(error.response.data));
}; // bueno

module.exports.company = async (req, res) => {
  //["CC", "CE", "PEP", "CCVE"]
  const { nit } = req.body;
  const data = await companyQuery(nit);
  return res.json(data);
};

module.exports.usury = async (req, res) => {
  const { date } = req.body;
  if (!date) return res.json(await repositories.getUsurys());
  const month = moment(date).startOf('month').format('YYYY-MM-DD');
  const currentDate = moment().startOf('month').format('YYYY-MM-DD');
  const diff = moment().diff(month, 'months');
  let rate;

  if (diff > 0) rate = await repositories.getUsurysBySearch({ date: month });
  else {
    rate = await repositories.getUsurysBySearch({ date: currentDate });
    if (!rate) {
      const Tasa = await usuryRateQuery();
      const data = { annualRate: Tasa, date: currentDate };
      const { usury, created } = await repositories.createUsury(data);
      rate = usury;
    }
  }
  res.json(rate ? rate.get({ plain: true }) : false);
};

//module.exports = type;
