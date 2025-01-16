'use strict';

module.exports = (sequelize, DataTypes) => {
  const Entity = sequelize.define(
    'Entity',
    {
      personType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PERSONA',
        validate: { isIn: [['NATURAL', 'JURIDICA', 'PERSONA']] }
      },
      docType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['CC', 'CE', 'NIT', 'PEP', 'CCVE']] }
      },
      docNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { is: /^\s?[0-9]+\s?/, len: [6, 13] }
      },
      verifyDigit: {
        type: DataTypes.STRING,
        defaultValue: null,
        validate: { is: /^\s?[0-9]+\s?/, len: [1, 2] }
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: null
      },
      date: {
        type: DataTypes.STRING,
        defaultValue: null
      },
      additionalData: {
        type: DataTypes.JSON,
        defaultValue: null
      }
    },
    {
      tableName: 'entities',
      indexes: [
        {
          fields: ['docType', 'docNumber'],
          unique: true
        }
      ]
    }
  );

  return Entity;
};
