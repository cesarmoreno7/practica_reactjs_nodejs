const { sequelize } = require('../config/database');

// Configuración antes de todas las pruebas
beforeAll(async () => {
  // Sincronizar todos los modelos con la base de datos
  // Esto creará las tablas necesarias en la base de datos de prueba
  await sequelize.sync({ force: true });
});

// Cleanup after each test
afterEach(async () => {
  // Eliminar todos los datos de las tablas para mantener las pruebas aisladas
  try {
    const models = Object.values(sequelize.models);
    for (const model of models) {
      await model.destroy({ where: {}, truncate: true, cascade: true, force: true });
    }
  } catch (error) {
    console.error('Error in afterEach cleanup:', error);
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Cerrar la conexión con la base de datos
  await sequelize.close();
});

