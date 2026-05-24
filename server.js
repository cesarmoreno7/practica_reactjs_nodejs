/**
 * Entry point for the Node.js API.
 * Configures Express, rate limiting, logging, JWT-protected routes,
 * and serves the React SPA in production while keeping API endpoints isolated.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar logger
const { logger, requestLogger } = require('./utils/logger');

// Importar conexión a la base de datos
const { connectDB } = require('./config/database');

// Importar middleware de autenticación
const { authenticateToken } = require('./middleware/auth');

// Importar middleware de rate limiting
const { generalLimiter, authLimiter, writeLimiter } = require('./middleware/rateLimit');

// Importar rutas
const tipoUsuarioRoutes = require('./routes/tipoUsuarioRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Apply rate limiting middleware early so repeated requests against any
 * `/api/*` route are throttled before hitting controllers.
 */
app.use('/api/', generalLimiter); // Rate limiting general para todas las rutas de API

// Middleware para logging de requests
app.use(requestLogger);

/**
 * Mount the modular routers that implement the CRUD + auth endpoints.
 */
app.use('/api/tipo-usuario', tipoUsuarioRoutes);
app.use('/api/usuario', usuarioRoutes);

/**
 * Health/documentation endpoint that lists the available APIs and their verbs.
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de práctica Node.js funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      tipoUsuario: {
        base: '/api/tipo-usuario',
        endpoints: {
          'POST /': 'Crear tipo de usuario',
          'GET /': 'Obtener todos los tipos de usuario',
          'GET /:cod_tipo_usu': 'Obtener tipo de usuario por ID',
          'GET /search/:term': 'Buscar tipos de usuario por descripción',
          'PUT /:cod_tipo_usu': 'Actualizar tipo de usuario',
          'DELETE /:cod_tipo_usu': 'Eliminar tipo de usuario'
        }
      },
      usuario: {
        base: '/api/usuario',
        endpoints: {
          'POST /': 'Crear usuario',
          'GET /': 'Obtener todos los usuarios',
          'GET /:codigo_usu': 'Obtener usuario por ID',
          'GET /tipo/:cod_tipo_usu': 'Obtener usuarios por tipo',
          'GET /estado/:estado': 'Obtener usuarios por estado',
          'GET /search/:term': 'Buscar usuarios por nombre/apellido',
          'POST /authenticate': 'Autenticar usuario (login)',
          'PUT /:codigo_usu': 'Actualizar usuario',
          'DELETE /:codigo_usu': 'Eliminar usuario'
        }
      }
    }
  });
});

/**
 * Explicit 404 handler for `/api/*` routes so the client can distinguish
 * API misses from SPA route fallbacks.
 */
const handleApiNotFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta de API no encontrada',
    availableRoutes: [
      'GET /',
      '/api/tipo-usuario/*',
      '/api/usuario/*'
    ]
  });
};

/**
 * Fallback 404 handler for everything else; the SPA fallback takes precedence
 * in production, but this ensures dev clients still get JSON when hitting unknown API endpoints.
 */
const handleGeneralNotFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    availableRoutes: [
      'GET /',
      '/api/tipo-usuario/*',
      '/api/usuario/*'
    ]
  });
};

/**
 * Path to the pre-built React assets served in production.
 */
const clientBuildPath = path.join(__dirname, 'client', 'dist');

/**
 * Install the specialized API 404 handler before hooking up the SPA.
 */
app.use('/api/*', handleApiNotFound);

/**
 * When in production, serve React's build output and let the SPA handle non-API routes.
 */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use('*', handleGeneralNotFound);

// Middleware para manejo de errores global
app.use((error, req, res, next) => {
  logger.error('Error no manejado', { error: error.message, stack: error.stack, req });

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error del servidor'
  });
});

// Configurar puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor con conexión a la base de datos
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info('Servidor iniciado exitosamente', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        apiUrl: `http://localhost:${PORT}`,
        docsUrl: `http://localhost:${PORT}/`
      });
    });

    // Manejar errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Puerto ${PORT} ya está en uso`, { error: error.message });
        process.exit(1);
      } else {
        logger.error('Error del servidor', { error: error.message, stack: error.stack });
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Solo iniciar servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;

