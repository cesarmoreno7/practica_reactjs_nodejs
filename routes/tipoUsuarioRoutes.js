/**
 * Routes for `/api/tipo-usuario` that manage configurable user types.
 * Every route requires JWT authorization plus selective write rate limiting.
 */
const express = require('express');
const router = express.Router();
const tipoUsuarioController = require('../controllers/tipoUsuarioController');
const { authenticateToken } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimit');

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, writeLimiter, tipoUsuarioController.create);           // Crear tipo de usuario
router.get('/', authenticateToken, tipoUsuarioController.findAll);           // Obtener todos los tipos de usuario
router.get('/:cod_tipo_usu', authenticateToken, tipoUsuarioController.findById); // Obtener tipo de usuario por ID
router.get('/search/:term', authenticateToken, tipoUsuarioController.searchByDescription); // Buscar por descripción
router.put('/:cod_tipo_usu', authenticateToken, writeLimiter, tipoUsuarioController.update); // Actualizar tipo de usuario
router.delete('/:cod_tipo_usu', authenticateToken, writeLimiter, tipoUsuarioController.delete); // Eliminar tipo de usuario

module.exports = router;
