-- Script para crear las tablas necesarias para la API
-- Base de datos: practica_react_node

CREATE DATABASE IF NOT EXISTS practica_react_node;
USE practica_react_node;

-- Crear tabla tipo_usuario (aligned with TipoUsuario model)
CREATE TABLE IF NOT EXISTS tipo_usuario (
    cod_tipo_usu INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Crear tabla usuario (aligned with Usuario model)
CREATE TABLE IF NOT EXISTS usuario (
    codigo_usu INT PRIMARY KEY AUTO_INCREMENT,
    cod_tipo_usu INT NOT NULL,
    clave VARCHAR(255) NOT NULL,
    estado INT DEFAULT 1,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_tipo FOREIGN KEY (cod_tipo_usu) REFERENCES tipo_usuario(cod_tipo_usu) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Insertar datos de ejemplo para tipo_usuario
INSERT INTO tipo_usuario (descripcion) VALUES
('Administrador'),
('Usuario'),
('Moderador'),
('Invitado')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Insertar datos de ejemplo para usuario
INSERT INTO usuario (cod_tipo_usu, clave, estado, nombre, apellido) VALUES
(1, 'admin123', 1, 'Admin', 'Sistema'),
(2, 'user123', 1, 'Usuario', 'Ejemplo'),
(3, 'mod123', 1, 'Moderador', 'Ejemplo')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Mostrar las tablas creadas
SHOW TABLES;

-- Describir estructura de las tablas
DESCRIBE tipo_usuario;
DESCRIBE usuario;

-- Mostrar datos insertados
SELECT 'tipo_usuario' as tabla, COUNT(*) as registros FROM tipo_usuario
UNION ALL
SELECT 'usuario' as tabla, COUNT(*) as registros FROM usuario;