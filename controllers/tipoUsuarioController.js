const TipoUsuario = require('../models/TipoUsuario');

/**
 * Controller that orchestrates CRUD for user types,
 * handling validation, existence checks, and error responses.
 */

/**
 * Validates the description and delegates creation to the model.
 */
const create = async (req, res) => {
  try {
    const { descripcion } = req.body;

    if (!descripcion) {
      return res.status(400).json({
        success: false,
        message: 'La descripción es requerida'
      });
    }

    const tipoUsuario = await TipoUsuario.create({ descripcion });

    res.status(201).json({
      success: true,
      message: 'Tipo de usuario creado exitosamente',
      data: tipoUsuario
    });
  } catch (error) {
    console.error('Error al crear tipo de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Returns paginated results after validating query parameters.
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

    const result = await TipoUsuario.findAll(page, limit);

    res.status(200).json({
      success: true,
      message: 'Tipos de usuario obtenidos exitosamente',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error al obtener tipos de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener tipo de usuario por ID
const findById = async (req, res) => {
  try {
    const { cod_tipo_usu } = req.params;

    if (!cod_tipo_usu) {
      return res.status(400).json({
        success: false,
        message: 'El código del tipo de usuario es requerido'
      });
    }

    const tipoUsuario = await TipoUsuario.findById(cod_tipo_usu);

    if (!tipoUsuario) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tipo de usuario obtenido exitosamente',
      data: tipoUsuario
    });
  } catch (error) {
    console.error('Error al obtener tipo de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar tipos de usuario por descripción
const searchByDescription = async (req, res) => {
  try {
    const { term } = req.params;

    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda es requerido'
      });
    }

    const tiposUsuario = await TipoUsuario.searchByDescription(term);

    res.status(200).json({
      success: true,
      message: `Búsqueda de tipos de usuario por: "${term}"`,
      data: tiposUsuario
    });
  } catch (error) {
    console.error('Error al buscar tipos de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar tipo de usuario
const update = async (req, res) => {
  try {
    const { cod_tipo_usu } = req.params;
    const { descripcion } = req.body;

    if (!cod_tipo_usu) {
      return res.status(400).json({
        success: false,
        message: 'El código del tipo de usuario es requerido'
      });
    }

    if (!descripcion) {
      return res.status(400).json({
        success: false,
        message: 'La descripción es requerida'
      });
    }

    // Verificar que el tipo de usuario existe
    const existingTipoUsuario = await TipoUsuario.findById(cod_tipo_usu);
    if (!existingTipoUsuario) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de usuario no encontrado'
      });
    }

    const tipoUsuario = await TipoUsuario.update(cod_tipo_usu, { descripcion });

    res.status(200).json({
      success: true,
      message: 'Tipo de usuario actualizado exitosamente',
      data: tipoUsuario
    });
  } catch (error) {
    console.error('Error al actualizar tipo de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar tipo de usuario
const deleteTipoUsuario = async (req, res) => {
  try {
    const { cod_tipo_usu } = req.params;

    if (!cod_tipo_usu) {
      return res.status(400).json({
        success: false,
        message: 'El código del tipo de usuario es requerido'
      });
    }

    // Verificar que el tipo de usuario existe
    const existingTipoUsuario = await TipoUsuario.findById(cod_tipo_usu);
    if (!existingTipoUsuario) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de usuario no encontrado'
      });
    }

    await TipoUsuario.delete(cod_tipo_usu);

    res.status(200).json({
      success: true,
      message: 'Tipo de usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tipo de usuario:', error);

    if (error.message.includes('usuarios asociados')) {
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

module.exports = {
  create,
  findAll,
  findById,
  searchByDescription,
  update,
  delete: deleteTipoUsuario
};
