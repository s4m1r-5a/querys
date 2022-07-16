"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("persons", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "users",
          key: "id",
        },
        comment: "USUARIO A QUIEN PERTENECE ESTA PERSONA",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      documentType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "TIPO DE DOCUMENTO EJP: CC, CE, PEP, CCVE.",
      },
      documentNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "NUMERO DE DOCUMENTO",
      },
      documentFrom: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "DE QUE PARTE FUE REGISTRADO EL DOCUMENTO",
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "NOMBRES",
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "APELLIDOS",
      },
      arrayName: {
        type: Sequelize.STRING,
        comment: "ARRAY CON NOMBRE COMPLETO",
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: "CORREO ELECTRONICO",
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "NUMERO MOVIL",
      },
      whatsapp: {
        type: Sequelize.STRING,
        comment: "NUMERO WHATSAPP",
      },
      address: {
        type: Sequelize.STRING,
        comment: "DIRECCION DE RESIDENCIA",
      },
      avatar: {
        type: Sequelize.STRING,
        comment: "IMAGEN DE PERFIL",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.addIndex(
      "persons",
      ["documentType", "documentNumber"],
      {
        name: "persons_documentType_documentNumber_index",
        unique: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("persons");
  },
};
