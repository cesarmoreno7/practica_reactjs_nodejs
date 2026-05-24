const Usuario = require('../models/Usuario');
const { generateToken } = require('../middleware/auth');

/**
 * Controller layer for user operations (CRUD plus authentication).
 * Validates inputs, handles errors, and returns consistent JSON responses.
 */

/**
 * Validates input and delegates the creation to the Usuario model.
 */
const create = async (req, res) => {
  try {
    const { cod_tipo_usu, clave, estado, nombre, apellido } = req.body;

    if (!cod_tipo_usu || !clave || !estado || !nombre || !apellido) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos: cod_tipo_usu, clave, estado, nombre, apellido'
      });
    }

    const usuario = await Usuario.create({
      cod_tipo_usu,
      clave,
      estado,
      nombre,
      apellido
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);

    if (error.message.includes('tipo de usuario especificado no existe')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Handles paginated listing of users with parameter validation.
 */
const findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validar parámetros
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de paginación inválidos'
      });
    }

    const result = await Usuario.findAll(page, limit);

    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener usuario por ID
const findById = async (req, res) => {
  try {
    const { codigo_usu } = req.params;

    if (!codigo_usu) {
      return res.status(400).json({
        success: false,
        message: 'El código del usuario es requerido'
      });
    }

    const usuario = await Usuario.findById(codigo_usu);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar usuarios por nombre o apellido
const searchByName = async (req, res) => {
  try {
    const { term } = req.params;

    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda es requerido'
      });
    }

    const usuarios = await Usuario.searchByName(term);

    res.status(200).json({
      success: true,
      message: `Búsqueda de usuarios por: "${term}"`,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener usuarios por tipo
const findByTipoUsuario = async (req, res) => {
  try {
    const { cod_tipo_usu } = req.params;

    if (!cod_tipo_usu) {
      return res.status(400).json({
        success: false,
        message: 'El código del tipo de usuario es requerido'
      });
    }

    const usuarios = await Usuario.findByTipoUsuario(cod_tipo_usu);

    res.status(200).json({
      success: true,
      message: `Usuarios del tipo ${cod_tipo_usu} obtenidos exitosamente`,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener usuarios por estado
const findByEstado = async (req, res) => {
  try {
    const { estado } = req.params;

    if (estado === undefined || estado === null) {
      return res.status(400).json({
        success: false,
        message: 'El estado del usuario es requerido'
      });
    }

    const usuarios = await Usuario.findByEstado(estado);

    res.status(200).json({
      success: true,
      message: `Usuarios con estado ${estado} obtenidos exitosamente`,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Verifies credentials and issues a JWT when the user is active.
 */
const authenticate = async (req, res) => {
  try {
    const { codigo_usu, clave } = req.body;

    if (!codigo_usu || !clave) {
      return res.status(400).json({
        success: false,
        message: 'El código de usuario y la clave son requeridos'
      });
    }

    const usuario = await Usuario.authenticate(codigo_usu, clave);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas o usuario inactivo'
      });
    }

    // Generar token JWT
    const token = generateToken(usuario);

    res.status(200).json({
      success: true,
      message: 'Usuario autenticado exitosamente',
      data: {
        user: usuario,
        token: token
      }
    });
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar usuario
const update = async (req, res) => {
  try {
    const { codigo_usu } = req.params;
    const { cod_tipo_usu, clave, estado, nombre, apellido } = req.body;

    if (!codigo_usu) {
      return res.status(400).json({
        success: false,
        message: 'El código del usuario es requerido'
      });
    }

    // Verificar que el usuario existe
    const existingUsuario = await Usuario.findById(codigo_usu);
    if (!existingUsuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuario = await Usuario.update(codigo_usu, {
      cod_tipo_usu,
      clave,
      estado,
      nombre,
      apellido
    });

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    if (error.message.includes('tipo de usuario especificado no existe')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar usuario
const deleteUsuario = async (req, res) => {
  try {
    const { codigo_usu } = req.params;

    if (!codigo_usu) {
      return res.status(400).json({
        success: false,
        message: 'El código del usuario es requerido'
      });
    }

    // Verificar que el usuario existe
    const existingUsuario = await Usuario.findById(codigo_usu);
    if (!existingUsuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await Usuario.delete(codigo_usu);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  create,
  findAll,
  findById,
  searchByName,
  findByTipoUsuario,
  findByEstado,
  authenticate,
  update,
  delete: deleteUsuario
};
