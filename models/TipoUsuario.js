const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de tipos de usuario que mantiene la descripción y asegura claves únicas.
 */
const TipoUsuario = sequelize.define('TipoUsuario', {
  cod_tipo_usu: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
  tableName: 'tipo_usuario',
  underscored: true,
});

// Métodos estáticos para facilitar el uso en controladores
const sequelizeFindAll = TipoUsuario.findAll.bind(TipoUsuario);

TipoUsuario.findAllPaginated = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await TipoUsuario.findAndCountAll({
    limit,
    offset,
    order: [['cod_tipo_usu', 'ASC']]
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

// Sobrescribimos el método findAll del controlador para usar el paginado
// Nota: El controlador llama a TipoUsuario.findAll(page, limit)
TipoUsuario.findAll = async (page, limit) => {
  if (Number.isInteger(page) && Number.isInteger(limit)) {
    return TipoUsuario.findAllPaginated(page, limit);
  }
  if (page && typeof page === 'object') {
    return sequelizeFindAll(page);
  }
  return sequelizeFindAll();
};

TipoUsuario.findById = async (id) => {
  return TipoUsuario.findByPk(id);
};

TipoUsuario.searchByDescription = async (term) => {
  return TipoUsuario.findAll({
    where: {
      descripcion: {
        [Op.like]: `%${term}%`
      }
    }
  });
};

TipoUsuario.update = async (id, data) => {
  const tipo = await TipoUsuario.findByPk(id);
  if (!tipo) return null;
  return tipo.update(data);
};

TipoUsuario.delete = async (id) => {
  const tipo = await TipoUsuario.findByPk(id);
  if (!tipo) return null;
  
  // Verificar si hay usuarios asociados (esto lo manejaría la DB con RESTRICT, pero podemos ser explícitos)
  const Usuario = require('./Usuario');
  const count = await Usuario.count({ where: { cod_tipo_usu: id } });
  if (count > 0) {
    throw new Error('No se puede eliminar: existen usuarios asociados a este tipo');
  }
  
  return tipo.destroy();
};

module.exports = TipoUsuario;

