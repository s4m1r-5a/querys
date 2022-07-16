"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "NOMBRE COMPLETO",
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: "CORREO ELECTRONICO",
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "CONTRASEÑA",
      },
      avatar: {
        type: Sequelize.STRING,
        comment: "IMAGEN DE PERFIL",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("users");
  },
};
