/**
 * Database connection helper that centralizes MySQL initialization using Sequelize.
 */
const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');
require('dotenv').config();

// Configuración de Sequelize para MySQL
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'practica_react_node',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: (msg) => logger.info(msg),
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión a MySQL establecida exitosamente', {
      database: process.env.MYSQL_DATABASE,
    });
  } catch (error) {
    logger.error('Error conectando a MySQL', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

