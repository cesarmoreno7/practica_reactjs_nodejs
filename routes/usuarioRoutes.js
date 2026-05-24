/**
 * Routes under `/api/usuario` manage login plus all user CRUD operations.
 * Login is rate limited but public; everything else requires a valid JWT.
 */
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter, writeLimiter } = require('../middleware/rateLimit');

// Rutas públicas
router.post('/authenticate', authLimiter, usuarioController.authenticate); // Autenticar usuario (login) - rate limit estricto

/**
 * Protected endpoints that perform create/read/update/delete operations.
 */
// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, writeLimiter, usuarioController.create);                    // Crear usuario
router.get('/', authenticateToken, usuarioController.findAll);                   // Obtener todos los usuarios
router.get('/:codigo_usu', authenticateToken, usuarioController.findById);      // Obtener usuario por ID
router.get('/tipo/:cod_tipo_usu', authenticateToken, usuarioController.findByTipoUsuario); // Obtener usuarios por tipo
router.get('/estado/:estado', authenticateToken, usuarioController.findByEstado); // Obtener usuarios por estado
router.get('/search/:term', authenticateToken, usuarioController.searchByName);  // Buscar usuarios por nombre/apellido
router.put('/:codigo_usu', authenticateToken, writeLimiter, usuarioController.update);        // Actualizar usuario
router.delete('/:codigo_usu', authenticateToken, writeLimiter, usuarioController.delete);     // Eliminar usuario

module.exports = router;
