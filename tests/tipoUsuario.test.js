const request = require('supertest');
const app = require('../server');
const TipoUsuario = require('../models/TipoUsuario');

describe('TipoUsuario API Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    // Crear usuario y obtener token para autenticación
    const tipoUsuario = await TipoUsuario.create({ descripcion: 'Admin' });
    const Usuario = require('../models/Usuario');

    await Usuario.create({
      cod_tipo_usu: tipoUsuario.cod_tipo_usu,
      clave: 'admin123',
      estado: 1,
      nombre: 'Admin',
      apellido: 'Test'
    });

    // Autenticar y obtener token
    const authResponse = await request(app)
      .post('/api/usuario/authenticate')
      .send({ codigo_usu: 1, clave: 'admin123' });

    authToken = authResponse.body.data.token;
  });

  describe('GET /api/tipo-usuario', () => {
    it('should return paginated tipos de usuario when authenticated', async () => {
      const response = await request(app)
        .get('/api/tipo-usuario')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/tipo-usuario');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/tipo-usuario', () => {
    it('should create a new tipo de usuario when authenticated', async () => {
      const newTipo = { descripcion: 'Empleado' };

      const response = await request(app)
        .post('/api/tipo-usuario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTipo);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cod_tipo_usu');
      expect(response.body.data.descripcion).toBe('Empleado');
    });

    it('should reject creation without authentication', async () => {
      const newTipo = { descripcion: 'Test' };

      const response = await request(app)
        .post('/api/tipo-usuario')
        .send(newTipo);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tipo-usuario/:cod_tipo_usu', () => {
    it('should return tipo de usuario by ID when authenticated', async () => {
      const response = await request(app)
        .get('/api/tipo-usuario/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cod_tipo_usu', 1);
    });

    it('should return 404 for non-existent tipo de usuario', async () => {
      const response = await request(app)
        .get('/api/tipo-usuario/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/tipo-usuario/:cod_tipo_usu', () => {
    it('should update tipo de usuario when authenticated', async () => {
      const updateData = { descripcion: 'Administrador Senior' };

      const response = await request(app)
        .put('/api/tipo-usuario/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.descripcion).toBe('Administrador Senior');
    });
  });

  describe('DELETE /api/tipo-usuario/:cod_tipo_usu', () => {
    it('should delete tipo de usuario when authenticated and not referenced', async () => {
      // Crear un tipo que no tenga usuarios asociados
      const tipoToDelete = await TipoUsuario.create({ descripcion: 'Temporal' });

      const response = await request(app)
        .delete(`/api/tipo-usuario/${tipoToDelete.cod_tipo_usu}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject deletion of tipo de usuario with associated users', async () => {
      const response = await request(app)
        .delete('/api/tipo-usuario/1') // Este tiene usuarios asociados
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500); // Error interno del servidor
      expect(response.body.success).toBe(false);
    });
  });
});