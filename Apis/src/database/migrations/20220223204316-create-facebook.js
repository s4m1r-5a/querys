"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("facebooks", {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "NOMBRE EN FACEBOOK",
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: "CORREO ELECTRONICO DE FACEBOOK",
      },
      avatar: {
        type: Sequelize.STRING,
        comment: "IMAGEN DE PERFIL DE FACEBOOK",
      },
      token: {
        type: Sequelize.STRING,
        comment: "TOKEN DE FACEBOOK",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "USUARIO A QUIEN PERTENECE ESTA CUENTA DE FACEBOOK",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("facebooks");
  },
};
