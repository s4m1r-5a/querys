"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("projects", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "NOMBRE DEL PROYECTO",
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
        comment: "EMPRESA PROPIETARIA DE ESTE PROYECTO",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "EJE: LOTEO, TORRE, CONJUNTO, URBANISMO",
      },
      initialPay: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "CUOTA O VALOR DE LA SEPARACION",
      },
      downPayment: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        comment: "PORCENTAGE DE LA CUOTA INICIAL",
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "ESTADO DEL PROYECTO",
      },
      products: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "EJP: LOTES, CASAS, APARTAMENTOS, CABAÑAS ETC",
      },
      blocks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "EJP: MANZANAS, BLOQUES, SECTORES",
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "STOCK DE LOTES, CASAS, APARTAMENTOS ETC DISPONIBLES",
      },
      projectedCost: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        defaultValue: 1000000,
        comment: "COSTO PROYECTADO DEL PROYECTO",
      },
      currentCost: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "COSTO ACTUAL DEL PROYECTO",
      },
      projectStart: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "FECHA DE INICIO DEL PROYECTO",
      },
      projectEnd: {
        type: Sequelize.DATE,
        allowNull: false,
        comment:
          "FECHA PROYECTADA DE TERMINACION DEL PROYECTO DE ESTO DEPENDE LA FINANCIACION",
      },
      incentive: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "OPCIONAL SI SE PRETENDE DAR INCENTIVO POR LA SEPARACION",
      },
      bonusPayment: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "OPCIONAL SI EL PROYECTO PAGA BONOS EXTRAS",
      },
      commission: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "COMISION POR VENTA PORCENTUAL",
      },
      maxCommission: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "COMISION MAXIMA A PAGAR POR VENTA EN ESTE PROYECTO",
      },
      lineOne: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "COMISION DE BAJO LINEA POR VENTA PORCENTUAL PRIMERA LINEA",
      },
      lineTwo: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "COMISION DE BAJO LINEA POR VENTA PORCENTUAL SEGUNDA LINEA",
      },
      lineThree: {
        type: Sequelize.DECIMAL(11, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "COMISION DE BAJO LINEA POR VENTA PORCENTUAL TERCERA LINEA",
      },
      lateFee: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ESTIPULAR IMPUESTOS POR MORA AL PROYECTO",
      },
      bonds: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "ACECTACION DE BONOS EN ESTE PROYECTO",
      },
      shortDescription: {
        type: Sequelize.STRING,
        comment: "DESCRIPCION CORTA DEL PROYECTO",
      },
      description: {
        type: Sequelize.STRING,
        comment: "DESCRIPCION DEL PROYECTO",
      },
      amenities: {
        type: Sequelize.STRING,
        comment: "AMENIDADES DEL PROYECTO",
      },
      drive: {
        type: Sequelize.STRING,
        comment: "URL DE CARPETA EN LA NUVE",
      },
      logo: {
        type: Sequelize.STRING,
        comment: "LOGO DEL PROYECTO",
      },
      images: {
        type: Sequelize.STRING,
        comment:
          "URL DE LAS IMAGENES DEL PROYECTO SI SON VARIAS SEPARAR CON ','",
      },
      videos: {
        type: Sequelize.STRING,
        comment: "URL DE LOS VIDEOS DEL PROYECTO SI SON VARIOS SEPARAR CON ','",
      },
      renders: {
        type: Sequelize.STRING,
        comment:
          "URL DE LOS RENDERS DEL PROYECTO SI SON VARIOS SEPARAR CON ','",
      },
      blueprints: {
        type: Sequelize.STRING,
        comment: "PLANO DEL PROYECTO",
      },
      location: {
        type: Sequelize.STRING,
        comment: "LOCACION DEL PROYECTO LATITUD Y LONGITUD",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("projects");
  },
};
