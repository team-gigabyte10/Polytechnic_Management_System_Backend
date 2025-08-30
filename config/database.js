const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  name: process.env.DB_NAME || 'polytechnic_management',
  user: process.env.DB_USER || 'root',
  pass: process.env.DB_PASS || '',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql'
};

const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.pass,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error && error.message ? error.message : error);
    console.error(`DB host: ${dbConfig.host}, port: ${dbConfig.port}, user: ${dbConfig.user}, db: ${dbConfig.name}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing without a database connection (development mode). Configure DB_* env vars to enable DB.');
    }
  }
};

module.exports = { sequelize, testConnection };