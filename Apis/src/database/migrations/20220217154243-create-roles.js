"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("roles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "USER",
        comment:
          "EJP: USER, CLIENT, AGENT, CONSULTANT, ADVISOR (USUARIO, CLIENTE, AGENTE, CONSULTOR, ASESOR)",
      },
      admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ENCARGADO DE ADMINISTRAR TODA LA APP CONTROL TOTAL",
      },
      moderator: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ENCARGADO DE LA GESTION DE MUCHAS EMPRESAS",
      },
      manager: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ENCARGADO DE GERENCIAR CONTROL TOTAL DE UNA EMPRESA",
      },
      financier: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ENCARGADO DE LA PARTE FINANCIERA",
      },
      accountant: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ENCARGADO DE LA PARTE CONTABLE",
      },
      lawyer: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ENCARGADO DE LA PARTE JURIDICA",
      },
      assistant: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "EJP: ASISTENTE, AUXILIAR CONTABLE ETC",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "PERSONA A QUIEN PERTENECE ESTE ROL",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("roles");
  },
};
