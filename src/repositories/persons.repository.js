const {
  Person,
  Sequelize: { Op }
} = require('../models/index');

const getPerson = async (docType, docNumber) => {
  return await Person.findOne({
    where: { [Op.and]: [{ docType, docNumber }] },
    attributes: { exclude: ['id', 'updatedAt'] }
  });
};

const getPersons = async id => {
  return await Person.findAll();
};

const getPersonById = async id => {
  return await Person.findOne({ where: { id } });
};

const createPerson = async newPerson => {
  const { docType, docNumber } = newPerson;
  try {
    const [person, created] = await Person.findOrCreate({
      where: { [Op.and]: [{ docType, docNumber }] },
      defaults: newPerson
    });

    console.log(created, ' created'); // The boolean indicating whether this instance was just created

    return person;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const updatePerson = async (personId, newPerson) => {
  const cPerson = await getPersonById(personId);

  if (newPerson?.docType && newPerson?.docType !== cPerson.docType)
    cPerson.docType = newPerson.docType;

  if (newPerson?.docNumber && newPerson?.docNumber !== cPerson.docNumber)
    cPerson.docNumber = newPerson.docNumber;

  if (newPerson?.docFrom && newPerson?.docFrom !== cPerson.docFrom)
    cPerson.docFrom = newPerson.docFrom;

  if (newPerson?.firstName && newPerson?.firstName !== cPerson.firstName)
    cPerson.firstName = newPerson.firstName;

  if (newPerson?.lastName && newPerson?.lastName !== cPerson.lastName)
    cPerson.lastName = newPerson.lastName;

  if (newPerson?.arrayName && newPerson?.arrayName !== cPerson.arrayName)
    cPerson.arrayName = newPerson.arrayName;

  if (newPerson?.email && newPerson?.email !== cPerson.email)
    cPerson.email = newPerson.email;

  if (newPerson?.phone && newPerson?.phone !== cPerson.phone)
    cPerson.phone = newPerson.phone;

  if (newPerson?.whatsapp && newPerson?.whatsapp !== cPerson.whatsapp)
    cPerson.whatsapp = newPerson.whatsapp;

  if (newPerson?.address && newPerson?.address !== cPerson.address)
    cPerson.address = newPerson.address;

  try {
    await cPerson.save();
    return cPerson;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }

  /* if (!newPerson?.secretKey) newPerson.secretKey = cPerson.secretKey;
    else if (newPerson?.secretKey) {
      newPerson.secretKey = encrypt(newPerson.secretKey);
      clearUsersCache(id);
    } */
};

module.exports = {
  getPerson,
  getPersons,
  getPersonById,
  createPerson,
  updatePerson
};
