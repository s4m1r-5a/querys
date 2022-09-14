'use strict';

module.exports = (sequelize, DataTypes) => {
  const Person = sequelize.define(
    'Person',
    {
      docType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['CC', 'CE', 'PEP', 'CCVE']] }
      },
      docNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { is: /^\s?[0-9]+\s?/, len: [6, 13] }
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      arrayName: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: () => []
      },
      Antecedentes: DataTypes.TEXT
    },
    {
      tableName: 'persons',
      indexes: [
        {
          fields: ['docType', 'docNumber'],
          unique: true
        }
      ]
    }
  );

  Person.associate = function (models) {
    Person.hasOne(models.Company, { foreignKey: 'agent' });
  };

  return Person;
};
