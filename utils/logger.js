const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Definir niveles de log personalizados
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
  }
};

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const { req, user, ...safeMeta } = meta;
    let log = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...safeMeta
    };

    // Agregar informaci?n de request si existe
    if (req) {
      log.request = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };
    }

    // Agregar informaci?n de usuario si existe
    if (user) {
      log.user = {
        id: user.codigo_usu,
        nombre: `${user.nombre} ${user.apellido}`
      };
    }

    return JSON.stringify(log, null, process.env.NODE_ENV === 'development' ? 2 : 0);
  })
);

// Transportes para diferentes tipos de logs
const transports = [
  // Log de errores
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d'
  }),

  // Log general
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
  }),

  // Log de HTTP requests
  new DailyRotateFile({
    filename: 'logs/http-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '14d'
  })
];

// Agregar console logging en desarrollo
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const { req, user, ...safeMeta } = meta;
          let output = `${timestamp} ${level}: ${message}`;
          if (req) {
            safeMeta.request = {
              method: req.method,
              url: req.originalUrl,
              ip: req.ip,
              userAgent: req.get('User-Agent')
            };
          }
          if (user) {
            safeMeta.user = {
              id: user.codigo_usu,
              nombre: `${user.nombre} ${user.apellido}`
            };
          }
          if (Object.keys(safeMeta).length > 0) {
            output += ` ${JSON.stringify(safeMeta, null, 2)}`;
          }
          return output;
        })
      )
    })
  );
}

// Crear logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: customFormat,
  transports,
  exitOnError: false
});

// Agregar colores a winston
winston.addColors(customLevels.colors);

// Middleware para logging de HTTP requests
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      req
    });
  });

  next();
};

// Función helper para logging con contexto
const logWithContext = (level, message, meta = {}) => {
  return (req = null, user = null, additionalMeta = {}) => {
    const logMeta = { ...meta, ...additionalMeta };

    if (req) {
      logMeta.req = req;
    }

    if (user) {
      logMeta.user = user;
    }

    logger.log(level, message, logMeta);
  };
};

module.exports = {
  logger,
  requestLogger,
  logWithContext,

  // Funciones de conveniencia
  error: logWithContext('error'),
  warn: logWithContext('warn'),
  info: logWithContext('info'),
  http: logWithContext('http'),
  debug: logWithContext('debug')
};