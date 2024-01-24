const moment = require('moment');
const {
  documentQuery,
  usuryRateQuery,
  companyQuery
} = require('../utils/queries');
const { consultPerson, consultCompany } = require('../utils/verifik');
const {
  getUsurys,
  createUsury,
  getUsurysBySearch
} = require('../repositories/usurys.repository');
const {
  getCompany,
  createCompany,
  getCompanies
} = require('../repositories/company.repository');

const {
  getPerson,
  getPersons,
  createPerson
} = require('../repositories/persons.repository');
const { businessQuery } = require('../services/enterpriseQueryApi');
const { checkUsuryRate } = require('../services/servicesQueryApi');

const type = new Map();
type.set('CC', '1');
type.set('CE', '4');
type.set('PEP', '5');

moment.locale('es');

module.exports.person = async (req, res) => {
  //["CC", "CE", "PEP", "CCVE"]
  const { docType, docNumber } = req.body;
  const person = await getPerson(docType, docNumber);
  console.log(person);
  if (person) return res.json(person);

  if (type.has(docType)) {
    const data = await documentQuery(type.get(docType), docNumber);
    if (data) {
      console.log(data);
      await createPerson(data);
      return res.json(await getPerson(data.docType, data.docNumber));
    }
    consultPerson({ docType, docNumber })
      .then(async response => {
        await createPerson(response);
        return res.json(response);
      })
      .catch(error => res.json(error.response.data));
  } else
    consultPerson({ docType, docNumber })
      .then(response => res.json(response))
      .catch(error => res.json(error.response.data));
}; // bueno

module.exports.company = async (req, res) => {
  //["CC", "CE", "PEP", "CCVE"]
  const { nit, method } = req.body;
  const busines = await businessQuery(nit);
  if (busines) return res.json(busines);

  const company = await getCompany(nit);
  if (company) return res.json(company);

  const newBusiness = await companyQuery(nit, method);
  newBusiness.nit = nit;
  newBusiness.actualizado = newBusiness.actualizado
    ? moment(newBusiness.actualizado).format('YYYY-MM-DD')
    : null;
  newBusiness.date = newBusiness.date
    ? moment(newBusiness.date).format('YYYY-MM-DD')
    : null;

  //if (typeof newBusiness.representante === 'object') {
  if (Array.isArray(newBusiness.representantes)) {
    for (var i = 0; i < newBusiness.representantes.length; i++) {
      const person = newBusiness.representantes[i];
      if (!i) newBusiness.agent = (await createPerson(person)).id || false;
      else {
        const people = await createPerson(person);
        if (!newBusiness?.agent) newBusiness.agent = people.id;
      }
    }
  } else if (newBusiness.representantes) {
    console.log(newBusiness.representantes);
  }

  const business = await createCompany(newBusiness);
  //console.log(business);

  return res.json(business);
};

module.exports.usury = async (req, res) => {
  const { date } = req.body;
  if (!date) return res.json(await getUsurys());
  const month = moment(date).startOf('month').format('YYYY-MM-DD');
  const currentDate = moment().startOf('month').format('YYYY-MM-DD');
  const diff = moment().diff(month, 'months');
  let rate;
  
  if (diff > 12) rate = await getUsurysBySearch({ date: month });
  else {
    rate = await getUsurysBySearch({ date: currentDate });
    if (!rate) {
      const data = await checkUsuryRate(month);
      const { usury, created } = await createUsury(data);
      rate = data;
    }
  }
  res.json(rate ? rate : false);
};

//module.exports = type;
