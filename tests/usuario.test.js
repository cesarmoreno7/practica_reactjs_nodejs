const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Usuario = require('../models/Usuario');
const TipoUsuario = require('../models/TipoUsuario');

describe('Usuario API Endpoints', () => {
  let testTipoUsuario;
  let authToken;

  beforeAll(async () => {
    // Crear un tipo de usuario de prueba
    testTipoUsuario = await TipoUsuario.create({ descripcion: 'Administrador' });
  });

  describe('POST /api/usuario/authenticate', () => {
    beforeAll(async () => {
      // Crear usuario de prueba para autenticación
      await Usuario.create({
        cod_tipo_usu: testTipoUsuario.cod_tipo_usu,
        clave: 'test123',
        estado: 1,
        nombre: 'Test',
        apellido: 'User'
      });
    });

    it('should authenticate user and return token', async () => {
      const response = await request(app)
        .post('/api/usuario/authenticate')
        .send({
          codigo_usu: 1, // El primer usuario creado tendrá código 1
          clave: 'test123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');

      authToken = response.body.data.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/usuario/authenticate')
        .send({
          codigo_usu: 1,
          clave: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/usuario', () => {
    it('should return paginated users when authenticated', async () => {
      const response = await request(app)
        .get('/api/usuario')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/usuario');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/usuario', () => {
    it('should create a new user when authenticated', async () => {
      const newUser = {
        cod_tipo_usu: testTipoUsuario.cod_tipo_usu,
        clave: 'newuser123',
        estado: 1,
        nombre: 'New',
        apellido: 'User'
      };

      const response = await request(app)
        .post('/api/usuario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('codigo_usu');
      expect(response.body.data.nombre).toBe('New');
    });

    it('should reject creation without authentication', async () => {
      const newUser = {
        cod_tipo_usu: testTipoUsuario.cod_tipo_usu,
        clave: 'newuser123',
        estado: 1,
        nombre: 'New',
        apellido: 'User'
      };

      const response = await request(app)
        .post('/api/usuario')
        .send(newUser);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/usuario/:codigo_usu', () => {
    it('should return user by ID when authenticated', async () => {
      const response = await request(app)
        .get('/api/usuario/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('codigo_usu', 1);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/usuario/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});