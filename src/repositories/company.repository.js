const {
  Person,
  Company,
  Sequelize: { Op }
} = require('../models/index');

const getCompany = nit =>
  Company.findOne({
    where: { nit },
    include: [
      {
        model: Person,
        attributes: { exclude: ['id', 'createdAt', 'updatedAt'] }
      }
    ],
    attributes: { exclude: ['id', 'updatedAt', 'agent', 'texto'] }
  });

const getCompanies = async () => await Company.findAll();

const createCompany = async newCompany => {
  const { name, nit } = newCompany;
  try {
    const [company, created] = await Company.findOrCreate({
      where: { [Op.or]: [{ name, nit }] },
      defaults: newCompany,
      include: [
        {
          model: Person,
          attributes: { exclude: ['id', 'createdAt', 'updatedAt'] }
        }
      ],
      attributes: { exclude: ['id', 'updatedAt', 'agent'] }
    });

    console.log(created, ' created'); // The boolean indicating whether this instance was just created

    return await getCompany(company.nit);
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

module.exports = { getCompany, createCompany, getCompanies };
