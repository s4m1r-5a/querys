'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usurys', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      annualRate: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        comment: 'TASA DE USURA ANUAL'
      },
      monthlyRate: {
        type: Sequelize.DECIMAL(11, 4),
        comment: 'TASA DE USURA MENSUAL'
      },
      dailyRate: {
        type: Sequelize.DECIMAL(11, 4),
        comment: 'TASA DE USURA DIARIA'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'MES EN QUE REGIRA LA TASA'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('usurys');
  }
};
