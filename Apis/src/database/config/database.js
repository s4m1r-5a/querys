require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PWD,
    database: process.env.DB_NAME || 'services',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',

    // Configurar Seeds
    seederStorage: 'sequelize',
    seederStorageTableName: 'seeds',
    // Configurar Migraciones
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'migrations',

    logging: true,
    define: {
      underscored: true
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PWD,
    database: process.env.DB_NAME || 'inmovili',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',

    // Configurar Seeds
    seederStorage: 'sequelize',
    seederStorageTableName: 'seeds',
    // Configurar Migraciones
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'migrations',

    logging: true,
    define: {
      underscored: true
    }
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PWD,
    database: process.env.DB_NAME || 'inmovili',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',

    // Configurar Seeds
    seederStorage: 'sequelize',
    seederStorageTableName: 'seeds',
    // Configurar Migraciones
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'migrations',

    logging: true,
    define: {
      underscored: true
    }
  }
};
