/**
 * JWT middleware helpers: the authentication guard verifies tokens,
 * while generateToken issues signed tokens that the client stores.
 */
const jwt = require('jsonwebtoken');

/**
 * Middleware that enforces a Bearer token on incoming requests.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Encapsulates the payload shape and signing options for issued JWTs.
 */
const generateToken = (userData) => {
  return jwt.sign(
    {
      codigo_usu: userData.codigo_usu,
      nombre: userData.nombre,
      apellido: userData.apellido,
      cod_tipo_usu: userData.cod_tipo_usu
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};
