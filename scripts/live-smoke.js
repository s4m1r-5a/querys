const { documentQuery, companyQuery } = require('../src/utils/queries');
const { checkUsuryRate } = require('../src/services/servicesQueryApi');

const CASES = {
  document: async () => {
    const result = await documentQuery('CC', '1082926704');
    if (result.success === false) throw new Error(result.message);
    if (result.docType !== 'CC') throw new Error(`Unexpected docType: ${result.docType}`);
    if (result.docNumber !== '1082926704') {
      throw new Error(`Unexpected docNumber: ${result.docNumber}`);
    }
    if (!result.fullName) throw new Error('Missing fullName');
    return result;
  },
  company: async () => {
    const result = await companyQuery('901600406');
    if (result.success === false) throw new Error(result.message);
    if (result.docType !== 'NIT') throw new Error(`Unexpected docType: ${result.docType}`);
    if (result.docNumber !== '901600406') {
      throw new Error(`Unexpected docNumber: ${result.docNumber}`);
    }
    if (result.verifyDigit !== '1') {
      throw new Error(`Unexpected verifyDigit: ${result.verifyDigit}`);
    }
    return result;
  },
  usury: async () => {
    const result = await checkUsuryRate(new Date().toISOString());
    if (result.error) throw new Error(result.message || result.error);
    if (result.annualRate === undefined) throw new Error('Missing annualRate');
    return result;
  }
};

async function main() {
  const target = process.argv[2] || 'all';
  const names = target === 'all' ? Object.keys(CASES) : [target];
  const output = {};

  for (const name of names) {
    if (!CASES[name]) throw new Error(`Unknown live smoke case: ${name}`);
    output[name] = await CASES[name]();
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
