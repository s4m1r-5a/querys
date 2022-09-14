'use strict';

//const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define(
    'Company',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nit: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      matricula: DataTypes.STRING,
      date: DataTypes.DATE,
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'INACTIVE'
      },
      sociedad: DataTypes.STRING,
      organizacion: DataTypes.STRING,
      categoria: DataTypes.STRING,
      actualizado: DataTypes.DATE,
      actividades: DataTypes.JSON,
      docRepresentantes: DataTypes.JSON,
      representantes: DataTypes.JSON,
      texto: DataTypes.TEXT
    },
    {
      tableName: 'companies',
      indexes: [
        {
          fields: ['name', 'nit'],
          name: 'name-nit',
          unique: true
        }
      ]
    }
  );

  Company.associate = function (models) {
    Company.belongsTo(models.Person, { foreignKey: 'agent' });
  };

  return Company;
};
