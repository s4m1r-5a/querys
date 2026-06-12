'use strict';

const fs = require('fs');
require('dotenv').config();
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
// Configuracion
const config = require('../database/config/database');
const NODE_ENV = process.env.NODE_ENV || 'development';
const dbConfig = config[NODE_ENV] || config.development;

// Declaracion del objeto DB
const db = {};

// Inicializar la conexión
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: dbConfig.port || 3306,
    logging: process.env.DB_LOGS === 'true'
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
