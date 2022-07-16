'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('companies', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'NOMBRE DE LA EMPRESA'
      },
      alias: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ALIAS DE LA EMPRESA'
      },
      nit: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      address: Sequelize.STRING,
      websites: Sequelize.STRING,
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'AGENCIA,INMOBILIARIA',
        comment: 'AGENCIA, INMOBILIARIA, CONSTRUCTORA ETC'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'PERSONA REPRESENTANTE DE LA EMPRESA',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      description: {
        type: Sequelize.STRING,
        comment: 'DESCRIPCION DE LA EMPRESA'
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'DEPARTAMENTO EN QUE SE REGISTRO LA EMPRESA'
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'CIUDAD EN QUE SE REGISTRO LA EMPRESA'
      },
      mainActivity: Sequelize.STRING,
      licenseCategory: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('companies');
  }
};
