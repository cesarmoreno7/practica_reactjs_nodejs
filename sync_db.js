const { sequelize } = require('./config/database');
const TipoUsuario = require('./models/TipoUsuario');
const Usuario = require('./models/Usuario');
const { logger } = require('./utils/logger');

/**
 * Sincroniza los modelos con la base de datos MySQL.
 * El uso de { alter: true } intenta actualizar las tablas existentes sin borrar datos.
 * El uso de { force: true } borraría todas las tablas y las crearía de nuevo (usar con precaución).
 */
const syncDB = async () => {
  try {
    logger.info('Iniciando sincronización de base de datos...');
    
    // Autenticar la conexión primero
    await sequelize.authenticate();
    logger.info('Conexión establecida correctamente.');

    // Sincronizar todos los modelos
    // Usamos alter: true para que se ajusten las tablas si ya existen
    await sequelize.sync({ alter: true });
    
    logger.info('Tablas sincronizadas exitosamente con los modelos.');
    
    // Opcional: Insertar datos iniciales si la tabla está vacía
    const count = await TipoUsuario.count();
    if (count === 0) {
      logger.info('Insertando datos iniciales en tipo_usuario...');
      await TipoUsuario.bulkCreate([
        { descripcion: 'Administrador' },
        { descripcion: 'Usuario' },
        { descripcion: 'Moderador' },
        { descripcion: 'Invitado' }
      ]);
      logger.info('Datos iniciales insertados.');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error sincronizando la base de datos:', error);
    process.exit(1);
  }
};

syncDB();
