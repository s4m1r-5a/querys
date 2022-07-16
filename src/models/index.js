'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
// Configuracion
const config = require('../database/config/database');
const NODE_ENV = process.env.NODE_ENV;

// Declaracion del objeto DB
const db = {};

// Inicializar la conexión
const sequelize = new Sequelize(
  config[NODE_ENV].database,
  config[NODE_ENV].username,
  config[NODE_ENV].password,
  {
    dialect: config[NODE_ENV].dialect,
    host: config[NODE_ENV].host,
    port: config[NODE_ENV].port || 3306,
    logging: config[NODE_ENV].logging === 'true',
    logging: true
  }
);

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    console.log(model.name);
    // Cada modelo que hay en el directorio se vincula al objeto DB
    db[model.name] = model;
  });

// Realizar las asociaciones de los modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
