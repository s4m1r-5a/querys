"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("googles", {
      id: {
        type: Sequelize.STRING,
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
      avatar: {
        type: Sequelize.STRING,
        comment: "IMAGEN DE PERFIL",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "USUARIO A QUIEN PERTENECE ESTA CUENTA DE GOOGLE",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("googles");
  },
};
