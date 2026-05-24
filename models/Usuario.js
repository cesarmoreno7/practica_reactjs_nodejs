const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const TipoUsuario = require('./TipoUsuario');

/**
 * Modelo de usuarios que incluye relaciones con TipoUsuario y manejo de claves.
 */
const Usuario = sequelize.define('Usuario', {
  codigo_usu: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cod_tipo_usu: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TipoUsuario,
      key: 'cod_tipo_usu',
    },
  },
  clave: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'usuario',
  underscored: true,
});

// Hook para hashear la clave antes de guardar
Usuario.beforeCreate(async (usuario) => {
  if (usuario.clave) {
    usuario.clave = await bcrypt.hash(usuario.clave, 10);
  }
});

// Hook para hashear la clave antes de actualizar si cambió
Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed('clave')) {
    usuario.clave = await bcrypt.hash(usuario.clave, 10);
  }
});

// Relaciones
Usuario.belongsTo(TipoUsuario, { foreignKey: 'cod_tipo_usu' });

// Métodos estáticos para facilitar el uso en controladores
const sequelizeFindAll = Usuario.findAll.bind(Usuario);

Usuario.findAllPaginated = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await Usuario.findAndCountAll({
    limit,
    offset,
    include: [{ model: TipoUsuario }],
    order: [['codigo_usu', 'ASC']]
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

Usuario.findAll = async (page, limit) => {
  if (Number.isInteger(page) && Number.isInteger(limit)) {
    return Usuario.findAllPaginated(page, limit);
  }
  if (page && typeof page === 'object') {
    return sequelizeFindAll(page);
  }
  return sequelizeFindAll({ include: [TipoUsuario] });
};

Usuario.findById = async (id) => {
  return Usuario.findByPk(id, { include: [TipoUsuario] });
};

Usuario.searchByName = async (term) => {
  return Usuario.findAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.like]: `%${term}%` } },
        { apellido: { [Op.like]: `%${term}%` } }
      ]
    },
    include: [TipoUsuario]
  });
};

Usuario.findByTipoUsuario = async (cod_tipo_usu) => {
  return Usuario.findAll({
    where: { cod_tipo_usu },
    include: [TipoUsuario]
  });
};

Usuario.findByEstado = async (estado) => {
  return Usuario.findAll({
    where: { estado },
    include: [TipoUsuario]
  });
};

Usuario.authenticate = async (codigo_usu, clave) => {
  const usuario = await Usuario.findByPk(codigo_usu, { include: [TipoUsuario] });
  if (!usuario || usuario.estado !== 1) return null;

  const isMatch = await bcrypt.compare(clave, usuario.clave);
  if (!isMatch) return null;

  return usuario;
};

Usuario.update = async (id, data) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return null;
  return usuario.update(data);
};

Usuario.delete = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return null;
  return usuario.destroy();
};

module.exports = Usuario;

