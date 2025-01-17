const {
  Entity,
  Sequelize: { Op }
} = require('../models/index');

const getEntity = async (docType, docNumber) => {
  return await Entity.findOne({
    where: { [Op.and]: [{ docType, docNumber }] },
    attributes: { exclude: ['updatedAt'] }
  });
};

const getEntities = async id => {
  return await Entity.findAll();
};

const getEntityById = async id => {
  return await Entity.findOne({ where: { id } });
};

const createEntity = async newEntity => {
  const { docType, docNumber } = newEntity;
  try {
    const [entity, created] = await Entity.findOrCreate({
      where: { [Op.and]: [{ docType, docNumber }] },
      defaults: newEntity,
      attributes: { exclude: ['id', 'updatedAt'] }
    });

    console.log(created, ' created'); // The boolean indicating whether this instance was just created

    return entity;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const updateEntity = async (entityId, newEntity) => {
  const cEntity = await getEntityById(entityId);

  if (newEntity?.entityType && newEntity?.entityType !== cEntity.entityType)
    cEntity.entityType = newEntity.entityType;

  if (newEntity?.docType && newEntity?.docType !== cEntity.docType)
    cEntity.docType = newEntity.docType;

  if (newEntity?.docNumber && newEntity?.docNumber !== cEntity.docNumber)
    cEntity.docNumber = newEntity.docNumber;

  if (newEntity?.docFrom && newEntity?.docFrom !== cEntity.docFrom)
    cEntity.docFrom = newEntity.docFrom;

  if (newEntity?.fullName && newEntity?.fullName !== cEntity.fullName)
    cEntity.fullName = newEntity.fullName;

  if (newEntity?.status && newEntity?.status !== cEntity.status)
    cEntity.status = newEntity.status;

  if (newEntity?.date && newEntity?.date !== cEntity.date)
    cEntity.date = newEntity.date;

  if (newEntity?.verifyDigit && newEntity?.verifyDigit !== cEntity.verifyDigit)
    cEntity.verifyDigit = newEntity.verifyDigit;

  if (newEntity?.additionalData)
    cEntity.additionalData = newEntity.additionalData;

  try {
    await cEntity.save();
    return cEntity;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const deleteEntity = async id => {
  return await Entity.destroy({ where: { id } });
};

module.exports = {
  getEntity,
  getEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity
};
